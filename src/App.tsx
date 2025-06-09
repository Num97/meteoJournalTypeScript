import { useEffect, useState } from 'react';
import { getFieldsWeather, getWeatherStations } from './utils/api';
import type { FieldsWeatherResponse, WeatherStation } from './types/form';
import React from 'react';

import { CropSelector } from './components/CropSelector/CropSelector';
import { FarmSelector } from './components/FarmSelector/FarmSelector';
import { LoadingOverlay } from './components/LoadingOverlay/LoadingOverlay';
import { Header } from './components/Header/Header';
import { FieldSelector } from './components/FieldSelector/FieldSelector';
import { WeatherNormsTable } from './components/WeatherNormsTable/WeatherNormsTable';
import { CropFilter } from './components/CropFilter/CropFilter';

function App() {
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState<number>(currentYear);
  const [data, setData] = useState<FieldsWeatherResponse | null>(null);
  const [weatherStations, setWeatherStations] = useState<WeatherStation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSeconds, setLoadingSeconds] = useState<number>(0);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [showCropFilter, setShowCropFilter] = useState(false);

  const handleApplyChanges = () => {
    window.location.reload();
  };

  useEffect(() => {
    setLoading(true);
    setLoadingSeconds(0);
    setError(null);

    const timer = setInterval(() => {
      setLoadingSeconds((s) => s + 1);
    }, 1000);

    Promise.all([
      getFieldsWeather(season),
      getWeatherStations(season),
    ])
      .then(([fieldsData, stationsData]) => {
        setData(fieldsData);
        setWeatherStations(stationsData);
      })
      .catch((err) => {
        console.error(err);
        setError(String(err));
      })
      .finally(() => {
        clearInterval(timer);
        setLoading(false);
      });

    return () => clearInterval(timer);
  }, [season]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSeason(Number(e.target.value));
    setSelectedCrop(null);
    setSelectedFarm(null);
    setShowSettings(false);
  };

  const availableSeasons = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="App" style={{ position: 'relative' }}>
      {loading && <LoadingOverlay seconds={loadingSeconds} />}

      <Header
        season={season}
        availableSeasons={availableSeasons}
        onSeasonChange={handleSeasonChange}
        onBack={
          showSettings
            ? () => setShowSettings(false)
            : selectedFarm
            ? () => setSelectedFarm(null)
            : selectedCrop
            ? () => setSelectedCrop(null)
            : undefined
        }
        selectedCrop={selectedCrop ?? undefined}
        selectedFarm={selectedFarm ?? undefined}
        onSettingsClick={() => setShowSettings(true)}

        hasChanges={hasChanges}
        onApplyChanges={handleApplyChanges}
        onCropFilterClick={() => setShowCropFilter(true)}
      />

      {error && <div>Ошибка: {error}</div>}

      {!data || !weatherStations ? null : showCropFilter ? (
        <CropFilter data={data} onClose={() => setShowCropFilter(false)} />
      ) : showSettings ? (
        <WeatherNormsTable
          cropName={selectedCrop ?? 'Пшеница озимая'}
          setHasChanges={setHasChanges}
        />
      ) : !selectedCrop ? (
        <CropSelector
          data={data}
          onCropSelect={setSelectedCrop}
          selectedCrop={selectedCrop}
        />
      ) : !selectedFarm ? (
        <FarmSelector
          crop={selectedCrop}
          data={data}
          selectedFieldId={null}
          onFarmSelect={setSelectedFarm}
          onBack={() => setSelectedCrop(null)}
        />
      ) : (
        <FieldSelector
          crop={selectedCrop}
          farmName={selectedFarm}
          data={data}
          weatherStations={weatherStations}
          onBack={() => setSelectedFarm(null)}
        />
      )}

    </div>
  );
}

export default App;
