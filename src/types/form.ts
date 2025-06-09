  export interface Norms {
    crop: string;
    days_in_period: number;
    id: number;
    min_temp: number;
    norm_mean_temp: number;
    norm_precipitation: number;
    norm_sum_eff_temp: number;
    period_id: number;
    period_name: string | null;
  }
  
  export interface Weather {
    effective_temperature_base: number;
    mean_temperature: number | null;
    sum_effective_temperature: number;
    sum_precipitation: number;
  }
  
  export interface WeatherPeriod {
    date_start: string | null;
    date_end: string | null;
    norms: Norms;
    period_id: number;
    weather: Weather;
  }
  
  export interface FieldData {
    crop_name: string;
    field_shape_id: number;
    name: string;
    sowing_date: string;
    tillable_area: number;
    weather_periods: WeatherPeriod[];
    weather_station_id: number;
  }
  
  export interface AvgWeatherPeriods {
    [cropName: string]: WeatherPeriod[];
  }
  
  export interface Farm {
    avg_weather_periods: AvgWeatherPeriods;
    fields: Record<string, FieldData>;
  }
  
  export interface FieldsWeatherResponse {
    [farmName: string]: Farm;
  }

  export interface WeatherStationValue {
  [date: string]: {
    relative_humidity: number;
    precipitation: number;
    precipitation_era5t: number;
    snow: number;
    soil_temperature_1: number;
    solar_radiation: number;
    temperature_max: number;
    temperature_mean: number;
    temperature_min: number;
    wind_speed: number;
  };
}

export interface WeatherStation {
  id: number;
  created_at: string;
  updated_at: string;
  value: WeatherStationValue;
  weather_historyable_id: number;
  weather_historyable_type: string;
  year: number;
}

export interface WeatherStationData {
  id: number;
  weather_historyable_id: number;
  year: number;
  value: {
    [date: string]: {
      relative_humidity: number;
      // другие поля опущены
    };
  };
}

export type WeatherStationsResponse = {
  data: WeatherStationData[];
};

export interface Norm {
  id: number;
  crop: string;
  period_id: number;
  days_in_period: number;
  min_temp: number;
  norm_mean_temp: number;
  norm_precipitation: number;
  norm_sum_eff_temp: number;
  period_name: string | null;
}

export interface WeatherNormsTableProps {
  cropName: string;
  setHasChanges: (hasChanges: boolean) => void;
}