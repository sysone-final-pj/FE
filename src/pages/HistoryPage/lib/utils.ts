// YYYY-MM-DDTHH:mm:ss 포맷으로 변환
export const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// 데이터 renderer 생성 함수(특정 글자수 이상넘어가면 ... 처리 + hover시 full String 출력)
export const createTruncateRenderer = (maxLength: number) => {
  return (_instance: unknown, td: HTMLTableCellElement, _row: number, _col: number, _prop: string | number, value: unknown) => {
    const stringValue = typeof value === 'string' ? value : '';
    if (stringValue && stringValue.length > maxLength) {
      td.textContent = stringValue.substring(0, maxLength) + '...';
      td.title = stringValue;
      td.style.cursor = 'help';
    } else {
      td.textContent = stringValue;
    }
    td.style.textAlign = 'center';
  };
};

// CSV 파일명 생성
export const generateCSVFilename = (
  containerName: string,
  containerHash: string,
  startDate: Date,
  endDate: Date
): string => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  return `${containerName}_${containerHash}_${startDateStr}_to_${endDateStr}.csv`;
};

// CSV 다운로드 처리
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
