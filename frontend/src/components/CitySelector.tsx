import { type FC, useMemo } from 'react';
import type { CityOption } from '../types';

interface Props {
  cities: CityOption[];
  selectedCity?: string;
  onSelect: (city: string) => void;
}

export const CitySelector: FC<Props> = ({ cities, selectedCity, onSelect }) => {
  const groupedCities = useMemo(() => {
    return cities.reduce<Record<string, CityOption[]>>((acc, city) => {
      if (!acc[city.country]) {
        acc[city.country] = [];
      }
      acc[city.country].push(city);
      return acc;
    }, {});
  }, [cities]);

  const value = selectedCity ?? '';

  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Choose a city</h2>
          <p className="text-sm text-slate-400">Explore global locations curated for clean data coverage.</p>
        </div>
        <select
          value={value}
          onChange={(event) => onSelect(event.target.value)}
          className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="" disabled>
            Select a city
          </option>
          {Object.entries(groupedCities).map(([country, cities]) => (
            <optgroup key={country} label={country}>
              {cities.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};
