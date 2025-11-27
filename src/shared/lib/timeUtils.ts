/**
 작성자: 김슬기
 */
/**
 * Time conversion utilities for API requests
 * - Backend expects local time in ISO format WITHOUT 'Z' suffix
 * - Extracted from TimeFilter.tsx to avoid duplication
 */

/**
 * LocalTime → ISO (UTC 변환 없이 로컬 시간 유지)
 *
 * @param date - Date to convert
 * @returns ISO string in local timezone without 'Z' suffix
 * @example
 * const now = new Date();
 * formatLocalToISOString(now); // "2025-11-17T14:30:00.000"
 */
export const formatLocalToISOString = (date: Date): string => {
  const offsetMilliseconds = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offsetMilliseconds);
  return local.toISOString().replace('Z', '');
};
