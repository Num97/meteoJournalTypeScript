import React from 'react';
import type { FieldsWeatherResponse } from '../../types/form';
import styles from './FarmSelector.module.css';
import { WeatherTable } from '../WeatherTable/WeatherTable';
import { FarmCardChart } from '../FarmCardChart/FarmCardChart';

interface FarmSelectorProps {
  crop: string;
  data: FieldsWeatherResponse;
  selectedFieldId: number | null;
  onBack: () => void;
  onFarmSelect: (farmName: string) => void;
}

export const FarmSelector: React.FC<FarmSelectorProps> = ({
  crop,
  data,
  selectedFieldId,
  onFarmSelect,
}) => {
  const farms = Object.entries(data).filter(([_, farm]) =>
    Object.keys(farm.avg_weather_periods).includes(crop)
  );

  return (
    <div className={styles.farmBlock}>
      <div className={styles.farmSelector}>
        {farms.map(([farmName, farm]) => {
          // Ищем поле по selectedFieldId в значениях farm.fields по полю field_shape_id
          const selectedField =
            selectedFieldId !== null
              ? Object.values(farm.fields).find(
                  (field) => field.field_shape_id === selectedFieldId
                )
              : undefined;

          const periods =
            selectedField && selectedField.weather_periods?.length
              ? selectedField.weather_periods
              : farm.avg_weather_periods[crop];

          const title = selectedField
            ? `${farmName} — поле: ${selectedField.name}`
            : farmName;

          return (
            <div
              key={farmName}
              className={styles.farmCard}
              onClick={() => onFarmSelect(farmName)}
              role="button"
            >
              <h3>{title}</h3>
              <WeatherTable periods={periods} isFieldSelected={!!selectedFieldId}/>
              <FarmCardChart periods={periods} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

