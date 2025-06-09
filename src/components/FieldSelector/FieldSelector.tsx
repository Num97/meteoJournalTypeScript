import React, { useState } from 'react';
import type { FieldsWeatherResponse, WeatherStationData } from '../../types/form';
import { FarmSelector } from '../FarmSelector/FarmSelector';
import { FieldsTable } from '../FieldsTable/FieldsTable';
import { HumidityChart } from '../HumidityChart/HumidityChart';
import styles from './FieldSelector.module.css';

interface FieldSelectorProps {
  crop: string;
  farmName: string;
  data: FieldsWeatherResponse;
  weatherStations: WeatherStationData[];
  onBack: () => void;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  crop,
  farmName,
  data,
  weatherStations,
  onBack,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const farm = data[farmName];
  const selectedField = selectedFieldId && farm?.fields?.[selectedFieldId];

const selectedFieldName = Object.values(farm?.fields || {}).find(
  (field) => field.field_shape_id === selectedFieldId
)?.name || null;


  const filteredFarmData: FieldsWeatherResponse = {
    [farmName]: {
      ...farm,
      fields: selectedField
        ? { [selectedFieldId]: selectedField }
        : farm.fields,
    },
  };

  const fieldList = selectedField
  ? [{ ...selectedField, id: selectedFieldId }]
  : Object.entries(farm.fields || {}).map(([id, field]) => ({
      ...field,
      id: Number(id),
    }));

const chartFields = fieldList.map((field) => ({
  id: field.field_shape_id,
  weather_station_id: field.weather_station_id,
  tillable_area: field.tillable_area,
}));

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <FarmSelector
          crop={crop}
          data={filteredFarmData}
          selectedFieldId={selectedFieldId}
          onBack={onBack}
          onFarmSelect={() => {}}
        />
        {/* <h2>Влажность воздуха</h2> */}
        {selectedFieldName ? (
            <h2>Влажность воздуха на поле {selectedFieldName}</h2>
          ) : (
            <h2>Влажность воздуха в {farmName}</h2>
          )}
        <HumidityChart
          fields={chartFields}
          weatherData={weatherStations}
          selectedFieldId={selectedFieldId}
        />
      </div>
      <div className={styles.main}>
        <FieldsTable
          crop={crop}
          farmName={farmName}
          data={filteredFarmData}
          onFieldSelect={(id) =>
          setSelectedFieldId((prev) => (prev === id ? null : id))
          }
        />
      </div>
    </div>
  );
};
