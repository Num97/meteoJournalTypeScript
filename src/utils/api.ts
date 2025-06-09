import type { FieldsWeatherResponse, WeatherStation, Norm } from '../types/form';

const API_BASE_URL = '/api/v1';

export async function getFieldsWeather(season: number = new Date().getFullYear()): Promise<FieldsWeatherResponse> {
  const url = `${API_BASE_URL}/fields_weather?season=${season}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }

    const data: FieldsWeatherResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    throw error;
  }
}

// Получение погоды за год

export async function getWeatherStations(year: number): Promise<WeatherStation[]> {
  const url = `${API_BASE_URL}/weather_stations?year=${year}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }

    const json = await response.json();
    const data: WeatherStation[] = json.data;

    return data;
  } catch (error) {
    console.error('Ошибка при получении данных метеостанций:', error);
    throw error;
  }
}

// Получение норм

export async function getWeatherNorms(): Promise<Norm[]> {
  const url = `${API_BASE_URL}/weather_norms`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }

    const data: Norm[] = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении норм погоды:', error);
    throw error;
  }
}