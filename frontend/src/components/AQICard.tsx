import { type FC } from 'react';
import { clsx } from 'clsx';
import { formatTimestamp, getCategoryColor } from '../utils/aqi';
import type { AQIInsight, PollutionCategory } from '../types';

interface Props {
  data: AQIInsight;
}

export const AQICard: FC<Props> = ({ data }) => {
  const isFallback = data.source === 'fallback';
  const displayAQI = data.aqi ?? 'N/A';
  const displayCategory: PollutionCategory = data.category ?? 'Unavailable';
  const displayDominant = data.dominantPollutant ?? 'N/A';
  const displayAdvice = data.advice ??
    'Live air quality readings are temporarily unavailable for this location. Please try again later.';

  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">Current AQI</p>
          <h2 className="text-4xl font-semibold text-white">{displayAQI}</h2>
          <p className="text-sm text-slate-400">Updated {formatTimestamp(data.timestamp)}</p>
          {isFallback && (
            <p className="mt-1 text-xs uppercase tracking-wider text-primary-300">Showing cached placeholder data</p>
          )}
        </div>
        <div
          className={clsx(
            'glow-ring rounded-2xl bg-gradient-to-br px-6 py-4 text-right text-white shadow-lg shadow-primary-900/50',
            getCategoryColor(displayCategory)
          )}
        >
          <p className="text-sm uppercase tracking-wider text-white/80">{displayCategory}</p>
          <p className="text-lg font-semibold">{displayDominant}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Health guidance</h3>
          <p className="mt-2 text-base text-slate-300">{displayAdvice}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Location</h3>
          <p className="mt-2 text-base text-slate-300">
            {data.city}, {data.country}
          </p>
          {data.coordinates && (
            <p className="text-sm text-slate-500">
              {data.coordinates.latitude.toFixed(2)}°N, {data.coordinates.longitude.toFixed(2)}°E
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
