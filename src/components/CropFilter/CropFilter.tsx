import React, { useEffect, useState } from 'react';
import styles from './CropFilter.module.css';
import type { FieldsWeatherResponse } from '../../types/form';

interface CropFilterProps {
  data: FieldsWeatherResponse;
  onClose: () => void;
}

interface ExceptionEntry {
  crop: string;
  id: number;
}

export const CropFilter: React.FC<CropFilterProps> = ({ data, onClose }) => {
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [exceptionMap, setExceptionMap] = useState<Record<string, number>>({});

  // Получаем список всех культур из входных данных
  const cropList = React.useMemo(() => {
    const crops = new Set<string>();
    for (const farm of Object.values(data)) {
      for (const cropName of Object.keys(farm.avg_weather_periods)) {
        crops.add(cropName);
      }
    }
    return Array.from(crops).sort();
  }, [data]);

  // Загружаем исключения при инициализации
  useEffect(() => {
    fetch('/api/v1/weather_exception')
      .then(res => res.json())
      .then((data: ExceptionEntry[]) => {
        const map: Record<string, number> = {};
        const excluded = new Set<string>();

        data.forEach(entry => {
          map[entry.crop] = entry.id;
          excluded.add(entry.crop);
        });

        setExceptionMap(map);
        setSelectedCrops(new Set(cropList.filter(crop => !excluded.has(crop))));
      })
      .catch(err => console.error('Ошибка загрузки исключений:', err));
  }, [cropList]);

  const toggleCrop = async (crop: string) => {
    const newSet = new Set(selectedCrops);

    if (newSet.has(crop)) {
      // Отключаем культуру → POST
      try {
        const res = await fetch('/api/v1/weather_exception', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crop }),
        });

        if (!res.ok) throw new Error('POST failed');
        const result = await res.json();

        newSet.delete(crop);
        setSelectedCrops(newSet);
        setExceptionMap(prev => ({ ...prev, [crop]: result.id }));
      } catch (err) {
        console.error('Ошибка при добавлении исключения:', err);
      }
    } else {
      // Включаем культуру обратно → DELETE
      const exceptionId = exceptionMap[crop];
      if (!exceptionId) return;

      try {
        const res = await fetch(`/api/v1/weather_exception/${exceptionId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('DELETE failed');

        newSet.add(crop);
        setSelectedCrops(newSet);

        setExceptionMap(prev => {
          const updated = { ...prev };
          delete updated[crop];
          return updated;
        });
      } catch (err) {
        console.error('Ошибка при удалении исключения:', err);
      }
    }
  };

  return (
    <div className={styles.cropFilter}>
      <h2>Выбор культур</h2>
      <div className={styles.cropGrid}>
        {cropList.map(crop => {
          const isSelected = selectedCrops.has(crop);
          return (
            <div
              key={crop}
              className={`${styles.cropBlock} ${isSelected ? styles.selected : styles.unselected}`}
              onClick={() => toggleCrop(crop)}
            >
              <div className={styles.cropLabel}>{crop}</div>
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className={styles.checkbox}
              />
            </div>
          );
        })}
      </div>
      <button onClick={onClose} className={styles.closeButton}>Закрыть</button>
    </div>
  );
};
