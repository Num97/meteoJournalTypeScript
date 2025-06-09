import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeatherStationData } from '../../types/form';

interface FieldInfo {
  weather_station_id: number;
  tillable_area: number;
  id: string | number;  // допустим, что id может быть строкой или числом
}

interface HumidityChartProps {
  fields: FieldInfo[];
  weatherData: WeatherStationData[];
  selectedFieldId: number | string | null; // тоже допускаем строку
}

export const HumidityChart: React.FC<HumidityChartProps> = ({
  fields,
  weatherData,
  selectedFieldId,
}) => {
  const humidityByDate: Record<string, { total: number; weight: number }> = {};

if (selectedFieldId !== null) {
  const selectedField = fields.find((f) => f.id === selectedFieldId);
  if (selectedField) {
    
    const station = weatherData.find(
      (s) => s.weather_historyable_id === selectedField.weather_station_id
    );
    if (station) {
      for (const [date, values] of Object.entries(station.value)) {
        humidityByDate[date] = {
          total: values.relative_humidity,
          weight: 1,
        };
      }
    } else {
      console.warn('Weather station not found for selected field', selectedField.weather_station_id);
    }
  }
} else {
    const stationIdToArea = new Map<number, number>();
    fields.forEach(({ weather_station_id, tillable_area }) => {
      stationIdToArea.set(
        weather_station_id,
        (stationIdToArea.get(weather_station_id) || 0) + tillable_area
      );
    });

    weatherData.forEach((station) => {
      const area = stationIdToArea.get(station.weather_historyable_id);
      if (!area) return;

      for (const [date, values] of Object.entries(station.value)) {
        if (!humidityByDate[date]) {
          humidityByDate[date] = { total: 0, weight: 0 };
        }
        humidityByDate[date].total += values.relative_humidity * area;
        humidityByDate[date].weight += area;
      }
    });
  }

  const chartData = Object.entries(humidityByDate)
    .map(([date, { total, weight }]) => ({
      date,
      humidity: weight ? total / weight : null,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit="%" />
          <Tooltip formatter={(value: number | string) => (typeof value === 'number' ? `${value.toFixed(1)}%` : value)} />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#8884d8"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

