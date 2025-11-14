/********************************************************************************************
 * chartjs-plugin-streaming Type Definitions
 * Chart.js Streaming Plugin Type Definitions
 ********************************************************************************************/

import type { Chart, ChartType, CartesianScaleOptions } from 'chart.js';

/**
 * Realtime Scale Options Interface
 */
export interface RealTimeScaleOptions extends CartesianScaleOptions {
  /**
   * Duration of the chart in milliseconds (how much time of data it will show).
   * @default 10000
   */
  duration?: number;

  /**
   * Delay added to the chart in milliseconds so upcoming values are known before lines disappear.
   * @default 0
   */
  delay?: number;

  /**
   * Refresh interval of data in milliseconds. The onRefresh callback function will be called at this interval.
   * @default 1000
   */
  refresh?: number;

  /**
   * Callback that runs at a regular interval, as per the refresh interval.
   * @param chart Chart instance
   */
  onRefresh?: (chart: Chart) => void;

  /**
   * Enable or disable the pause behavior
   * @default false
   */
  pause?: boolean;

  /**
   * Time to live (TTL) for each data point in milliseconds
   */
  ttl?: number;

  /**
   * Frame rate for rendering (frames per second)
   * @default 30
   */
  frameRate?: number;
}

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ScaleOptionsByType<TType extends ChartType = ChartType> {
    realtime: {
      type: 'realtime';
    } & RealTimeScaleOptions;
  }
}

declare module 'chartjs-plugin-streaming' {
  import type { Plugin } from 'chart.js';
  const streamingPlugin: Plugin;
  export default streamingPlugin;
}
