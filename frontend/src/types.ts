export type PollutionCategory = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unavailable';

export interface PollutantReading {
  code: string;
  name: string;
  value: number | null;
  unit?: string | null;
  aqi: number | null;
}

export interface AQIInsight {
  city: string;
  country: string;
  aqi: number | null;
  dominantPollutant?: string | null;
  category?: PollutionCategory;
  advice?: string | null;
  timestamp: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  pollutants: PollutantReading[];
  trend: Array<{
    time: string;
    aqi: number | null;
  }>;
  source: 'live' | 'fallback';
}

export interface AQIResponse {
  data: AQIInsight;
}

export interface CityOption {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
