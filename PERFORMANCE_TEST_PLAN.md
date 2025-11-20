# 프론트엔드 성능 최적화 테스트 계획서

## 📋 목차
1. [테스트 목적](#테스트-목적)
2. [테스트 환경](#테스트-환경)
3. [측정 도구](#측정-도구)
4. [테스트 시나리오](#테스트-시나리오)
5. [예상 결과](#예상-결과)
6. [테스트 체크리스트](#테스트-체크리스트)

---

## 테스트 목적

프론트엔드 코드베이스에 적용된 **성능 최적화 기법**들의 실제 효과를 정량적으로 측정하고, 최적화 전후 비교를 통해 개선 효과를 검증합니다.

### 주요 최적화 항목
1. **Pending + Debounce + Optimistic UI** (DashboardPage)
2. **React State 제거로 실시간 차트 최적화** (NetworkChartCard)
3. **Map/Set 기반 O(1) 조회 최적화**
4. **Time-Series 메모리 제한** (60개)
5. **병렬 API 호출** (Promise.allSettled)
6. **중복 업데이트 방지**
7. **WebSocket 스마트 구독 관리**

---

## 테스트 환경

### 하드웨어
- **CPU**: 최소 4 Core
- **메모리**: 최소 8GB
- **네트워크**: 안정적인 연결 (100Mbps 이상)

### 소프트웨어
- **브라우저**: Chrome 최신 버전 (성능 측정 도구 내장)
- **Node.js**: v18 이상
- **백엔드**: 로컬 또는 개발 서버 (동일한 환경에서 테스트)

### 데이터 환경
- **컨테이너 수**: 10개, 50개, 100개 (3단계로 테스트)
- **WebSocket**: 1초 간격 실시간 데이터 수신
- **REST API**: 평균 응답 시간 200-500ms

---

## 측정 도구

### 1. Chrome DevTools Performance
- **Flame Chart**: 렌더링 시간 측정
- **Main Thread**: JavaScript 실행 시간
- **FPS Meter**: 프레임 레이트 (60fps 목표)

### 2. Chrome DevTools Memory
- **Heap Snapshot**: 메모리 사용량 측정
- **Allocation Timeline**: 메모리 누수 확인

### 3. Network Tab
- **API 호출 횟수**: 최적화 전후 비교
- **Total Data Transfer**: 데이터 전송량

### 4. Console API
```javascript
// 성능 측정 코드
console.time('operation');
// ... 작업 수행
console.timeEnd('operation');

// 메모리 측정
console.log(performance.memory);
```

### 5. React DevTools Profiler
- **Component Render Count**: 리렌더링 횟수
- **Render Duration**: 렌더링 소요 시간

---

## 테스트 시나리오

### 시나리오 1: Pending + Debounce + Optimistic UI
**페이지**: DashboardPage (`/dashboard`)

#### 테스트 케이스 1-1: 빠른 컨테이너 선택 (Debounce 효과)

**최적화 전 (시뮬레이션)**
```javascript
// handleSelectContainer에서 debounce 제거
const handleSelectContainer = async (id: string) => {
  // 즉시 API 호출
  const [metrics, network, blockIO] = await Promise.all([...]);
}
```

**최적화 후 (현재 코드)**
```javascript
const handleSelectContainer = useMemo(
  () => debounce(async (id: string) => {
    // 100ms debounce 적용
  }, 100),
  [validContainers, updateContainer]
);
```

**테스트 절차**
1. Dashboard 페이지 접속
2. Chrome DevTools Network 탭 열기
3. **5개 컨테이너를 0.5초 이내에 순차적으로 클릭**
4. API 호출 횟수 측정
5. 최종 선택된 컨테이너의 데이터 로딩 시간 측정

**측정 항목**
| 항목 | 최적화 전 (예상) | 최적화 후 (목표) |
|------|-----------------|-----------------|
| API 호출 횟수 | 15회 (5 × 3) | 3회 (1 × 3) |
| 총 네트워크 시간 | ~5-7초 | ~1초 |
| 불필요한 API 절감률 | - | **80%** |

---

#### 테스트 케이스 1-2: Optimistic UI 체감 속도

**테스트 절차**
1. Dashboard 페이지에서 컨테이너 선택
2. **UI 반응 시간 측정** (클릭 → 상세 패널 표시)
3. Performance 탭에서 Time to Interactive 확인

**측정 항목**
| 항목 | 최적화 전 (예상) | 최적화 후 (목표) |
|------|-----------------|-----------------|
| 체감 응답 시간 | 1-2초 (API 대기) | **0ms (즉시)** |
| 실제 데이터 로딩 | 1-2초 | 1초 (백그라운드) |
| 사용자 차단 시간 | 1-2초 | 0ms |

**검증 방법**
```javascript
// src/pages/DashboardPage/ui/DashboardPage.tsx:221-222
// 1. Store 데이터로 즉시 표시
console.time('Optimistic UI');
setSelectedContainerDetail(mapToDetailPanel(containerDTO));
console.timeEnd('Optimistic UI'); // 목표: <10ms

// 2. 백그라운드 API 호출
console.time('Background API');
const [metrics, network, blockIO] = await Promise.all([...]);
console.timeEnd('Background API'); // 1초 이내
```

---

### 시나리오 2: React State 제거로 실시간 차트 최적화
**컴포넌트**: NetworkChartCard (`/dashboard` 상세 패널)

#### 테스트 케이스 2-1: 실시간 차트 렌더링 성능

**최적화 전 (시뮬레이션)**
```javascript
// state 사용 (매 업데이트마다 리렌더링)
const [chartData, setChartData] = useState([]);

useEffect(() => {
  // WebSocket 데이터 수신마다 state 업데이트
  setChartData(newData); // 리렌더링 발생!
}, [websocketData]);
```

**최적화 후 (현재 코드)**
```javascript
// Ref 사용 (리렌더링 없음)
const timelineRef = useRef({ rx: new Map(), tx: new Map() });
const bufferRef = useRef({ rx: [], tx: [] });

// Chart.js onRefresh에서 직접 데이터 push (React 렌더링 우회)
realtime: {
  onRefresh: (chart) => {
    rxDataset.push(...bufferRef.current.rx);
  }
}
```

**테스트 절차**
1. Dashboard에서 컨테이너 선택하여 상세 패널 열기
2. **Network Chart가 실시간 업데이트되는 상태에서 측정**
3. Chrome DevTools Performance 탭에서 60초 녹화
4. FPS Meter 확인

**측정 항목**
| 항목 | 최적화 전 (예상) | 최적화 후 (목표) |
|------|-----------------|-----------------|
| FPS | 30-45 fps | **60 fps** |
| 1초당 리렌더링 횟수 | 1회 | 0회 |
| JavaScript 실행 시간 | ~50ms/s | <10ms/s |
| 메모리 할당 | 증가 추세 | 일정 유지 |

**검증 방법**
```javascript
// React DevTools Profiler 사용
// NetworkChartCard 컴포넌트 선택
// Profiler 탭에서 60초간 렌더링 횟수 확인
// 목표: 0회 (또는 props 변경 시만)
```

---

### 시나리오 3: Map/Set 기반 O(1) 조회 최적화
**훅**: useContainerMetricsWebSocket

#### 테스트 케이스 3-1: 대량 컨테이너 조회 성능

**최적화 전 (시뮬레이션)**
```javascript
// 배열 find() 사용 - O(n)
const [metricsArray, setMetricsArray] = useState([]);
const metric = metricsArray.find(m => m.containerId === id); // O(n)
```

**최적화 후 (현재 코드)**
```javascript
// Map 사용 - O(1)
const [metricsMap, setMetricsMap] = useState(new Map());
const metric = metricsMap.get(id); // O(1)
```

**테스트 절차**
1. **100개 컨테이너 환경** 준비
2. Manage Containers 페이지에서 10개 선택
3. CPU 탭에서 성능 측정

**측정 항목**
| 컨테이너 수 | 최적화 전 (배열 find) | 최적화 후 (Map.get) | 개선율 |
|------------|---------------------|-------------------|--------|
| 10개 | ~5ms | ~0.5ms | 10배 |
| 50개 | ~25ms | ~0.5ms | 50배 |
| 100개 | ~50ms | ~0.5ms | **100배** |

**검증 방법**
```javascript
// src/features/container/hooks/useContainerMetricsWebSocket.ts
console.time('Map.get');
const metric = metricsMap.get(containerId);
console.timeEnd('Map.get'); // <1ms

// vs 배열 find (시뮬레이션)
console.time('Array.find');
const metric = metricsArray.find(m => m.containerId === containerId);
console.timeEnd('Array.find'); // 컨테이너 수에 비례
```

---

### 시나리오 4: Time-Series 메모리 제한 (60개)
**Store**: useContainerStore

#### 테스트 케이스 4-1: 장시간 실행 시 메모리 안정성

**최적화 전 (시뮬레이션)**
```javascript
// 무제한 time-series 적출
const updated = [...existing, newPoint]; // 계속 증가
return updated;
```

**최적화 후 (현재 코드)**
```javascript
function mergeTimeSeries(..., maxPoints = 60) {
  const updated = [...existing, newPoint];
  return updated.slice(-maxPoints); // 최신 60개만 유지
}
```

**테스트 절차**
1. Dashboard 페이지에서 컨테이너 선택
2. **10분간 실시간 데이터 수신** (600개 데이터 포인트 발생)
3. Chrome DevTools Memory 탭에서 Heap Snapshot 촬영
   - 0분, 5분, 10분에 각각 촬영
4. 메모리 사용량 추이 확인

**측정 항목**
| 시간 | 최적화 전 (예상) | 최적화 후 (목표) |
|------|-----------------|-----------------|
| 0분 | 10 MB | 10 MB |
| 5분 | 50 MB | 10-12 MB |
| 10분 | 100 MB | 10-12 MB |
| 메모리 증가율 | 선형 증가 | **일정 유지** |

**검증 방법**
```javascript
// Chrome DevTools Console에서
setInterval(() => {
  console.log('Memory:', {
    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
    timestamp: new Date().toISOString(),
  });
}, 60000); // 1분마다
```

---

### 시나리오 5: 병렬 API 호출 (Promise.allSettled)
**훅**: useContainerInitialMetrics

#### 테스트 케이스 5-1: 초기 데이터 로딩 속도

**최적화 전 (시뮬레이션)**
```javascript
// 순차 호출
for (const id of containerIds) {
  const data = await containerApi.getContainerMetrics(id);
  // 각 호출이 1초 소요
}
```

**최적화 후 (현재 코드)**
```javascript
// 병렬 호출
const promises = containerIds.map(id =>
  containerApi.getContainerMetrics(id)
);
const results = await Promise.allSettled(promises);
```

**테스트 절차**
1. Manage Containers 페이지 접속
2. **10개 컨테이너 동시 선택**
3. Network 탭에서 API 호출 패턴 확인
4. 로딩 완료 시간 측정

**측정 항목**
| 컨테이너 수 | 최적화 전 (순차) | 최적화 후 (병렬) | 개선율 |
|------------|-----------------|-----------------|--------|
| 5개 | 5초 | 1초 | 5배 |
| 10개 | 10초 | 1초 | **10배** |
| 20개 | 20초 | 1-2초 | **10-20배** |

**검증 방법**
```javascript
// src/features/container/hooks/useContainerInitialMetrics.ts:57-65
console.time('Parallel API Calls');
const promises = containerIds.map((id) =>
  containerApi.getContainerMetrics(id, {...})
);
const results = await Promise.allSettled(promises);
console.timeEnd('Parallel API Calls'); // 목표: 1-2초
```

---

### 시나리오 6: 중복 업데이트 방지
**훅**: useContainerMetricsWebSocket

#### 테스트 케이스 6-1: WebSocket 메시지 수신 시 리렌더링 최소화

**최적화 전 (시뮬레이션)**
```javascript
// 무조건 새 Map 생성
setMetricsMap((prev) => {
  const newMap = new Map(prev);
  newMap.set(containerId, data); // 값이 같아도 업데이트
  return newMap;
});
```

**최적화 후 (현재 코드)**
```javascript
setMetricsMap((prev) => {
  const existing = prev.get(containerId);

  // 값이 동일하면 Map 참조 유지 (리렌더링 없음)
  if (existing && cpuSame && memSame && netSame) {
    return prev; // 참조 유지
  }

  const newMap = new Map(prev);
  newMap.set(containerId, data);
  return newMap;
});
```

**테스트 절차**
1. Manage Containers에서 5개 선택
2. React DevTools Profiler 시작
3. **60초간 WebSocket 메시지 수신** (60개 메시지)
4. CPU 탭 컴포넌트 리렌더링 횟수 확인

**측정 항목**
| 항목 | 최적화 전 (예상) | 최적화 후 (목표) |
|------|-----------------|-----------------|
| 60초간 메시지 수 | 60개 | 60개 |
| 실제 데이터 변경 | 30-40회 | 30-40회 |
| 컴포넌트 리렌더링 | 60회 | 30-40회 |
| 리렌더링 절감률 | - | **30-50%** |

**검증 방법**
```javascript
// React DevTools Profiler에서
// CPUTab 컴포넌트 선택
// "Highlight updates when components render" 활성화
// 60초간 깜빡임 횟수 카운트
```

---

### 시나리오 7: WebSocket 스마트 구독 관리
**훅**: useContainerMetricsWebSocket

#### 테스트 케이스 7-1: 컨테이너 선택 변경 시 구독 최적화

**최적화 전 (시뮬레이션)**
```javascript
// 전체 재구독
useEffect(() => {
  // 기존 구독 모두 해제
  subscriptions.forEach(unsub);

  // 새로 모두 구독
  containerIds.forEach(subscribe);
}, [containerIds]);
```

**최적화 후 (현재 코드)**
```javascript
useEffect(() => {
  const addedIds = [...currentIds].filter(id => !subscribedIds.has(id));
  const removedIds = [...subscribedIds].filter(id => !currentIds.has(id));

  addedIds.forEach(subscribe);   // 추가된 것만
  removedIds.forEach(unsubscribe); // 제거된 것만
}, [containerIds]);
```

**테스트 절차**
1. Manage Containers에서 [1, 2, 3, 4, 5] 선택
2. [1, 2, 3, 4, **6**]으로 변경 (5 해제, 6 추가)
3. Network WS 탭에서 구독 메시지 확인

**측정 항목**
| 변경 사항 | 최적화 전 (전체 재구독) | 최적화 후 (증분) |
|----------|----------------------|-----------------|
| 선택: [1,2,3,4,5] → [1,2,3,4,6] | 해제 5개 + 구독 5개 = 10회 | 해제 1개 + 구독 1개 = **2회** |
| 선택: [1,2,3] → [1,2,3,4,5,6,7] | 해제 3개 + 구독 7개 = 10회 | 구독 4개 = **4회** |
| 불필요한 통신 절감률 | - | **80-90%** |

**검증 방법**
```javascript
// src/features/container/hooks/useContainerMetricsWebSocket.ts:145-151
// Console 로그 확인
console.log('[Container Metrics WebSocket] Subscriptions updated:', {
  added: addedIds,    // 목표: 실제 추가된 것만
  removed: removedIds, // 목표: 실제 제거된 것만
});
```

---

## 예상 결과

### 정량적 목표

| 최적화 항목 | 측정 지표 | 목표 개선율 |
|-----------|---------|-----------|
| Debounce | API 호출 횟수 | 80% 감소 |
| Optimistic UI | 체감 응답 시간 | 즉시 (0ms) |
| React State 제거 | FPS | 60 fps 유지 |
| Map/Set 조회 | 조회 속도 | 100배 향상 |
| Time-Series 제한 | 메모리 사용량 | 일정 유지 |
| 병렬 API 호출 | 로딩 시간 | 10배 단축 |
| 중복 업데이트 방지 | 리렌더링 횟수 | 30-50% 감소 |
| 스마트 구독 | WebSocket 통신 | 80-90% 감소 |

### 정성적 목표
- 사용자가 **지연 없이** UI 조작 가능
- **장시간 실행** 시에도 성능 저하 없음
- **대량 데이터** 환경에서도 안정적 동작
- 개발자 도구에서 **경고 없음**

---

## 테스트 체크리스트

### 사전 준비
- [ ] Chrome 최신 버전 설치
- [ ] React DevTools 설치
- [ ] 백엔드 서버 실행 중
- [ ] 테스트 데이터 준비 (컨테이너 10개, 50개, 100개)
- [ ] 브라우저 캐시 비우기
- [ ] 다른 탭 모두 닫기 (성능 측정 정확도 향상)

### 시나리오별 체크리스트

#### [ ] 시나리오 1: Pending + Debounce + Optimistic UI
- [ ] 1-1: 빠른 컨테이너 선택 (API 호출 횟수 측정)
- [ ] 1-2: Optimistic UI 체감 속도 (반응 시간 측정)

#### [ ] 시나리오 2: React State 제거
- [ ] 2-1: 실시간 차트 FPS 측정 (60fps 목표)
- [ ] 2-1: 리렌더링 횟수 확인 (0회 목표)

#### [ ] 시나리오 3: Map/Set 최적화
- [ ] 3-1: 10개 컨테이너 조회 속도
- [ ] 3-1: 50개 컨테이너 조회 속도
- [ ] 3-1: 100개 컨테이너 조회 속도

#### [ ] 시나리오 4: Time-Series 메모리 제한
- [ ] 4-1: 10분간 메모리 사용량 추이 확인
- [ ] 4-1: Heap Snapshot 3회 촬영 (0분, 5분, 10분)

#### [ ] 시나리오 5: 병렬 API 호출
- [ ] 5-1: 5개 컨테이너 로딩 시간
- [ ] 5-1: 10개 컨테이너 로딩 시간
- [ ] 5-1: 20개 컨테이너 로딩 시간

#### [ ] 시나리오 6: 중복 업데이트 방지
- [ ] 6-1: 60초간 리렌더링 횟수 측정

#### [ ] 시나리오 7: 스마트 구독 관리
- [ ] 7-1: 컨테이너 선택 변경 시 WebSocket 메시지 확인

### 결과 정리
- [ ] 각 시나리오별 측정 결과 스프레드시트 작성
- [ ] 스크린샷 캡처 (Performance Timeline, Memory Heap)
- [ ] 개선율 계산
- [ ] 발표 자료 준비

---

## 테스트 결과 템플릿

```markdown
## 테스트 결과 - [시나리오명]

### 환경
- 테스트 일시: YYYY-MM-DD HH:MM
- 브라우저: Chrome xxx.x.xxxx.xx
- 컨테이너 수: XX개

### 측정 결과
| 측정 항목 | 최적화 전 | 최적화 후 | 개선율 |
|----------|----------|----------|--------|
| [항목1] | XX | XX | XX% |
| [항목2] | XX | XX | XX% |

### 스크린샷
![Performance Timeline](./screenshots/performance-xxx.png)
![Memory Heap](./screenshots/memory-xxx.png)

### 관찰 사항
- [특이사항 1]
- [특이사항 2]

### 결론
✅ 목표 달성 / ❌ 미달성
```

---

## 참고 자료

### Chrome DevTools 사용법
- [Performance 분석](https://developer.chrome.com/docs/devtools/performance/)
- [Memory 프로파일링](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Network 모니터링](https://developer.chrome.com/docs/devtools/network/)

### React DevTools
- [Profiler 사용법](https://react.dev/learn/react-developer-tools#profiler)

### 성능 측정 Best Practices
- 각 테스트를 최소 3회 반복하여 평균값 사용
- 브라우저 재시작 후 테스트 (캐시 영향 제거)
- 시크릿 모드 사용 (확장 프로그램 영향 제거)
- 동일한 네트워크 환경에서 테스트

---

**작성일**: 2025-11-20
**작성자**: Claude Code
**버전**: 1.0
