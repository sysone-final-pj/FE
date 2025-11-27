# Monito Frontend

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-5.0-443E38)
![Chart.js](https://img.shields.io/badge/Chart.js-3.9-FF6384?logo=chartdotjs)

> 실시간 Docker 컨테이너 모니터링 시스템의 프론트엔드 애플리케이션

## 핵심 특징

- ⚡ **실시간 WebSocket (STOMP) 모니터링** - 50개 컨테이너를 1초 간격으로 업데이트
- 🏗️ **Feature-Sliced Design (FSD)** - 확장 가능한 계층형 아키텍처
- 🔄 **Zustand 상태 관리** - Redux DevTools + localStorage 영속화
- 📊 **실시간/히스토리 차트** - Chart.js 기반 스트리밍 & 정적 차트
- 📋 **Handsontable 데이터 그리드** - CSV 내보내기 지원 (43개 메트릭 필드)

---

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+
- npm 9+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 환경 변수 설정

`.env.development.local` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8081/api/
VITE_WS_BASE_URL=http://localhost:8081
```

---

## 🏗️ 아키텍처

### Feature-Sliced Design (FSD)

프로젝트는 **계층형 아키텍처**를 따릅니다:

```
src/
├── shared/       # 공통 유틸리티, API, 스토어, UI 컴포넌트
├── entities/     # 도메인 엔티티 (agent, container, alert, user)
├── features/     # 비즈니스 로직 (WebSocket hooks, mappers)
├── widgets/      # 복합 컴포넌트 (tables, modals, panels)
└── pages/        # 페이지 레벨 컴포넌트 (라우트)
```

**의존성 규칙**: 상위 레이어 → 하위 레이어만 import 가능
`pages → widgets → features → entities → shared`

### 데이터 흐름

```
WebSocket (/topic/dashboard/list)
    ↓
Feature Hook (useDashboardWebSocket)
    ↓
Zustand Store (useContainerStore)
    ↓
Mapper (containerMapper.ts)
    ↓
UI Components (DashboardCard)
```

---

## 🛠️ 기술 스택

### 코어

- **React 18.3** - UI 라이브러리
- **TypeScript 5.9** - 타입 안전성
- **Vite 7.1** - 빌드 도구 (HMR, 빠른 개발 서버)

### 상태 관리

- **Zustand 5.0** - 경량 상태 관리 라이브러리
  - `devtools` 미들웨어 (Redux DevTools 통합)
  - `persist` 미들웨어 (localStorage 영속화)
- **4개의 글로벌 스토어**:
  - `useAlertStore` - 알림 관리
  - `useAgentStore` - 에이전트 데이터
  - `useContainerStore` - 컨테이너 데이터 + 시계열
  - `useWebSocketStore` - WebSocket 연결 상태

### 실시간 통신

- **@stomp/stompjs 7.2** - WebSocket over STOMP
- **sockjs-client 1.6** - WebSocket 폴백 지원
- **Singleton 패턴**: `StompClientManager` (자동 재연결)

### 데이터 시각화

- **Chart.js 3.9** - 차트 라이브러리
  - `chartjs-plugin-streaming` - 실시간 스트리밍 차트
  - `chartjs-adapter-date-fns` - 시간축 포매팅
- **Handsontable 16.1** - 엑셀 스타일 데이터 그리드 (CSV 내보내기)

### HTTP 클라이언트

- **Axios 1.12** - REST API 통신
  - **Request Interceptor**: JWT 자동 주입
  - **Response Interceptor**: 401 처리 + 자동 로그아웃

### UI/스타일링

- **Tailwind CSS 3.4** - 유틸리티 퍼스트 CSS 프레임워크
  - 커스텀 테마 (primary, state colors)
  - Pretendard 폰트 (한국어 최적화)
- **Lucide React 0.546** - 아이콘 라이브러리
- **React DatePicker 8.8** - 날짜 선택기

### 라우팅

- **React Router DOM 6.30** - 클라이언트 사이드 라우팅
  - Protected Routes (JWT 검증)
  - Role-based Access Control (ADMIN 전용 경로)

---

## 📁 프로젝트 구조

```
FE/
├── src/
│   ├── shared/              # 공통 레이어
│   │   ├── api/             # Axios 인스턴스, API 클라이언트
│   │   ├── stores/          # Zustand 스토어 (4개)
│   │   ├── hooks/           # useWebSocket, 공통 hooks
│   │   ├── lib/             # 유틸리티 (authToken, formatters, chartUtils)
│   │   │   ├── errors/      # 에러 파싱 로직
│   │   │   └── websocket/   # StompClientManager (싱글톤)
│   │   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   └── types/           # 공통 타입 정의
│   │
│   ├── entities/            # 도메인 엔티티
│   │   ├── agent/
│   │   ├── alert/
│   │   ├── container/
│   │   ├── history/
│   │   └── user/
│   │
│   ├── features/            # 기능별 비즈니스 로직
│   │   ├── dashboard/
│   │   │   ├── hooks/       # useDashboardWebSocket, useDashboardDetailWebSocket
│   │   │   └── lib/         # containerMapper, detailPanelMapper
│   │   ├── alerts/
│   │   └── containers/
│   │
│   ├── widgets/             # 복합 컴포넌트
│   │   ├── Header/
│   │   ├── DashboardDetailPanel/
│   │   ├── ContainersTable/
│   │   └── MetricsTables/   # CPU, Memory, Network, BlockIO 탭
│   │
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── DashboardPage/   # 실시간 모니터링 대시보드
│   │   ├── ContainersPage/  # 컨테이너 관리
│   │   ├── AlertsPage/      # 알림 관리
│   │   ├── HistoryPage/     # 히스토리 데이터 (Handsontable)
│   │   ├── ManageAgentsPage/
│   │   ├── ManageUsersPage/ # ADMIN 전용
│   │   └── MyPage/
│   │
│   ├── App.tsx              # 라우팅 설정
│   ├── ProtectedRoute.tsx   # 인증 가드
│   └── index.css            # Tailwind + 글로벌 스타일
│
├── .github/                 # GitHub Actions (배포 자동화)
├── vite.config.ts           # Vite 설정 (프록시, alias)
├── tailwind.config.js       # Tailwind 테마 설정
├── tsconfig.app.json        # TypeScript 설정
└── CLAUDE.md                # AI 개발 가이드
```

---

## ✨ 핵심 기능

### 1. 실시간 대시보드

- **WebSocket 기반**: 50개 컨테이너를 1초 간격으로 업데이트
- **실시간 차트**: CPU, Memory, Network, Block I/O (2분 타임윈도우)
- **상세 패널**: 컨테이너 선택 시 세부 메트릭 표시
- **Dual Store 아키텍처**: 깜빡임 없는 데이터 업데이트 ([CLAUDE.md](CLAUDE.md#troubleshooting-container-detail-flickering-issue) 참고)

### 2. 히스토리 분석

- **시간 범위 조회**: 5분 ~ 7일 (Quick/Custom 필터)
- **히스토리 차트**: REST API 기반 정적 차트
- **데이터 그리드**: Handsontable (43개 메트릭 필드)
- **CSV 내보내기**: 선택 기간 데이터 다운로드

### 3. 알림 시스템

- **사용자별 알림**: `/user/queue/alerts` (개인 큐)
- **실시간 토스트**: 새 알림 즉시 표시
- **알림 히스토리**: 읽음/읽지 않음 상태 관리
- **localStorage 영속화**: 페이지 새로고침 후에도 유지

### 4. 컨테이너 관리

- **필터링**: 상태, 이름, 호스트별 검색
- **정렬**: CPU, Memory, 이름, 상태
- **즐겨찾기**: 자주 보는 컨테이너 저장
- **삭제된 컨테이너**: 히스토리 조회

### 5. 에이전트/사용자 관리 (ADMIN)

- **에이전트 등록/삭제**: Docker Host 모니터링 설정
- **사용자 관리**: CRUD, 역할 관리 (ADMIN/USER)
- **Role-based Access**: ProtectedRoute 기반 권한 제어

---

## 🔌 WebSocket 아키텍처

### Singleton STOMP Client

모든 WebSocket 연결은 **단일 인스턴스**로 관리됩니다:

```typescript
// shared/lib/websocket/stompClient.ts
import { stompClient } from '@/shared/lib/websocket/stompClient';

// 전역 연결 (자동 재연결)
stompClient.connect();
stompClient.subscribe('/topic/dashboard/list', callback);
```

### WebSocket 토픽 (Destinations)

```typescript
// Broadcast Topics (전체 사용자)
'/topic/dashboard/list'                    // 모든 컨테이너 요약
'/topic/containers/summary'                // 컨테이너 목록 (관리)
'/topic/dashboard/detail/{containerId}'    // 컨테이너 상세 메트릭
'/topic/containers/{containerId}/metrics'  // 메트릭 스트림

// User-specific Topics (개인 큐)
'/user/queue/alerts'                       // 개인 알림
```

### Custom Hook Pattern

```typescript
// features/dashboard/hooks/useDashboardWebSocket.ts
import { useWebSocket } from '@/shared/hooks/useWebSocket';

export const useDashboardWebSocket = () => {
  useWebSocket({
    destination: '/topic/dashboard/list',
    onMessage: (data) => {
      // Zustand 스토어 업데이트
      updateContainer(data);
    },
    autoConnect: true,
  });
};
```

### 라이프사이클

```
Component Mount
    ↓
useWebSocket Hook
    ↓
StompClient.subscribe(destination)
    ↓
Message Received (1초 간격)
    ↓
Zustand Store Update
    ↓
Component Re-render
    ↓
Component Unmount
    ↓
Auto Unsubscribe
```

---

## 📊 차트 시스템

### 두 가지 차트 패턴

#### 1. 실시간 차트 (WebSocket)

- **예시**: `CPUTrendChart`, `NetworkRxChart`, `MemoryUsageChart`
- **데이터 소스**: WebSocket (`metricsMap` prop)
- **플러그인**: `chartjs-plugin-streaming`
- **X축**: `type: 'realtime'` + `onRefresh` 콜백
- **업데이트**: 자동, 푸시 기반 (1초)
- **타임윈도우**: 고정 (2분)

```typescript
// Realtime chart pattern
scales: {
  x: {
    type: 'realtime',
    realtime: {
      duration: 120000,  // 2 minutes
      onRefresh: (chart) => {
        // Add new data from WebSocket
      }
    }
  }
}
```

#### 2. 히스토리 차트 (REST API)

- **예시**: `CPUHistoryChart`, `MemoryHistoryChart`
- **데이터 소스**: REST API (`containerApi.getContainerMetrics()`)
- **플러그인**: 표준 Chart.js (스트리밍 없음)
- **X축**: `type: 'time'` (정적)
- **업데이트**: 수동, TimeFilter 변경 시
- **타임윈도우**: 사용자 선택 (5분 ~ 7일)

```typescript
// Historical chart pattern
const [timeFilter, setTimeFilter] = useState<TimeFilterValue | null>(null);

useEffect(() => {
  if (!timeFilter) return;

  const fetchMetrics = async () => {
    const metric = await containerApi.getContainerMetrics(containerId, {
      startTime: timeFilter.collectedAtFrom,
      endTime: timeFilter.collectedAtTo,
    });
    // Transform to chart data
  };
  fetchMetrics();
}, [timeFilter]);
```

### 언제 어떤 차트를 사용할까?

| 상황           | 차트 타입    | 이유                          |
| -------------- | ------------ | ----------------------------- |
| 실시간 모니터링 | Realtime     | 즉각적인 피드백, 현재 상태    |
| 추세 분석      | Historical   | 과거 데이터 비교, 용량 계획   |
| 문제 해결      | Historical   | 특정 시간대 심층 분석         |

---

## 🔐 인증 & API

### JWT 토큰 관리

```typescript
// shared/lib/authToken.ts
import { authToken } from '@/shared/lib/authToken';

authToken.set(token);     // 로그인 시 저장
authToken.get();          // 헤더에서 사용
authToken.remove();       // 로그아웃 시 삭제
```

### Axios Interceptor

#### Request Interceptor

- 모든 요청에 `Authorization: Bearer {token}` 자동 추가

#### Response Interceptor

- **401 Unauthorized**: 자동 로그아웃 + `/login` 리다이렉트
- **글로벌 스피너**: `SpinnerContext`와 연동

### API 프록시 (Vite)

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
      ws: true, // WebSocket 지원
    }
  }
}
```

**동작**:

- 개발 환경: `http://localhost:5173/api` → `http://localhost:8081/api`
- CORS 우회 + WebSocket 프록시

---

## ⚠️ 에러 처리

### 중앙화된 에러 파싱

```typescript
// shared/lib/errors/parseApiError.ts
import { parseApiError } from '@/shared/lib/errors/parseApiError';

try {
  await api.post('/endpoint', data);
} catch (error) {
  const apiError = parseApiError(error);
  alert(apiError.message); // 사용자 친화적 메시지
}
```

### 도메인별 에러 메시지

```
shared/lib/errors/messages/
├── authErrorMessages.ts      # 로그인/인증 에러
├── userErrorMessages.ts      # 사용자 관리 에러
├── agentErrorMessages.ts     # 에이전트 에러
└── alertErrorMessages.ts     # 알림 에러
```

각 파일은 **에러 코드 → 한국어 메시지** 매핑 제공

---

## 👨‍💻 개발 가이드

### 새 기능 추가하기

1. **엔티티 타입 정의**: `entities/{domain}/model/types.ts`
2. **엔티티 UI 컴포넌트**: `entities/{domain}/ui/`
3. **Feature Hook 작성**: `features/{domain}/hooks/`
4. **Mapper 함수 작성**: `features/{domain}/lib/`
5. **Widget 컴포넌트**: `widgets/{WidgetName}/`
6. **Page 통합**: `pages/{PageName}/`

### 새 WebSocket 토픽 추가

1. 토픽 상수 정의
2. Custom Hook: `features/{domain}/hooks/use{Feature}WebSocket.ts`
3. `useWebSocket` base hook 사용
4. Zustand 스토어 업데이트
5. 필요 시 Mapper 함수 작성

### 새 API 엔드포인트 추가

1. API 함수: `shared/api/{domain}.ts`
2. `api` 인스턴스 사용 (`axiosInstance.ts`)
3. 타입 정의 (인라인 or `shared/types/api/`)
4. 에러 처리는 자동 (interceptor)

### Path Alias

`@/` = `src/` 디렉토리

```typescript
import { Button } from '@/shared/ui/Button/Button';
import { useAlertStore } from '@/shared/stores/useAlertStore';
```

---

## 🐛 트러블슈팅

### Container Detail Panel 깜빡임 문제 (해결됨)

**증상**:

- 네트워크/블록 I/O 값이 0으로 깜빡임 (0.5초마다)
- DetailPanel 컴포넌트 언마운트/재마운트

**원인**:

- List WebSocket과 Detail WebSocket이 같은 스토어 (`useContainerStore`) 공유
- 50개 컨테이너 업데이트 시마다 배열 전체 교체
- `containers.find()` 실패로 `selectedContainerDetail` null 됨

**해결책**: **Dual Store 아키텍처**

```typescript
// 새 스토어 추가
useSelectedContainerStore.ts  // 선택된 컨테이너 전용

// Detail WebSocket이 두 스토어 모두 업데이트
updateContainer(data);           // 차트용 (시계열)
setSelectedContainer(data);      // 표시값용 (깜빡임 없음)
```

**효과**:

- ✅ 완전한 격리 (List 업데이트가 Detail에 영향 없음)
- ✅ 경쟁 상태 제거
- ✅ 안정적인 참조
- ✅ 효율적인 업데이트

자세한 내용: [CLAUDE.md - Troubleshooting 섹션](CLAUDE.md#troubleshooting-container-detail-flickering-issue)

---

## 🚀 배포

### 빌드

```bash
# TypeScript 타입 체크 + Vite 빌드
npm run build

# 빌드 결과물
dist/
├── index.html
├── assets/
│   ├── index-{hash}.js
│   └── index-{hash}.css
└── ...
```

### 환경 변수 (프로덕션)

`.env.production`:

```env
VITE_API_BASE_URL=https://api.monito.com/api/
VITE_WS_BASE_URL=https://api.monito.com
```

### 정적 서버 배포

Nginx 설정 예시:

```nginx
server {
  listen 80;
  server_name monito.com;
  root /var/www/monito/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:8080;
  }

  location /ws {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

---

## 🤝 기여

Pull Request는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 문의

프로젝트 관련 문의: [이슈 등록](https://github.com/your-repo/issues)

---

## 📚 참고 문서

- [CLAUDE.md](CLAUDE.md) - AI 개발 가이드 (아키텍처 상세 설명)
- [BE_배포_상세_정리.md](BE_배포_상세_정리.md) - 백엔드 배포 가이드
