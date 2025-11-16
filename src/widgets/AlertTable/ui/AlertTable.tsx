import { useState, useMemo, useEffect } from 'react';
import type { Alert, AlertLevel, MetricType, SortField, SortDirection } from '@/entities/alert/model/types';
import { AlertRow } from '@/entities/alert/ui/AlertRow';
import { AlertFilters } from '@/features/alert/ui/AlertFilters';
import { AlertTableHeader } from '@/features/alert/ui/AlertTableHeader';
import type { TimeFilterValue } from '@/shared/ui/TimeFilter/TimeFilter';

interface AlertTableProps {
  alerts: Alert[];
  onManageRulesClick: () => void;
  onMessageDelete: (alertId: number[]) => void;
  onTimeFilterSearch: (value: TimeFilterValue) => void;
}

export const AlertTable = ({ alerts: initialAlerts, onManageRulesClick, onMessageDelete, onTimeFilterSearch }: AlertTableProps) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [selectedLevel, setSelectedLevel] = useState<AlertLevel | 'ALL'>('ALL');
  const [selectedMetricType, setSelectedMetricType] = useState<MetricType | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // initialAlerts가 변경되면 checked 상태를 유지하면서 업데이트
  useEffect(() => {
    setAlerts((prevAlerts) => {
      // 이전 checked 상태를 Map으로 저장
      const checkedMap = new Map<number, boolean>();
      prevAlerts.forEach((alert) => {
        if (alert.checked) {
          checkedMap.set(alert.id, true);
        }
      });

      // 새 alerts에 checked 상태 복원
      return initialAlerts.map((alert) => ({
        ...alert,
        checked: checkedMap.get(alert.id) || false,
      }));
    });
  }, [initialAlerts]);

const handleDeleteSelected = () => {
  const selectedIds = alerts
    .filter((a) => a.checked)
    .map((a) => a.id);

  if (selectedIds.length === 0) return; // 아무 것도 선택 안 된 경우
  onMessageDelete(selectedIds);         // ✅ AlertsPage로 배열 전달
};

  // Toggle individual alert check
  const handleToggleCheck = (id: string|number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, checked: !alert.checked } : alert
      )
    );
  };

  // Toggle all alerts check
  const handleToggleAll = () => {
    const allChecked = alerts.every((alert) => alert.checked);
    setAlerts((prev) =>
      prev.map((alert) => ({ ...alert, checked: !allChecked }))
    );
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // New field, set to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort alerts
  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Apply filters
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter((alert) => alert.alertLevel === selectedLevel);
    }
    if (selectedMetricType !== 'ALL') {
      filtered = filtered.filter((alert) => alert.metricType === selectedMetricType);
    }

    // Apply search keyword filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.message.toLowerCase().includes(keyword) ||
          alert.containerName.toLowerCase().includes(keyword) ||
          alert.agentName.toLowerCase().includes(keyword)
      );
    }

    // Apply sort
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: string | boolean | number | undefined = a[sortField];
        let bValue: string | boolean | number | undefined = b[sortField];

        // Convert to comparable values
        if (typeof aValue === 'boolean') {
          aValue = aValue ? '1' : '0';
          bValue = (bValue as boolean) ? '1' : '0';
        } else if (typeof aValue === 'number') {
          const numA = Number(aValue);
          const numB = Number(bValue);
          const comparison = numA - numB;
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        const comparison = String(aValue) < String(bValue) ? -1 : String(aValue) > String(bValue) ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [alerts, selectedLevel, selectedMetricType, searchKeyword, sortField, sortDirection]);

  const allChecked = alerts.length > 0 && alerts.every((alert) => alert.checked);

  return (
    <div className="flex flex-col gap-0">
      <AlertFilters
        selectedLevel={selectedLevel}
        selectedMetricType={selectedMetricType}
        searchKeyword={searchKeyword}
        onLevelChange={setSelectedLevel}
        onMetricTypeChange={setSelectedMetricType}
        onSearchChange={setSearchKeyword}
        onTimeFilterSearch={onTimeFilterSearch}
        onManageRulesClick={onManageRulesClick}
        onMessageDelete={handleDeleteSelected}
      />

      <AlertTableHeader
        allChecked={allChecked}
        onToggleAll={handleToggleAll}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <div className="flex flex-col">
        {filteredAndSortedAlerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onToggleCheck={handleToggleCheck}
          />
        ))}
      </div>
    </div>
  );
};
