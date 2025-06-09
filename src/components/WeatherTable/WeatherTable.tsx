import React from 'react';
import type { WeatherPeriod } from '../../types/form';
import styles from './WeatherTable.module.css';

interface WeatherTableProps {
  periods: WeatherPeriod[];
  isFieldSelected: boolean;
}

export const WeatherTable: React.FC<WeatherTableProps> = ({ periods, isFieldSelected }) => {
  const formatDateWithoutYear = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Период</th>
          <th>Стадия</th>
          <th colSpan={2}>Среднесуточная <br/> температура (°C)</th>
          <th colSpan={2}>Сумма эффективных <br/> температур</th>
          <th colSpan={2}>Осадки (мм)</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th>Норма</th>
          <th>Факт</th>
          <th>Норма</th>
          <th>Факт</th>
          <th>Норма</th>
          <th>Факт</th>
        </tr>
      </thead>
      <tbody>
        {periods.map((period) => (
          <tr key={period.period_id}>
            <td>
              {isFieldSelected && period.date_start && period.date_end ? (
                <>
                  {formatDateWithoutYear(period.date_start)} <br />
                  {formatDateWithoutYear(period.date_end)}
                </>
              ) : (
                period.period_id
              )}
            </td>
            <td>{period.norms.period_name}</td>
            <td>{period.norms.norm_mean_temp}</td>
            <td>{period.weather.mean_temperature ?? '—'}</td>
            <td>{period.norms.norm_sum_eff_temp}</td>
            <td>{period.weather.sum_effective_temperature}</td>
            <td>{period.norms.norm_precipitation}</td>
            <td>{period.weather.sum_precipitation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
