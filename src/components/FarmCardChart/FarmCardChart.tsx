import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { WeatherPeriod } from '../../types/form';

interface FarmCardChartProps {
  periods: WeatherPeriod[];
}

const TEMP_COLORS = ['#fdd835', '#fff9c4']; // жёлтый, светло-жёлтый
const RAIN_COLORS = ['#42a5f5', '#bbdefb']; // синий, светло-синий

export const FarmCardChart: React.FC<FarmCardChartProps> = ({ periods }) => {
  const normEffTemp = periods.reduce((sum, p) => sum + p.norms.norm_sum_eff_temp, 0);
  const actualEffTemp = periods.reduce((sum, p) => sum + p.weather.sum_effective_temperature, 0);

  const normPrecip = periods.reduce((sum, p) => sum + p.norms.norm_precipitation, 0);
  const actualPrecip = periods.reduce((sum, p) => sum + p.weather.sum_precipitation, 0);

  const getPercent = (actual: number, norm: number) => {
    return Math.min((actual / norm) * 100, 100);
  };

  const renderPieChart = (
    actual: number,
    norm: number,
    label: string,
    colors: string[]
  ) => {
    const data = [
      { name: 'Факт', value: Math.round(Math.min(actual, norm) * 10) / 10 },
      { name: 'Осталось', value: Math.round(Math.max(norm - actual, 0) * 10) / 10 },
    ];
    const percent = getPercent(actual, norm);

    return (
      <div style={{ textAlign: 'center', margin: '0 1rem' }}>
        <h4 style={{ marginBottom: '0' }}>{label}</h4>

        <svg width="0" height="0">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>
        </svg>

        <PieChart width={180} height={180}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            isAnimationActive={true}
            filter="url(#shadow)"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
        <div style={{ fontSize: '14px' }}>
          {actual.toFixed(0)} / {norm.toFixed(0)} ({percent.toFixed(0)}%)
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem'}}>
      {renderPieChart(actualEffTemp, normEffTemp, 'Эфф. температура', TEMP_COLORS)}
      {renderPieChart(actualPrecip, normPrecip, 'Осадки', RAIN_COLORS)}
    </div>
  );
};
