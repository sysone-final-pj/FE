/**
 작성자: 김슬기
 */
import type { MetricType } from '@/entities/alertRule/model/types';

export const METRIC_DESCRIPTIONS: Record<MetricType, string> = {
  CPU: 'CPU 사용률(%)이 임계값을 초과하면 알림이 발생합니다.',
  MEMORY: 'Memory 사용률(%)이 임계값을 초과하면 알림이 발생합니다.',
  NETWORK: 'Network 오류율(%)이 임계값을 초과하면 알림이 발생합니다.',
};

export const THRESHOLD_FIELDS = [
  ['Info Threshold', 'infoThreshold'],
  ['Warning Threshold', 'warningThreshold'],
  ['High Threshold', 'highThreshold'],
  ['Critical Threshold', 'criticalThreshold'],
] as const;

/**
 * Threshold 입력값 검증 (0-100 범위, 음수 불가)
 */
export const validateThresholdInput = (value: string): { isValid: boolean; message?: string } => {
  if (value === '') {
    return { isValid: true }; // 빈 값은 허용 (선택 필드)
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, message: 'Please enter a valid number.' };
  }

  if (num < 0) {
    return { isValid: false, message: 'Threshold cannot be negative.\nPlease enter a value between 0 and 100.' };
  }

  if (num > 100) {
    return { isValid: false, message: 'Threshold cannot exceed 100.\nPlease enter a value between 0 and 100.' };
  }

  return { isValid: true };
};

/**
 * Cooldown 입력값 검증 (0 이상, 음수 불가)
 */
export const validateCooldownInput = (value: string): { isValid: boolean; message?: string } => {
  if (value === '') {
    return { isValid: true }; // 빈 값은 허용하지 않지만, 여기서는 형식만 검증
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, message: 'Please enter a valid number.' };
  }

  if (num < 0) {
    return { isValid: false, message: 'Cooldown cannot be negative.\nPlease enter a value greater than or equal to 0.' };
  }

  return { isValid: true };
};

/**
 * 값을 숫자로 변환 (빈 값이거나 0이면 null 처리)
 */
export const parseThreshold = (value: string): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return num === 0 ? null : num;
};

/**
 * 최소 1개 이상의 threshold 입력 여부 확인
 */
export const hasAnyThreshold = (
  infoThreshold: string,
  warningThreshold: string,
  highThreshold: string,
  criticalThreshold: string
): boolean => {
  const thresholds = [infoThreshold, warningThreshold, highThreshold, criticalThreshold];
  return thresholds.some((v) => {
    if (v === '' || v === null || v === undefined) return false;
    const num = Number(v);
    return num !== 0;
  });
};
