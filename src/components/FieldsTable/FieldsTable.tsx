import React, { useState } from 'react';
import type { FieldsWeatherResponse } from '../../types/form';
import styles from './FieldsTable.module.css';

interface FieldsTableProps {
  crop: string;
  farmName: string;
  data: FieldsWeatherResponse;
  onFieldSelect?: (fieldId: number) => void;
}

export const FieldsTable: React.FC<FieldsTableProps> = ({
  crop,
  farmName,
  data,
  onFieldSelect,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null); // локальное состояние

  const farm = data[farmName];
  if (!farm || !farm.fields) return <div>Нет данных для хозяйства</div>;

  const fieldEntries = Object.values(farm.fields).filter(field => field.crop_name === crop);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя поля</th>
            <th>Дата сева</th>
            <th>Площадь (га)</th>
            <th>Получено тепла (%)</th>
            <th>Получено осадков (%)</th>
          </tr>
        </thead>
        <tbody>
          {fieldEntries.map((field) => {
            const isSelected = selectedFieldId === field.field_shape_id;

            const totalFactTemp = field.weather_periods?.reduce(
              (sum, p) => sum + (p.weather?.sum_effective_temperature || 0),
              0
            ) ?? 0;

            const totalNormTemp = field.weather_periods?.reduce(
              (sum, p) => sum + (p.norms?.norm_sum_eff_temp || 0),
              0
            ) ?? 0;

            const totalFactPrecip = field.weather_periods?.reduce(
              (sum, p) => sum + (p.weather?.sum_precipitation || 0),
              0
            ) ?? 0;

            const totalNormPrecip = field.weather_periods?.reduce(
              (sum, p) => sum + (p.norms?.norm_precipitation || 0),
              0
            ) ?? 0;

            const tempPercent = totalNormTemp ? (totalFactTemp / totalNormTemp) * 100 : null;
            const precipPercent = totalNormPrecip ? (totalFactPrecip / totalNormPrecip) * 100 : null;

            return (
              <tr
                key={field.field_shape_id}
                className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''}`}
                onClick={() => {
                  const isSame = selectedFieldId === field.field_shape_id;
                  setSelectedFieldId(isSame ? null : field.field_shape_id);
                  onFieldSelect?.(field.field_shape_id);
                }}
              >
                <td>{field.name}</td>
                <td>{field.sowing_date || '—'}</td>
                <td>{field.tillable_area}</td>
                <td>
                  {tempPercent !== null ? (
                    <div className={styles.progressCell}>
                      <span>{tempPercent.toFixed(0)}%</span>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressInner}
                          style={{
                            width: `${Math.min(tempPercent, 100)}%`,
                            backgroundColor: tempPercent >= 100 ? '#10b981' : '#fa6715',
                          }}
                        />
                      </div>
                    </div>
                  ) : '—'}
                </td>
                <td>
                  {precipPercent !== null ? (
                    <div className={styles.progressCell}>
                      <span>{precipPercent.toFixed(0)}%</span>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressInner}
                          style={{
                            width: `${Math.min(precipPercent, 100)}%`,
                            backgroundColor: precipPercent >= 100 ? '#10b981' : '#3b82f6',
                          }}
                        />
                      </div>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
