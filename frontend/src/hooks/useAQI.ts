import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { AQIInsight, CityOption } from '../types';

interface UseAQIOptions {
  defaultCity?: string;
}

interface AQIState {
  data?: AQIInsight;
  loading: boolean;
  error?: string;
  cities: CityOption[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 7000
});

export const useAQI = ({ defaultCity = 'Delhi' }: UseAQIOptions = {}) => {
  const [state, setState] = useState<AQIState>({ loading: false, cities: [] });

  const fetchCities = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: CityOption[] }>('/api/cities');
      setState((prev) => ({ ...prev, cities: data.data }));
      return data.data;
    } catch (error) {
      console.error('Failed to fetch cities', error);
      setState((prev) => ({ ...prev, error: 'Unable to load city list' }));
      return [];
    }
  }, []);

  const fetchAQI = useCallback(async (city: string) => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const { data } = await api.get<{ data: AQIInsight }>(`/api/aqi/current`, {
        params: { city }
      });
      setState((prev) => ({ ...prev, data: data.data, loading: false }));
    } catch (error) {
      console.error('Failed to fetch AQI data', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          axios.isAxiosError(error) && error.response
            ? error.response.data?.detail || 'Unable to fetch AQI data'
            : 'Unable to fetch AQI data'
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const cities = await fetchCities();
      if (!active) return;

      const initialCity = cities.find((city) => city.city === defaultCity)?.city || defaultCity;
      fetchAQI(initialCity);
    };

    initialize();

    return () => {
      active = false;
    };
  }, [defaultCity, fetchCities, fetchAQI]);

  return useMemo(
    () => ({
      ...state,
      refresh: fetchAQI
    }),
    [state, fetchAQI]
  );
};
