/**
 * 데이터 포맷팅 유틸리티 함수 모음
 * - Bytes를 사용자 친화적 형식으로 변환
 * - 네트워크 속도 포맷팅
 * - 이미지 이름 파싱
 * - 컨테이너 상태 포맷팅
 */

// ============================================================================
// 상수 정의
// ============================================================================

/** Byte 단위 변환 계수 (1024 기반) */
const BINARY_BASE = 1024;

/** Network 속도 단위 변환 계수 (1000 기반) */
const DECIMAL_BASE = 1000;

/** Byte to Bit 변환 계수 */
const BYTE_TO_BIT = 8;

/** Byte 단위 배열 */
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Byte/s 단위 배열 */
const BYTES_PER_SEC_UNITS = ['B/s', 'KB/s', 'MB/s', 'GB/s'] as const;

/** 네트워크 속도 단위 배열 (bit 기반) */
const NETWORK_SPEED_UNITS = ['Kbps', 'Mbps', 'Gbps'] as const;

/** 컨테이너 상태 매핑 */
const CONTAINER_STATE_MAP: Record<string, string> = {
  RUNNING: 'running',
  RESTARTING: 'restarting',
  DEAD: 'dead',
  CREATED: 'created',
  EXITED: 'exited',
  PAUSED: 'paused',
  DELETED: 'exited',
  UNKNOWN: 'exited',
} as const;

/** 컨테이너 헬스 상태 매핑 */
const CONTAINER_HEALTH_MAP: Record<string, string> = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  STARTING: 'starting',
  NONE: 'none',
  UNKNOWN: 'none',
} as const;

// ============================================================================
// 유틸리티 함수 (내부용)
// ============================================================================

/**
 * 숫자 유효성 검증
 * @param value - 검증할 값
 * @returns 유효한 숫자인지 여부
 */
function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * 자동 스케일링 로직
 * @param value - 원본 값
 * @param base - 변환 기준 (1024 or 1000)
 * @param units - 단위 배열
 * @returns {value, unit, index} 객체
 */
function autoScale<T extends readonly string[]>(
  value: number,
  base: number,
  units: T
): { value: number; unit: T[number]; index: number } {
  if (!isValidNumber(value) || value <= 0) {
    return { value: 0, unit: units[0], index: 0 };
  }

  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(base)),
    units.length - 1
  );

  const scaledValue = value / Math.pow(base, index);

  return {
    value: scaledValue,
    unit: units[index],
    index,
  };
}

// ============================================================================
// Byte 포맷팅 함수 (문자열 반환)
// ============================================================================

/**
 * Bytes를 적절한 단위로 변환하여 문자열로 반환
 * @param bytes - 변환할 바이트 수
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns "512.0 MB", "2.1 GB" 형식 문자열
 *
 * @example
 * formatBytes(1024)          // "1.0 KB"
 * formatBytes(1048576)       // "1.0 MB"
 * formatBytes(0)             // "0 B"
 * formatBytes(-1)            // "N/A"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!isValidNumber(bytes)) return 'N/A';
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'N/A';

  const { value, unit } = autoScale(bytes, BINARY_BASE, BYTE_UNITS);
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Bytes/s를 적절한 단위로 변환하여 문자열로 반환
 * @param bytesPerSec - 초당 바이트 수
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns "120.5 MB/s" 형식 문자열
 *
 * @example
 * formatBytesPerSec(1024)       // "1.0 KB/s"
 * formatBytesPerSec(1048576)    // "1.0 MB/s"
 */
export function formatBytesPerSec(bytesPerSec: number, decimals = 1): string {
  if (!isValidNumber(bytesPerSec)) return 'N/A';
  if (bytesPerSec === 0) return '0 B/s';
  if (bytesPerSec < 0) return 'N/A';

  const { value, unit } = autoScale(bytesPerSec, BINARY_BASE, BYTES_PER_SEC_UNITS);
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * 네트워크 속도 포맷팅 (Bytes/s → Kbps/Mbps/Gbps)
 * @param bytesPerSec - 초당 바이트 수
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns "512.0 Kbps", "125.5 Mbps", "1.2 Gbps" 형식 문자열
 *
 * @example
 * formatNetworkSpeed(1000)      // "8.0 Kbps"
 * formatNetworkSpeed(125000)    // "1.0 Mbps"
 */
export function formatNetworkSpeed(bytesPerSec: number, decimals = 1): string {
  if (!isValidNumber(bytesPerSec) || bytesPerSec <= 0) return '0 Kbps';

  const bitsPerSec = bytesPerSec * BYTE_TO_BIT;
  const thresholds = [DECIMAL_BASE, DECIMAL_BASE ** 2, DECIMAL_BASE ** 3];

  let value: number;
  let unit: string;

  if (bitsPerSec < thresholds[1]) {
    value = bitsPerSec / thresholds[0];
    unit = NETWORK_SPEED_UNITS[0];
  } else if (bitsPerSec < thresholds[2]) {
    value = bitsPerSec / thresholds[1];
    unit = NETWORK_SPEED_UNITS[1];
  } else {
    value = bitsPerSec / thresholds[2];
    unit = NETWORK_SPEED_UNITS[2];
  }

  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * 퍼센트를 문자열로 포맷팅
 * @param value - 숫자 값
 * @param decimals - 소수점 자릿수 (기본: 1)
 * @returns "15.5%" 형식 문자열
 *
 * @example
 * formatPercentage(15.5)    // "15.5%"
 * formatPercentage(100, 0)  // "100%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (!isValidNumber(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

// ============================================================================
// Byte 변환 함수 (숫자 반환) - 차트용
// ============================================================================

/**
 * Bytes를 MB로 변환 (숫자 반환)
 * @param bytes - 변환할 바이트 수
 * @returns MB 단위 숫자
 *
 * @example
 * convertBytesToMB(1048576)  // 1
 * convertBytesToMB(0)        // 0
 */
export function convertBytesToMB(bytes: number): number {
  if (!isValidNumber(bytes) || bytes < 0) return 0;
  return bytes / BINARY_BASE ** 2;
}

/**
 * Bytes를 GB로 변환 (숫자 반환)
 * @param bytes - 변환할 바이트 수
 * @returns GB 단위 숫자
 *
 * @example
 * convertBytesToGB(1073741824)  // 1
 */
export function convertBytesToGB(bytes: number): number {
  if (!isValidNumber(bytes) || bytes < 0) return 0;
  return bytes / BINARY_BASE ** 3;
}

/**
 * Bytes/s를 자동으로 적절한 단위로 변환 (객체 반환)
 * Block I/O 차트용 - bytes 기준 (bits 아님)
 * @param bytesPerSec - 초당 바이트 수
 * @returns {value, unit} 객체
 *
 * @example
 * convertBytesPerSecAuto(512)              // { value: 512, unit: 'B/s' }
 * convertBytesPerSecAuto(1024 * 500)       // { value: 500, unit: 'KB/s' }
 * convertBytesPerSecAuto(1024 * 1024 * 10) // { value: 10, unit: 'MB/s' }
 */
export function convertBytesPerSecAuto(
  bytesPerSec: number | null | undefined
): { value: number; unit: typeof BYTES_PER_SEC_UNITS[number] } {
  if (!isValidNumber(bytesPerSec) || bytesPerSec <= 0) {
    return { value: 0, unit: 'B/s' };
  }

  const { value, unit } = autoScale(bytesPerSec, BINARY_BASE, BYTES_PER_SEC_UNITS);
  return { value, unit };
}

// ============================================================================
// 네트워크 속도 변환 함수 (숫자 반환) - 차트용
// ============================================================================

/**
 * Bytes/s를 Kbps로 변환 (숫자 반환)
 * @param bytesPerSec - 초당 바이트 수
 * @returns Kbps 단위 숫자
 */
export function convertToKbps(bytesPerSec: number): number {
  if (!isValidNumber(bytesPerSec) || bytesPerSec < 0) return 0;
  return (bytesPerSec * BYTE_TO_BIT) / DECIMAL_BASE;
}

/**
 * Bytes/s를 Mbps로 변환 (숫자 반환)
 * @param bytesPerSec - 초당 바이트 수
 * @returns Mbps 단위 숫자
 */
export function convertToMbps(bytesPerSec: number): number {
  if (!isValidNumber(bytesPerSec) || bytesPerSec < 0) return 0;
  return (bytesPerSec * BYTE_TO_BIT) / DECIMAL_BASE ** 2;
}

/**
 * Bytes/s를 Gbps로 변환 (숫자 반환)
 * @param bytesPerSec - 초당 바이트 수
 * @returns Gbps 단위 숫자
 */
export function convertToGbps(bytesPerSec: number): number {
  if (!isValidNumber(bytesPerSec) || bytesPerSec < 0) return 0;
  return (bytesPerSec * BYTE_TO_BIT) / DECIMAL_BASE ** 3;
}

/**
 * Bytes/s를 자동으로 적절한 단위로 변환 (객체 반환)
 * 네트워크 차트용 - bits 기준
 * @param bytesPerSec - 초당 바이트 수
 * @returns {value, unit} 객체
 *
 * @example
 * convertNetworkSpeedAuto(1000)    // { value: 8, unit: 'Kbps' }
 * convertNetworkSpeedAuto(125000)  // { value: 1, unit: 'Mbps' }
 */
export function convertNetworkSpeedAuto(
  bytesPerSec: number
): { value: number; unit: typeof NETWORK_SPEED_UNITS[number] } {
  if (!isValidNumber(bytesPerSec) || bytesPerSec <= 0) {
    return { value: 0, unit: 'Kbps' };
  }

  const bitsPerSec = bytesPerSec * BYTE_TO_BIT;
  const thresholds = [DECIMAL_BASE, DECIMAL_BASE ** 2, DECIMAL_BASE ** 3];

  if (bitsPerSec < thresholds[1]) {
    return { value: bitsPerSec / thresholds[0], unit: 'Kbps' };
  } else if (bitsPerSec < thresholds[2]) {
    return { value: bitsPerSec / thresholds[1], unit: 'Mbps' };
  } else {
    return { value: bitsPerSec / thresholds[2], unit: 'Gbps' };
  }
}

// ============================================================================
// 퍼센트 계산 함수
// ============================================================================

/**
 * 퍼센트 계산 (안전한 나누기)
 * @param used - 사용량
 * @param total - 전체량
 * @returns 퍼센트 값 (0-100)
 *
 * @example
 * calculatePercentage(50, 100)  // 50
 * calculatePercentage(75, 0)    // 0
 */
export function calculatePercentage(used: number, total: number): number {
  if (!isValidNumber(used) || !isValidNumber(total) || total === 0 || used < 0) {
    return 0;
  }

  const percentage = (used / total) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

// ============================================================================
// CPU 관련 함수
// ============================================================================

/**
 * CPU 쿼터와 피리어드로부터 코어 수 계산
 * @param cpuQuota - CPU 쿼터 (-1이면 무제한)
 * @param cpuPeriod - CPU 피리어드
 * @returns CPU 코어 수 (무제한이면 Infinity)
 *
 * @example
 * calculateCpuCores(100000, 100000)  // 1
 * calculateCpuCores(-1, 100000)      // Infinity
 */
export function calculateCpuCores(cpuQuota: number, cpuPeriod: number): number {
  if (
    !isValidNumber(cpuQuota) ||
    !isValidNumber(cpuPeriod) ||
    cpuQuota === -1 ||
    cpuPeriod === 0
  ) {
    return Infinity;
  }
  return cpuQuota / cpuPeriod;
}

/**
 * Throttle 비율 계산
 * @param throttledPeriods - Throttle된 기간 수
 * @param throttlingPeriods - 전체 Throttling 기간 수
 * @returns Throttle 비율 (0-100%)
 *
 * @example
 * calculateThrottleRate(50, 100)  // 50
 */
export function calculateThrottleRate(
  throttledPeriods: number,
  throttlingPeriods: number
): number {
  if (
    !isValidNumber(throttledPeriods) ||
    !isValidNumber(throttlingPeriods) ||
    throttlingPeriods === 0
  ) {
    return 0;
  }
  return (throttledPeriods / throttlingPeriods) * 100;
}

// ============================================================================
// 컨테이너 관련 포맷팅 함수
// ============================================================================

/**
 * 컨테이너 ID를 Short ID로 변환 (12자리)
 * @param fullId - 전체 컨테이너 ID
 * @returns Short ID (예: "a1b2c3d4e5f6")
 *
 * @example
 * formatContainerId("a1b2c3d4e5f6g7h8i9j0")  // "a1b2c3d4e5f6"
 */
export function formatContainerId(fullId: string): string {
  if (!fullId || typeof fullId !== 'string') return 'unknown';
  return fullId.substring(0, 12);
}

/**
 * 컨테이너 상태 변환 (대문자 → 소문자)
 * @param state - 백엔드에서 온 컨테이너 상태
 * @returns 프론트 표시용 상태 문자열
 *
 * @example
 * formatContainerState("RUNNING")   // "running"
 * formatContainerState("UNKNOWN")   // "exited"
 */
export function formatContainerState(state?: string): string {
  if (!state) return 'unknown';
  return CONTAINER_STATE_MAP[state] ?? 'exited';
}

/**
 * 컨테이너 헬스 상태 변환 (대문자 → 소문자)
 * @param health - 백엔드에서 온 헬스 상태
 * @returns 표시용 문자열
 *
 * @example
 * formatContainerHealth("HEALTHY")    // "healthy"
 * formatContainerHealth("UNKNOWN")    // "none"
 */
export function formatContainerHealth(health?: string): string {
  if (!health) return 'none';
  return CONTAINER_HEALTH_MAP[health] ?? 'none';
}

// ============================================================================
// Docker 이미지 관련 함수
// ============================================================================

/**
 * Docker 이미지 이름을 repository와 tag로 파싱
 * @param imageName - 이미지 이름 (예: "nginx:alpine", "ubuntu:20.04", "redis")
 * @returns {repository, tag} 객체
 *
 * @example
 * parseImageName("nginx:alpine")  // { repository: "nginx", tag: "alpine" }
 * parseImageName("nginx")         // { repository: "nginx", tag: "latest" }
 */
export function parseImageName(imageName: string): { repository: string; tag: string } {
  if (!imageName || typeof imageName !== 'string') {
    return { repository: 'unknown', tag: 'latest' };
  }

  const colonIndex = imageName.indexOf(':');

  if (colonIndex === -1) {
    return { repository: imageName, tag: 'latest' };
  }

  return {
    repository: imageName.substring(0, colonIndex),
    tag: imageName.substring(colonIndex + 1),
  };
}
