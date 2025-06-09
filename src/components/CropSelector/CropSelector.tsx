import React, { useEffect, useState } from 'react';
import type { FieldsWeatherResponse, WeatherPeriod } from '../../types/form';
import styles from './CropSelector.module.css';
import { WeatherTable } from '../WeatherTable/WeatherTable';
import { FarmCardChart } from '../FarmCardChart/FarmCardChart';

interface CropSelectorProps {
  data: FieldsWeatherResponse;
  onCropSelect: (crop: string) => void;
  selectedCrop: string | null;
}

interface ExceptionEntry {
  crop: string;
  id: number;
}

export const CropSelector: React.FC<CropSelectorProps> = ({ data, onCropSelect, selectedCrop }) => {
  const [excludedCrops, setExcludedCrops] = useState<Set<string>>(new Set());

  // Получаем исключённые культуры с сервера
  useEffect(() => {
    fetch('/api/v1/weather_exception')
      .then(res => res.json())
      .then((exceptions: ExceptionEntry[]) => {
        const excluded = new Set(exceptions.map(e => e.crop));
        setExcludedCrops(excluded);
      })
      .catch(err => console.error('Ошибка загрузки исключений:', err));
  }, []);

  const cropSet = new Set<string>();

  for (const farm of Object.values(data)) {
    for (const cropName of Object.keys(farm.avg_weather_periods)) {
      cropSet.add(cropName);
    }
  }

  // Фильтруем культуры, исключая из списка те, что в исключениях
  const cropList = Array.from(cropSet).filter(crop => !excludedCrops.has(crop));

  const calculateWeightedAverages = (crop: string): { periods: WeatherPeriod[]; totalArea: number } => {
    const periodMap: Record<number, { area: number; norm: any; weather: any ; period_name?: string | null; }> = {};
    let totalArea = 0;

    for (const farm of Object.values(data)) {
      const fields = Object.values(farm.fields || {}).filter((field) => field.crop_name === crop);
      const areaSum = fields.reduce((sum, field) => sum + (field.tillable_area || 0), 0);
      if (!farm.avg_weather_periods[crop]) continue;

      totalArea += areaSum;

      farm.avg_weather_periods[crop].forEach((period, _) => {
        const area = areaSum;
        const period_id = period.period_id;

        if (!periodMap[period_id]) {
          periodMap[period_id] = {
            area: 0,
            norm: {
              norm_mean_temp: 0,
              norm_sum_eff_temp: 0,
              norm_precipitation: 0,
            },
            weather: {
              mean_temperature: 0,
              sum_effective_temperature: 0,
              sum_precipitation: 0,
            },
            period_name: period.norms?.period_name ?? null,
          };
        }

        const entry = periodMap[period_id];

        entry.area += area;
        entry.norm.norm_mean_temp += (period.norms.norm_mean_temp ?? 0) * area;
        entry.norm.norm_sum_eff_temp += (period.norms.norm_sum_eff_temp ?? 0) * area;
        entry.norm.norm_precipitation += (period.norms.norm_precipitation ?? 0) * area;
        entry.weather.mean_temperature += (period.weather.mean_temperature ?? 0) * area;
        entry.weather.sum_effective_temperature += (period.weather.sum_effective_temperature ?? 0) * area;
        entry.weather.sum_precipitation += (period.weather.sum_precipitation ?? 0) * area;
      });
    }

    const periods: WeatherPeriod[] = Object.entries(periodMap).map(([periodId, entry]) => {
      const area = entry.area;
      console.log(entry.period_name)
      return {
        period_id: Number(periodId),
        date_start: null,
        date_end: null,
        norms: {
          crop,
          period_id: Number(periodId),
          days_in_period: 0,
          id: 0,
          period_name: entry.period_name || null,
          min_temp: 0,
          norm_mean_temp: +(entry.norm.norm_mean_temp / area).toFixed(1),
          norm_sum_eff_temp: +(entry.norm.norm_sum_eff_temp / area).toFixed(1),
          norm_precipitation: +(entry.norm.norm_precipitation / area).toFixed(1),
        },
        weather: {
          effective_temperature_base: 0,
          mean_temperature: +(entry.weather.mean_temperature / area).toFixed(1),
          sum_effective_temperature: +(entry.weather.sum_effective_temperature / area).toFixed(1),
          sum_precipitation: +(entry.weather.sum_precipitation / area).toFixed(1),
        },
      };
    });

    return { periods, totalArea };
  };

  return (
    <div className={styles.cropSelector}>
      {selectedCrop && <h2 className={styles.selectedCropTitle}>{selectedCrop}</h2>}
      {cropList.map((crop) => {
        const { periods, totalArea } = calculateWeightedAverages(crop);
        return (
          <div key={crop} className={styles.cropCard} role="button" onClick={() => onCropSelect(crop)}>
            <h3>{crop}</h3>
            <p>Общая площадь: {totalArea.toFixed(0)} га</p>
            <WeatherTable periods={periods} isFieldSelected={false}/>
            <FarmCardChart periods={periods} />
          </div>
        );
      })}
    </div>
  );
};

