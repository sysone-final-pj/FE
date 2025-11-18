/**
 * 데이터 포맷팅 유틸리티 함수 모음
 * - Bytes를 사용자 친화적 형식으로 변환
 * - 네트워크 속도 포맷팅 
 * - 이미지 이름 파싱
 */

/**
 * Bytes를 MB/GB 단위로 변환
 * @param bytes - 변환할 바이트 수
 * @returns "512 MB", "2.1 GB" 형식 문자열
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (!bytes || bytes < 0) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 소수점 1자리까지 표시
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

/**
 * Bytes/s를 MB/s 형식으로 변환
 * @param bytesPerSec - 초당 바이트 수
 * @returns "120.5 MB/s" 형식 문자열
 */
export function formatBytesPerSec(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 B/s';
  if (!bytesPerSec || bytesPerSec < 0) return 'N/A';

  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const k = 1024;
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));

  const value = bytesPerSec / Math.pow(k, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

/**
 * Docker 이미지 이름을 repository와 tag로 파싱
 * @param imageName - 이미지 이름 (예: "nginx:alpine", "ubuntu:20.04", "redis")
 * @returns {repository, tag} 객체
 */
export function parseImageName(imageName: string): { repository: string; tag: string } {
  if (!imageName) {
    return { repository: 'unknown', tag: 'latest' };
  }

  // ":"로 분리
  const parts = imageName.split(':');

  if (parts.length === 1) {
    // tag가 없는 경우 (예: "nginx")
    return { repository: parts[0], tag: 'latest' };
  }

  // tag가 있는 경우 (예: "nginx:alpine")
  return {
    repository: parts[0],
    tag: parts.slice(1).join(':'), // ":"가 여러 개일 수 있음
  };
}

/**
 * 퍼센트 계산 (안전한 나누기)
 * @param used - 사용량
 * @param total - 전체량
 * @returns 퍼센트 값 (0-100)
 */
export function calculatePercentage(used: number, total: number): number {
  if (!total || total === 0) return 0;
  if (!used || used < 0) return 0;

  const percentage = (used / total) * 100;
  return Math.min(Math.max(percentage, 0), 100); // 0-100 범위로 제한
}

/**
 * 컨테이너 ID를 Short ID로 변환 (12자리)
 * @param fullId - 전체 컨테이너 ID
 * @returns Short ID (예: "a1b2c3d4e5f6")
 */
export function formatContainerId(fullId: string): string {
  if (!fullId) return 'unknown';
  return fullId.substring(0, 12);
}

/**
 * 숫자를 퍼센트 문자열로 변환
 * @param value - 숫자 값
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns "15.5%" 형식 문자열
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * 네트워크 속도 자동 단위 변환
 * Bytes/s → Kbps / Mbps / Gbps 자동 변환
 * @param bytesPerSec - 초당 바이트 수
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns 예: "512.0 Kbps", "125.5 Mbps", "1.2 Gbps"
 */
export function formatNetworkSpeed(bytesPerSec: number, decimals = 1): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 Kbps';

  // Byte → bit 변환 (1 Byte = 8 bits)
  const bitsPerSec = bytesPerSec * 8;

  const units = ['Kbps', 'Mbps', 'Gbps'];
  const thresholds = [1_000, 1_000_000, 1_000_000_000]; // 10^3, 10^6, 10^9

  let value: number;
  let unit: string;

  if (bitsPerSec < thresholds[1]) {
    // 0 ~ 1 Mbps
    value = bitsPerSec / thresholds[0];
    unit = units[0];
  } else if (bitsPerSec < thresholds[2]) {
    // 1 ~ 1000 Mbps
    value = bitsPerSec / thresholds[1];
    unit = units[1];
  } else {
    // 1 Gbps 이상
    value = bitsPerSec / thresholds[2];
    unit = units[2];
  }

  return `${value.toFixed(decimals)} ${unit}`;
}


/**
 * 컨테이너 상태 변환 (대문자 → 소문자)
 * @param state - 백엔드에서 온 컨테이너 상태
 * @returns 프론트 표시용 상태 문자열
 */
export function formatContainerState(state?: string): string {
  if (!state) return 'unknown';
  const map: Record<string, string> = {
    RUNNING: 'running',
    RESTARTING: 'restarting',
    DEAD: 'dead',
    CREATED: 'created',
    EXITED: 'exited',
    PAUSED: 'paused',
    DELETED: 'exited',
    UNKNOWN: 'exited',
  };
  return map[state] || 'exited';
}

/**
 * 컨테이너 헬스 상태 변환 (대문자 → 소문자)
 * @param health - 백엔드에서 온 헬스 상태
 * @returns 표시용 문자열
 */
export function formatContainerHealth(health?: string): string {
  if (!health) return 'none';
  const map: Record<string, string> = {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    STARTING: 'starting',
    NONE: 'none',
    UNKNOWN: 'none',
  };
  return map[health] || 'none';
}

/**
 * Bytes를 MB로 변환 (숫자 반환)
 * 차트 데이터용 - 문자열이 아닌 숫자를 반환
 * @param bytes - 변환할 바이트 수
 * @returns MB 단위 숫자
 */
export function convertBytesToMB(bytes: number): number {
  if (!bytes || bytes < 0) return 0;
  return bytes / (1024 ** 2);
}

/**
 * Bytes를 GB로 변환 (숫자 반환)
 * @param bytes - 변환할 바이트 수
 * @returns GB 단위 숫자
 */
export function convertBytesToGB(bytes: number): number {
  if (!bytes || bytes < 0) return 0;
  return bytes / (1024 ** 3);
}

/**
 * Bytes/s를 Kbps로 변환 (숫자 반환)
 * @param bytesPerSec - 초당 바이트 수
 * @returns Kbps 단위 숫자
 */
export function convertToKbps(bytesPerSec: number): number {
  if (!bytesPerSec || bytesPerSec < 0) return 0;
  return (bytesPerSec * 8) / 1_000;
}

/**
 * Bytes/s를 Mbps로 변환 (숫자 반환)
 * 차트의 Y축 값으로 사용
 * @param bytesPerSec - 초당 바이트 수
 * @returns Mbps 단위 숫자
 */
export function convertToMbps(bytesPerSec: number): number {
  if (!bytesPerSec || bytesPerSec < 0) return 0;
  return (bytesPerSec * 8) / 1_000_000;
}

/**
 * Bytes/s를 Gbps로 변환 (숫자 반환)
 * @param bytesPerSec - 초당 바이트 수
 * @returns Gbps 단위 숫자
 */
export function convertToGbps(bytesPerSec: number): number {
  if (!bytesPerSec || bytesPerSec < 0) return 0;
  return (bytesPerSec * 8) / 1_000_000_000;
}

/**
 * Bytes/s를 자동으로 적절한 단위로 변환 (숫자 + 단위 반환)
 * 차트의 동적 Y축 레이블용
 * @param bytesPerSec - 초당 바이트 수
 * @returns {value, unit} 객체
 */
export function convertNetworkSpeedAuto(bytesPerSec: number): { value: number; unit: 'Kbps' | 'Mbps' | 'Gbps' } {
  if (!bytesPerSec || bytesPerSec <= 0) {
    return { value: 0, unit: 'Kbps' };
  }

  const bitsPerSec = bytesPerSec * 8;

  if (bitsPerSec < 1_000_000) {
    return { value: bitsPerSec / 1_000, unit: 'Kbps' };
  } else if (bitsPerSec < 1_000_000_000) {
    return { value: bitsPerSec / 1_000_000, unit: 'Mbps' };
  } else {
    return { value: bitsPerSec / 1_000_000_000, unit: 'Gbps' };
  }
}

/**
 * CPU 쿼터와 피리어드로부터 코어 수 계산
 * @param cpuQuota - CPU 쿼터 (-1이면 무제한)
 * @param cpuPeriod - CPU 피리어드
 * @returns CPU 코어 수 (무제한이면 Infinity)
 */
export function calculateCpuCores(cpuQuota: number, cpuPeriod: number): number {
  if (!cpuQuota || !cpuPeriod || cpuQuota === -1) return Infinity;
  return cpuQuota / cpuPeriod;
}

/**
 * Throttle 비율 계산
 * @param throttledPeriods - Throttle된 기간 수
 * @param throttlingPeriods - 전체 Throttling 기간 수
 * @returns Throttle 비율 (0-100%)
 */
export function calculateThrottleRate(throttledPeriods: number, throttlingPeriods: number): number {
  if (!throttlingPeriods || throttlingPeriods === 0) return 0;
  return (throttledPeriods / throttlingPeriods) * 100;
}

/**
 * Bytes/s를 자동으로 적절한 단위로 변환 (숫자 + 단위 반환)
 * Block I/O 차트용 - bytes 기준 (bits 아님)
 * @param bytesPerSec - 초당 바이트 수
 * @returns {value, unit} 객체 (undefined 방지)
 *
 * @example
 * convertBytesPerSecAuto(512)          // { value: 512, unit: 'B/s' }
 * convertBytesPerSecAuto(1024 * 500)   // { value: 500, unit: 'KB/s' }
 * convertBytesPerSecAuto(1024 * 1024 * 10) // { value: 10, unit: 'MB/s' }
 */
export function convertBytesPerSecAuto(bytesPerSec: number | null | undefined): { value: number; unit: 'B/s' | 'KB/s' | 'MB/s' | 'GB/s' } {
  // null/undefined 방어
  if (bytesPerSec == null || bytesPerSec <= 0 || isNaN(bytesPerSec)) {
    return { value: 0, unit: 'B/s' };
  }

  const k = 1024;

  if (bytesPerSec < k) {
    // 0 ~ 1 KB/s
    return { value: bytesPerSec, unit: 'B/s' };
  } else if (bytesPerSec < k * k) {
    // 1 KB/s ~ 1 MB/s
    return { value: bytesPerSec / k, unit: 'KB/s' };
  } else if (bytesPerSec < k * k * k) {
    // 1 MB/s ~ 1 GB/s
    return { value: bytesPerSec / (k * k), unit: 'MB/s' };
  } else {
    // 1 GB/s 이상
    return { value: bytesPerSec / (k * k * k), unit: 'GB/s' };
  }
}