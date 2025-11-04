import { type FC } from 'react';
import type { AQIInsight } from '../types';
import { getCategoryColor } from '../utils/aqi';

interface Props {
  data: AQIInsight;
}

export const PollutantList: FC<Props> = ({ data }) => {
  if (!data.pollutants.length || data.source === 'fallback') {
    return (
      <div className="glass-panel rounded-3xl p-6" id="recommendations">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Pollutant breakdown</h2>
          <p className="text-sm text-slate-400">
            Live pollutant readings are currently unavailable. We will refresh this view once the provider responds again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6" id="recommendations">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Pollutant breakdown</h2>
          <p className="text-sm text-slate-400">Compare particulate matter, ozone, and nitrogen dioxide concentrations.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.pollutants.map((pollutant) => (
          <div key={pollutant.code} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">{pollutant.name}</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">{pollutant.code}</p>
              </div>
              <span className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${getCategoryColor(
                data.category ?? 'Unavailable'
              )}`}>
                AQI {pollutant.aqi ?? 'N/A'}
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-white">
                {pollutant.value !== null && pollutant.value !== undefined
                  ? pollutant.value.toFixed(1)
                  : 'N/A'}
              </p>
              <p className="text-sm text-slate-500">{pollutant.unit ?? ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
