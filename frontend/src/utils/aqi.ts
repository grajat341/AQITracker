import type { PollutionCategory } from '../types';

export const getCategory = (aqi: number): PollutionCategory => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy';
  if (aqi <= 200) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getCategoryColor = (category?: PollutionCategory): string => {
  if (!category || category === 'Unavailable') {
    return 'from-slate-500 to-slate-700';
  }
  switch (category) {
    case 'Good':
      return 'from-emerald-400 to-teal-500';
    case 'Moderate':
      return 'from-amber-400 to-orange-500';
    case 'Unhealthy':
      return 'from-rose-500 to-red-600';
    case 'Very Unhealthy':
      return 'from-purple-500 to-indigo-600';
    case 'Hazardous':
      return 'from-red-700 to-slate-900';
  }
};

export const getCategoryAdvice = (category: PollutionCategory): string => {
  switch (category) {
    case 'Good':
      return 'Air quality is excellent. Outdoor activities are safe for everyone.';
    case 'Moderate':
      return 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.';
    case 'Unhealthy':
      return 'Sensitive groups should avoid outdoor exertion. Consider wearing a mask outdoors.';
    case 'Very Unhealthy':
      return 'Everyone should limit outdoor exertion. Stay indoors when possible.';
    case 'Hazardous':
      return 'Health warnings of emergency conditions. Avoid all outdoor activities.';
    default:
      return '';
  }
};

export const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });
};
