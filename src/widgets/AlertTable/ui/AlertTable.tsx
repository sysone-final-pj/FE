import { useState, useMemo } from 'react';
import type { Alert, AlertLevel, MetricType, SortField, SortDirection } from '@/entities/alert/model/types';
import { AlertRow } from '@/entities/alert/ui/AlertRow';
import { AlertFilters } from '@/features/alert/ui/AlertFilters';
import { AlertTableHeader } from '@/features/alert/ui/AlertTableHeader';

interface AlertTableProps {
  alerts: Alert[];
  onManageRulesClick: () => void;
}

export const AlertTable = ({ alerts: initialAlerts, onManageRulesClick }: AlertTableProps) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [selectedLevel, setSelectedLevel] = useState<AlertLevel | 'ALL'>('ALL');
  const [selectedMetricType, setSelectedMetricType] = useState<MetricType | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Toggle individual alert check
  const handleToggleCheck = (id: string) => {
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
      filtered = filtered.filter((alert) => alert.level === selectedLevel);
    }
    if (selectedMetricType !== 'ALL') {
      filtered = filtered.filter((alert) => alert.metricType === selectedMetricType);
    }

    // Apply sort
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: string | boolean = a[sortField];
        let bValue: string | boolean = b[sortField];

        // Convert to comparable values
        if (typeof aValue === 'boolean') {
          aValue = aValue ? '1' : '0';
          bValue = (bValue as boolean) ? '1' : '0';
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [alerts, selectedLevel, selectedMetricType, sortField, sortDirection]);

  const allChecked = alerts.length > 0 && alerts.every((alert) => alert.checked);

  return (
    <div className="flex flex-col gap-0">
      <AlertFilters
        selectedLevel={selectedLevel}
        selectedMetricType={selectedMetricType}
        onLevelChange={setSelectedLevel}
        onMetricTypeChange={setSelectedMetricType}
        onManageRulesClick={onManageRulesClick}
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
