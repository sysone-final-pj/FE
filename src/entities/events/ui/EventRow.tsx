/**
 작성자: 김슬기
 */
import React, { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { LogData } from '@/shared/types/metrics';

export const LogRow: React.FC<{ log: LogData }> = ({ log }) => {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 font-medium';
      case 'ERROR': return 'text-red-600 font-medium';
      case 'WARN': return 'text-yellow-600 font-medium';
      case 'DEBUG': return 'text-text-secondary font-medium';
      case 'SUCCESS': return 'text-green-600 font-medium';
      default: return 'text-text-secondary font-medium';
    }
  };

  // timestamp 포맷팅 (yyyy-MM-dd HH:mm:ss)
  const formattedTimestamp = useMemo(() => {
    try {
      return format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return log.timestamp; // 파싱 실패 시 원본 반환
    }
  }, [log.timestamp]);

  // duration 계산 (상대 시간)
  const formattedDuration = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(log.timestamp), {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return ''; // 파싱 실패 시 빈 문자열
    }
  }, [log.timestamp]);

  return (
    <tr className="border-b border-border-light hover:bg-gray-50 transition-colors">
      <td className="px-2 py-3 text-gray-400 font-pretendard text-sm font-medium tracking-tight">
        {formattedTimestamp}
      </td>
      <td className="px-2 py-3 font-pretendard text-sm tracking-tight">
        <span className={getLevelStyles(log.level)}>{log.level}</span>
      </td>
      <td className="px-2 py-3 text-text-primary font-pretendard text-sm font-medium tracking-tight">
        {log.containerName}
      </td>
      <td className="px-2 py-3 text-text-secondary font-pretendard text-sm font-medium tracking-tight leading-relaxed">
        {log.message}
      </td>
      <td className="px-2 py-3 text-text-secondary font-pretendard text-sm font-medium tracking-tight">
        {log.agentName}
      </td>
      <td className="px-2 py-3 text-gray-400 font-pretendard text-sm font-medium tracking-tight">
        {formattedDuration}
      </td>
    </tr>
  );
};

