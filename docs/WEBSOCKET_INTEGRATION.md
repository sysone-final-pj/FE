# WebSocket 통합 가이드

## 목차
1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [구현 단계](#구현-단계)
4. [주요 기능](#주요-기능)
5. [에러 해결](#에러-해결)
6. [사용 방법](#사용-방법)
7. [테스트](#테스트)

---

## 개요

Monito 프론트엔드에 실시간 Docker 컨테이너 모니터링을 위한 WebSocket 통합이 완료되었습니다.

### 기술 스택
- **WebSocket**: STOMP over SockJS
- **상태 관리**: Zustand
- **타입 시스템**: TypeScript
- **백엔드 연동**: JWT 인증

### 주요 특징
- ✅ 실시간 컨테이너 메트릭 수신 (CPU, Memory, Network 등)
- ✅ 실시간 알림 수신 및 localStorage 저장
- ✅ 일시정지/재개 기능 (스냅샷 패턴)
- ✅ 자동 재연결 (최대 5회 시도)
- ✅ 401 에러 자동 로그아웃
- ✅ Zustand DevTools 통합

---

## 아키텍처

### 디렉토리 구조
```
src/
├── shared/
│   ├── lib/websocket/
│   │   └── stompClient.ts          # STOMP 클라이언트 싱글톤
│   ├── hooks/
│   │   └── useWebSocket.ts         # 범용 WebSocket 훅
│   ├── stores/
│   │   ├── useWebSocketStore.ts    # 연결 상태 Store
│   │   ├── useContainerStore.ts    # 컨테이너 데이터 Store
│   │   └── useAlertStore.ts        # 알림 Store (persist)
│   └── types/
│       └── websocket.ts            # WebSocket 타입 정의
├── features/
│   ├── dashboard/
│   │   ├── hooks/
│   │   │   └── useDashboardWebSocket.ts  # Dashboard 전용 훅
│   │   └── lib/
│   │       └── containerMapper.ts        # 데이터 변환 유틸
│   └── alert/
│       └── hooks/
│           └── useAlertWebSocket.ts      # Alert 전용 훅
└── pages/
    ├── DashboardPage/              # 실시간 Dashboard
    └── containers/                 # Container Manage (일시정지 UI)
```

### 데이터 흐름
```
Backend (STOMP)
    ↓
stompClient (Singleton)
    ↓
useWebSocket (Hook)
    ↓
useDashboardWebSocket / useAlertWebSocket
    ↓
Zustand Store (useContainerStore / useAlertStore)
    ↓
React Components (DashboardPage / ContainersPage)
```

---

## 구현 단계

### 1단계: 패키지 설치
```bash
npm install zustand @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

### 2단계: 환경 변수 설정
`.env.development.local` 생성:
```bash
VITE_WS_BASE_URL=http://localhost:8081
```

### 3단계: Vite 설정
`vite.config.ts`에 global polyfill 추가:
```typescript
export default defineConfig({
  define: {
    global: 'globalThis',
  },
})
```

### 4단계: 타입 정의
`src/shared/types/websocket.ts`:
- `ContainerDashboardResponseDTO`: 50개 필드
- `AlertMessageResponseDTO`: 알림 데이터
- `WebSocketStatus`, `WebSocketError` 등

### 5단계: Zustand Store 생성
3개의 Store 생성:
- **useWebSocketStore**: 연결 상태 관리
- **useContainerStore**: 컨테이너 데이터 + 일시정지 기능
- **useAlertStore**: 알림 데이터 + localStorage persist

### 6단계: STOMP 클라이언트
`src/shared/lib/websocket/stompClient.ts`:
- 싱글톤 패턴
- 자동 재연결 (exponential backoff)
- JWT 토큰 자동 주입
- 401 에러 시 자동 로그아웃

### 7단계: WebSocket 훅
- `useWebSocket`: 범용 훅
- `useDashboardWebSocket`: Dashboard 전용
- `useAlertWebSocket`: Alert 전용

### 8단계: 컴포넌트 통합
- `DashboardPage`: 실시간 컨테이너 목록
- `ContainersPage`: 일시정지 UI 연동

---

## 주요 기능

### 1. 실시간 컨테이너 모니터링

**WebSocket 토픽**: `/topic/dashboard`

**수신 데이터** (`ContainerDashboardResponseDTO`):
```typescript
{
  containerId: number;
  containerName: string;
  cpuPercent: number;      // 실시간 CPU 사용률
  memPercent: number;      // 실시간 Memory 사용률
  state: 'RUNNING' | 'DEAD' | ...;
  health: 'HEALTHY' | 'UNHEALTHY' | ...;
  // + 50개 이상의 메트릭 필드
}
```

**사용 예시**:
```typescript
const { containers, isConnected } = useDashboardWebSocket();

return (
  <div>
    {containers.map(container => (
      <div key={container.containerId}>
        {container.containerName}: CPU {container.cpuPercent}%
      </div>
    ))}
  </div>
);
```

### 2. 일시정지/재개 기능

**작동 원리**:
- 일시정지 시: 현재 데이터를 스냅샷으로 저장
- WebSocket은 계속 데이터를 받지만 Store 업데이트 무시
- 재개 시: 실시간 데이터로 즉시 전환

**사용 예시**:
```typescript
const { isPaused, togglePause } = useDashboardWebSocket();

return (
  <button onClick={togglePause}>
    {isPaused ? '재개' : '일시정지'}
  </button>
);
```

**Container Manage 페이지**:
- 실시간 보기 토글 UI가 자동으로 `togglePause()`와 연동됨

### 3. 실시간 알림

**WebSocket 토픽**: `/user/queue/alerts` (사용자별)

**수신 데이터** (`AlertMessageResponseDTO`):
```typescript
{
  alertId: number;
  title: string;
  message: string;
  metricType: 'CPU' | 'MEMORY' | 'NETWORK';
  createdAt: string;
  containerInfo: {
    containerId: number;
    containerName: string;
    containerHash: string;
  }
}
```

**localStorage 자동 저장**:
- Zustand `persist` 미들웨어 사용
- 브라우저 새로고침 후에도 알림 유지
- 읽음/읽지 않음 상태 관리

**사용 예시**:
```typescript
const { notifications, unreadCount, markAsRead } = useAlertWebSocket();

return (
  <div>
    <Badge count={unreadCount} />
    {notifications.map(alert => (
      <div key={alert.alertId} onClick={() => markAsRead(alert.alertId)}>
        {alert.title}
      </div>
    ))}
  </div>
);
```

### 4. 자동 재연결

**설정**:
- 최대 재연결 시도: 5회
- 재연결 지연: 3초 * 시도 횟수 (exponential backoff)
- Heartbeat: 10초

**로그 예시**:
```
[WebSocket] Connection closed
[WebSocket] Reconnecting... (attempt 1/5)
[WebSocket] Connected successfully
```

### 5. 401 에러 처리

**작동 방식**:
1. STOMP error frame에서 "Unauthorized" 또는 "401" 감지
2. `authToken.remove()` 호출 (localStorage 삭제)
3. `/login` 페이지로 자동 리다이렉트

---

## 에러 해결

### 에러 1: `IMessage` export 에러
```
The requested module '/node_modules/.vite/deps/@stomp_stompjs.js'
does not provide an export named 'IMessage'
```

**원인**: Vite가 `@stomp/stompjs`의 타입을 런타임 export로 인식

**해결**:
```typescript
// ❌ 잘못된 방법
import { IMessage } from '@stomp/stompjs';

// ✅ 올바른 방법
import type { IMessage } from '@stomp/stompjs';
```

**적용 파일**:
- `stompClient.ts`
- `useWebSocket.ts`
- `useDashboardWebSocket.ts`
- `useAlertWebSocket.ts`

### 에러 2: `StompSubscription` export 에러
```
does not provide an export named 'StompSubscription'
```

**해결**:
```typescript
// ❌ 잘못된 방법
import { Client, StompSubscription } from '@stomp/stompjs';

// ✅ 올바른 방법
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
```

### 에러 3: `global is not defined`
```
Uncaught ReferenceError: global is not defined
    at node_modules/sockjs-client/lib/utils/browser-crypto.js
```

**원인**: `sockjs-client`가 Node.js `global` 객체를 참조하지만 브라우저에는 없음

**해결**: `vite.config.ts`에 polyfill 추가
```typescript
export default defineConfig({
  define: {
    global: 'globalThis',
  },
})
```

### 에러 4: Vite 캐시 문제

**증상**: 수정 후에도 이전 에러가 계속 발생

**해결**:
```bash
# Vite 캐시 삭제 및 재시작
rm -rf node_modules/.vite
npm run dev
```

---

## 사용 방법

### Dashboard 페이지에서 사용

```typescript
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { mapContainersToDashboardCards } from '@/features/dashboard/lib/containerMapper';

export const DashboardPage = () => {
  const { status, containers, isPaused, togglePause } = useDashboardWebSocket();

  // WebSocket 데이터를 UI 타입으로 변환
  const dashboardContainers = useMemo(() => {
    return mapContainersToDashboardCards(containers);
  }, [containers]);

  return (
    <div>
      <p>연결 상태: {status}</p>
      <button onClick={togglePause}>
        {isPaused ? '재개' : '일시정지'}
      </button>
      <ContainerList containers={dashboardContainers} />
    </div>
  );
};
```

### Container Manage 페이지에서 사용

```typescript
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';

export const ContainersPage = () => {
  const { isPaused, togglePause } = useDashboardWebSocket();

  return (
    <div>
      <span>실시간 보기</span>
      <button onClick={togglePause}>
        {isPaused ? 'OFF' : 'ON'}
      </button>
    </div>
  );
};
```

### Alert 기능 사용

```typescript
import { useAlertWebSocket } from '@/features/alert/hooks/useAlertWebSocket';

export const AlertPanel = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useAlertWebSocket();

  return (
    <div>
      <h2>알림 ({unreadCount})</h2>
      <button onClick={markAllAsRead}>모두 읽음</button>
      <button onClick={clearAll}>모두 삭제</button>

      {notifications.map(alert => (
        <div key={alert.alertId} onClick={() => markAsRead(alert.alertId)}>
          <h3>{alert.title}</h3>
          <p>{alert.message}</p>
          <span>{alert.containerInfo.containerName}</span>
        </div>
      ))}
    </div>
  );
};
```

### Store 직접 접근 (선택사항)

```typescript
import { useContainerStore } from '@/shared/stores/useContainerStore';
import { useAlertStore } from '@/shared/stores/useAlertStore';

// 컨테이너 데이터 접근
const containers = useContainerStore(state => state.containers);
const isPaused = useContainerStore(state => state.isPaused);

// 알림 데이터 접근
const notifications = useAlertStore(state => state.notifications);
const unreadCount = useAlertStore(state => state.unreadCount);
```

---

## 테스트

### 1. WebSocket 연결 확인

**브라우저 Console**:
```javascript
// 연결 상태 확인
useWebSocketStore.getState()
// { status: 'connected', error: null }

// 컨테이너 데이터 확인
useContainerStore.getState().containers
// [{containerId: 1, containerName: "...", ...}]
```

### 2. 실시간 데이터 수신 확인

**Console 로그**:
```
[WebSocket] Connected successfully
[Dashboard WebSocket] Received container update: {
  id: 3,
  name: 'stress-ng-mixed',
  cpu: 46.3,
  mem: 13.5
}
```

### 3. 일시정지 기능 테스트

1. Dashboard 또는 Container Manage 페이지 이동
2. 실시간 데이터가 업데이트되는 것 확인
3. "일시정지" 버튼 클릭
4. Console에서 데이터는 계속 수신되지만 UI는 멈춤 확인
5. "재개" 버튼 클릭
6. 다시 실시간 업데이트 확인

### 4. localStorage 확인

```javascript
// 알림이 localStorage에 저장되는지 확인
localStorage.getItem('alert-storage')
// {"notifications": [...], "unreadCount": 3}
```

### 5. 401 에러 테스트

```javascript
// 수동으로 토큰 삭제
localStorage.removeItem('authToken')

// 새로고침 → /login으로 자동 리다이렉트 확인
```

---

## API 명세

### WebSocket 엔드포인트

**URL**: `{VITE_WS_BASE_URL}/ws`
**프로토콜**: STOMP over SockJS
**인증**: JWT Bearer Token (Authorization 헤더)

### 구독 토픽

| 토픽 | 설명 | DTO |
|------|------|-----|
| `/topic/dashboard` | 실시간 컨테이너 메트릭 | `ContainerDashboardResponseDTO` |
| `/user/queue/alerts` | 사용자별 개인 알림 | `AlertMessageResponseDTO` |
| `/topic/alerts` | 전체 브로드캐스트 알림 | `AlertMessageResponseDTO` |

### 주요 DTO

**ContainerDashboardResponseDTO** (50+ 필드):
- 기본 정보: containerId, containerName, agentName, state, health
- CPU 메트릭 (13개): cpuPercent, cpuCoreUsage, cpuUsageTotal, ...
- Memory 메트릭 (4개): memPercent, memUsage, memLimit, memMaxUsage
- Network 메트릭 (16개): rxBytes, txBytes, rxPackets, txPackets, ...
- Block I/O 메트릭 (4개): blkRead, blkWrite, blkReadPerSec, blkWritePerSec
- Storage 메트릭 (2개): sizeRw, sizeRootFs

**AlertMessageResponseDTO**:
- alertId: number
- title: string
- message: string
- metricType: string
- createdAt: string
- containerInfo: { containerId, containerName, containerHash }

---

## 문제 해결

### WebSocket이 연결되지 않음

1. 백엔드 서버가 실행 중인지 확인
2. `.env.development.local` 파일에 `VITE_WS_BASE_URL` 설정 확인
3. JWT 토큰이 localStorage에 있는지 확인
4. Console에서 에러 메시지 확인

### 데이터가 업데이트되지 않음

1. Console에서 `[Dashboard WebSocket] Received container update` 로그 확인
2. 일시정지 상태인지 확인 (`isPaused`)
3. Zustand Store 확인: `useContainerStore.getState().containers`

### TypeError: Cannot read property 'xxx' of undefined

데이터 변환 중 필드 누락 가능성:
- `containerMapper.ts`에서 변환 로직 확인
- 백엔드 DTO와 프론트 타입이 일치하는지 확인

---

## 다음 단계

### 추가 개선 사항
- [ ] Toast 알림 UI 추가 (`useAlertWebSocket`의 TODO 부분)
- [ ] Dashboard 상세 패널에 실시간 데이터 연동
- [ ] Container 필터링 기능에 실시간 데이터 적용
- [ ] 상태 카드 (State/Health)에 실시간 집계 표시
- [ ] 재연결 시 UI 피드백 추가
- [ ] WebSocket 연결 상태 표시 컴포넌트

### 성능 최적화
- [ ] 메시지 수신 빈도 제한 (throttle/debounce)
- [ ] 불필요한 리렌더링 최소화
- [ ] Store selector 최적화

---

## 참고 자료

- [STOMP.js Documentation](https://stomp-js.github.io/stomp-websocket/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [SockJS Documentation](https://github.com/sockjs/sockjs-client)

---

**작성일**: 2025-11-06
**작성자**: Claude Code
**버전**: 1.0.0
