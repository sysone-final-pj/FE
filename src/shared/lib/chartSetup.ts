/**
 * Chart.js 전역 설정
 * - Chart.js 플러그인 및 스케일 등록
 * - 모든 차트 컴포넌트에서 import하여 사용
 * - Fast Refresh 경고 방지를 위해 분리
 */
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';

import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';

// Chart.js 플러그인 및 스케일 등록 (초기 1회 실행)
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  streamingPlugin
);
