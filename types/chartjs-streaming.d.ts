import 'chart.js';

declare module 'chart.js' {
  interface CartesianScaleOptions {
    realtime?: {
      duration?: number;
      refresh?: number;
      delay?: number;
      frameRate?: number;
      onRefresh?: (chart: Chart) => void;
    };
  }
}
