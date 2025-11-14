# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

```
FE
├─ .dockerignore
├─ .idea
│  ├─ FE.iml
│  ├─ libraries
│  │  └─ src.xml
│  ├─ misc.xml
│  ├─ modules.xml
│  ├─ vcs.xml
│  └─ workspace.xml
├─ Dockerfile
├─ eslint.config.js
├─ index.html
├─ nginx.conf
├─ package-lock.json
├─ package.json
├─ postcss.config.cjs
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ dashboard
│  │  │  ├─ group-1350.svg
│  │  │  ├─ pajamas-arrow-up0.svg
│  │  │  ├─ vector0.svg
│  │  │  ├─ zr-15-cls-10650.svg
│  │  │  ├─ zr-15-cls-10660.svg
│  │  │  └─ zr-15-cls-10670.svg
│  │  ├─ delete-icon.svg
│  │  ├─ edit-icon.svg
│  │  ├─ info-icon.svg
│  │  ├─ react.svg
│  │  └─ whale.png
│  ├─ entities
│  │  ├─ agent
│  │  │  ├─ model
│  │  │  │  ├─ constants.ts
│  │  │  │  └─ types.ts
│  │  │  └─ ui
│  │  │     └─ AgentRow.tsx
│  │  ├─ alert
│  │  │  ├─ model
│  │  │  │  ├─ constants.ts
│  │  │  │  └─ types.ts
│  │  │  └─ ui
│  │  │     └─ AlertRow.tsx
│  │  ├─ alertRule
│  │  │  ├─ model
│  │  │  │  ├─ constants.ts
│  │  │  │  └─ types.ts
│  │  │  └─ ui
│  │  │     └─ AlertRuleRow.tsx
│  │  ├─ container
│  │  │  ├─ model
│  │  │  │  ├─ constants.ts
│  │  │  │  ├─ dashboardConstants.ts
│  │  │  │  └─ types.ts
│  │  │  └─ ui
│  │  │     ├─ DashboardHealthyCard.tsx
│  │  │     ├─ DashboardMiniCard.tsx
│  │  │     ├─ DashboardStateCard.tsx
│  │  │     └─ TableRow.tsx
│  │  ├─ cpu
│  │  │  └─ ui
│  │  │     ├─ CPUCard.tsx
│  │  │     └─ CPUGauge
│  │  │        └─ CPUGauge.module.css
│  │  ├─ events
│  │  │  └─ ui
│  │  │     └─ EventRow.tsx
│  │  ├─ memory
│  │  │  └─ ui
│  │  │     └─ MemoryCard.tsx
│  │  ├─ network
│  │  │  └─ ui
│  │  │     └─ NetworkCard.tsx
│  │  └─ user
│  │     ├─ model
│  │     │  └─ types.ts
│  │     └─ ui
│  │        └─ UserRow
│  │           └─ UserRow.tsx
│  ├─ features
│  │  ├─ agent
│  │  │  └─ ui
│  │  │     └─ AgentTableHeader.tsx
│  │  ├─ alert
│  │  │  ├─ hooks
│  │  │  │  └─ useAlertWebSocket.ts
│  │  │  └─ ui
│  │  │     ├─ AlertFilters.tsx
│  │  │     └─ AlertTableHeader.tsx
│  │  ├─ alertRule
│  │  │  └─ ui
│  │  │     └─ AlertRuleTableHeader.tsx
│  │  ├─ container
│  │  │  ├─ hooks
│  │  │  │  ├─ useContainerMetricsWebSocket.ts
│  │  │  │  ├─ useContainersSummaryWebSocket.ts
│  │  │  │  └─ useContainerWebSocket.ts
│  │  │  └─ lib
│  │  │     ├─ containerMapper.ts
│  │  │     └─ manageMapper.ts
│  │  ├─ dashboard
│  │  │  ├─ hooks
│  │  │  │  ├─ useDashboardDetailWebSocket.ts
│  │  │  │  └─ useDashboardWebSocket.ts
│  │  │  ├─ lib
│  │  │  │  ├─ containerMapper.ts
│  │  │  │  ├─ dashboardMapper.ts
│  │  │  │  └─ detailPanelMapper.ts
│  │  │  ├─ model
│  │  │  │  └─ filterTypes.ts
│  │  │  └─ ui
│  │  │     ├─ DashboardFilterSection.tsx
│  │  │     └─ DashboardSortDropdown.tsx
│  │  └─ user
│  │     ├─ lib
│  │     │  ├─ mapFormDataToUser.ts
│  │     │  └─ mapUserToFormData.ts
│  │     ├─ model
│  │     │  ├─ addUserFormData.ts
│  │     │  └─ types.ts
│  │     └─ ui
│  │        ├─ AddUserForm
│  │        │  └─ AddUserForm.tsx
│  │        ├─ AddUserModal
│  │        │  └─ AddUserModal.tsx
│  │        ├─ EditUserForm
│  │        │  └─ EditUserForm.tsx
│  │        ├─ EditUserModal
│  │        │  └─ EditUserModal.tsx
│  │        ├─ InfoUserModal
│  │        │  └─ InfoUserModal.tsx
│  │        ├─ UsernameInput
│  │        │  └─ UsernameInput.tsx
│  │        └─ UserTableHeader
│  │           └─ UserTableHeader.tsx
│  ├─ index.css
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ AlertsPage
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     └─ AlertsPage.tsx
│  │  ├─ containers
│  │  │  └─ ContainersPage.tsx
│  │  ├─ DashboardPage
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     ├─ DashboardBlockIOChart.tsx
│  │  │     ├─ DashboardNetworkChart.tsx
│  │  │     ├─ DashboardPage.tsx
│  │  │     ├─ FilterModal.css
│  │  │     └─ FilterModal.tsx
│  │  ├─ LoginPage
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     └─ LoginPage.tsx
│  │  ├─ ManageAgentsPage
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     └─ ManageAgentsPage.tsx
│  │  └─ ManageUsersPage
│  │     └─ ui
│  │        └─ ManageUsersPage.tsx
│  ├─ shared
│  │  ├─ api
│  │  │  ├─ agent.ts
│  │  │  ├─ alert.ts
│  │  │  ├─ alertRule.ts
│  │  │  ├─ auth.ts
│  │  │  ├─ axiosInstance.ts
│  │  │  ├─ container.ts
│  │  │  └─ user.ts
│  │  ├─ constants
│  │  │  └─ errors
│  │  │     ├─ authErrorMessages.ts
│  │  │     ├─ index.ts
│  │  │     ├─ networkErrorMessages.ts
│  │  │     └─ userErrorMessages.ts
│  │  ├─ hooks
│  │  │  └─ useWebSocket.ts
│  │  ├─ lib
│  │  │  ├─ authToken.ts
│  │  │  ├─ chartUtils.ts
│  │  │  ├─ errors
│  │  │  │  ├─ mapApiError.ts
│  │  │  │  ├─ messages
│  │  │  │  │  ├─ agentErrorMessages.ts
│  │  │  │  │  ├─ alertErrorMessages.ts
│  │  │  │  │  ├─ authErrorMessages.ts
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  ├─ networkErrorMessages.ts
│  │  │  │  │  └─ userErrorMessages.ts
│  │  │  │  ├─ parseApiError.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ formatters.ts
│  │  │  ├─ jwtUtils.ts
│  │  │  ├─ userSpinner.ts
│  │  │  └─ websocket
│  │  │     └─ stompClient.ts
│  │  ├─ mocks
│  │  │  ├─ agentsData.ts
│  │  │  ├─ alertRulesData.ts
│  │  │  ├─ alertsData.ts
│  │  │  ├─ containerData.ts
│  │  │  ├─ cpuData.ts
│  │  │  ├─ dashboardData.ts
│  │  │  ├─ EventsData.ts
│  │  │  ├─ memoryData.ts
│  │  │  ├─ metrics
│  │  │  │  └─ mockMetricsStream.ts
│  │  │  ├─ mockUtils.ts
│  │  │  ├─ networkData.ts
│  │  │  └─ usersData.ts
│  │  ├─ providers
│  │  │  ├─ SpinnerContext.tsx
│  │  │  └─ SpinnerProvider.tsx
│  │  ├─ stores
│  │  │  ├─ useAlertStore.ts
│  │  │  ├─ useContainerStore.ts
│  │  │  └─ useWebSocketStore.ts
│  │  ├─ types
│  │  │  ├─ api
│  │  │  │  ├─ common.types.ts
│  │  │  │  ├─ dashboard.types.ts
│  │  │  │  └─ manage.types.ts
│  │  │  ├─ container.ts
│  │  │  ├─ metrics.ts
│  │  │  └─ websocket.ts
│  │  └─ ui
│  │     ├─ Button
│  │     │  └─ Button.tsx
│  │     ├─ ConfirmModal
│  │     │  ├─ ConfirmModal.tsx
│  │     │  └─ modalMessages.ts
│  │     ├─ FilterModal
│  │     │  ├─ FilterModal.css
│  │     │  └─ FilterModal.tsx
│  │     ├─ Input
│  │     │  └─ Input.tsx
│  │     ├─ Modal
│  │     │  └─ Modal.tsx
│  │     ├─ ModalHeader
│  │     │  └─ ModalHeader.tsx
│  │     ├─ ModalSection
│  │     │  └─ ModalSection.tsx
│  │     ├─ SearchInput
│  │     │  └─ SearchInput.tsx
│  │     ├─ Spinner
│  │     │  └─ Spinner.tsx
│  │     ├─ Textarea
│  │     │  └─ Textarea.tsx
│  │     └─ TimeFilter
│  │        ├─ index.ts
│  │        └─ TimeFilter.tsx
│  └─ widgets
│     ├─ AddAgentModal
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ AddAgentModal.tsx
│     ├─ AddAlertRuleModal
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ AddAlertRuleModal.tsx
│     ├─ AgentTable
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ AgentTable.tsx
│     ├─ AlertTable
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ AlertTable.tsx
│     ├─ ContainerTable
│     │  ├─ ContainerTable.tsx
│     │  ├─ index.ts
│     │  └─ ui
│     │     ├─ FilterButton.tsx
│     │     ├─ SearchBar.tsx
│     │     └─ TableRow.tsx
│     ├─ DashboardContainerList
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ DashboardContainerList.tsx
│     ├─ DashboardDetailPanel
│     │  ├─ index.ts
│     │  └─ ui
│     │     ├─ components
│     │     │  ├─ DetailPanelHeader.tsx
│     │     │  ├─ DetailStatCard.tsx
│     │     │  ├─ EmptyDetailState.tsx
│     │     │  ├─ EmptyStorageState.tsx
│     │     │  ├─ EventSummaryCard.tsx
│     │     │  ├─ ImageInfoCard.tsx
│     │     │  ├─ NetworkChartCard.tsx
│     │     │  ├─ ReadWriteChartCard.tsx
│     │     │  ├─ StorageUsageCard.tsx
│     │     │  └─ StorageUsageContent.tsx
│     │     └─ DashboardDetailPanel.tsx
│     ├─ EditAgentModal
│     │  └─ ui
│     │     └─ EditAgentModal.tsx
│     ├─ EditAlertRuleModal
│     │  └─ ui
│     │     └─ EditAlertRuleModal.tsx
│     ├─ Footer
│     │  ├─ Footer.tsx
│     │  └─ index.ts
│     ├─ Header
│     │  ├─ Header.tsx
│     │  ├─ index.ts
│     │  └─ ui
│     │     ├─ Navigation.tsx
│     │     ├─ NotificationButton.tsx
│     │     ├─ NotificationDropdown.tsx
│     │     └─ UserMenu.tsx
│     ├─ InfoAgentModal
│     │  └─ ui
│     │     └─ InfoAgentModal.tsx
│     ├─ LoginForm
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ LoginForm.tsx
│     ├─ ManageAlertRulesModal
│     │  ├─ index.ts
│     │  └─ ui
│     │     └─ ManageAlertRulesModal.tsx
│     ├─ MetricsTables
│     │  ├─ CPUTab
│     │  │  ├─ CPUTab.tsx
│     │  │  └─ ui
│     │  │     ├─ CPUCard.tsx
│     │  │     ├─ CPUModeChart.tsx
│     │  │     ├─ CPUStatsTable.tsx
│     │  │     ├─ CPUTrendChart.tsx
│     │  │     └─ CurrentCPUTable.tsx
│     │  ├─ EventsTab
│     │  │  └─ EventsTab.tsx
│     │  ├─ MemoryTab
│     │  │  ├─ MemoryTab.tsx
│     │  │  └─ ui
│     │  │     ├─ MemoryStatsTable.tsx
│     │  │     ├─ MemoryUsageChart.tsx
│     │  │     └─ OOMKillsChart.tsx
│     │  └─ NetworkTab
│     │     ├─ NetworkTab.tsx
│     │     └─ ui
│     │        ├─ ErrorDropRateChart.tsx
│     │        ├─ NetworkRxChart.tsx
│     │        ├─ NetworkTxChart.tsx
│     │        └─ TrafficUsageChart.tsx
│     ├─ types
│     │  └─ chartjs-plugin-streaming.d.ts
│     └─ UserTable
│        └─ ui
│           └─ UserTable.tsx
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ types
│  ├─ chartjs-streaming.d.ts
│  └─ svg.d.ts
└─ vite.config.ts

```