import 'chart.js';
import type { Chart } from 'chart.js';

declare module 'chart.js' {
  /** 1) realtime scale 등록 */
  interface CartesianScaleTypeRegistry {
    realtime: {
      options: RealTimeScaleOptions;
    };
  }

  /** 2) realtime 옵션 타입 */
  interface ScaleOptionsByType {
    realtime: RealTimeScaleOptions;
  }

  interface RealTimeScaleOptions {
    duration?: number;
    delay?: number;
    refresh?: number;
    frameRate?: number;
    pause?: boolean;
    ttl?: number;
    onRefresh?: (chart: Chart<'line'>) => void;
  }

  interface ChartDataset<TType extends ChartType = ChartType, TData = unknown> {
    metricRef?: {
      current: unknown;
    };
  }
}
