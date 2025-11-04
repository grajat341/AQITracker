import { type FC } from 'react';
import { CloudSun, HeartPulse, Layers, Shield } from 'lucide-react';
import type { AQIInsight } from '../types';

interface Props {
  data: AQIInsight;
}

export const Highlights: FC<Props> = ({ data }) => {
  const isFallback = data.source === 'fallback';
  const trendValues = data.trend
    .map((item) => item.aqi)
    .filter((value): value is number => value !== null && value !== undefined);
  const hasTrend = trendValues.length > 0;
  const min = hasTrend ? Math.min(...trendValues) : undefined;
  const max = hasTrend ? Math.max(...trendValues) : undefined;

  const highlights = [
    {
      icon: CloudSun,
      label: 'Dominant pollutant',
      value: isFallback ? 'N/A' : data.dominantPollutant ?? 'N/A',
      description: 'Primary air quality driver'
    },
    {
      icon: HeartPulse,
      label: 'Health impact',
      value:
        isFallback
          ? 'Live guidance unavailable until fresh measurements arrive.'
          : data.advice ?? 'Stay alert and monitor conditions closely.',
      description: 'Guidelines for outdoor activity'
    },
    {
      icon: Layers,
      label: 'AQI range',
      value: hasTrend ? `${min} - ${max}` : 'N/A',
      description: 'Last 24 hour fluctuation'
    },
    {
      icon: Shield,
      label: 'Protection tips',
      value: isFallback
        ? 'Check local advisories and keep indoor air clean with purifiers.'
        : 'Use N95 masks outdoors & keep windows closed',
      description: 'Preventive measures'
    }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6">
      <h2 className="text-lg font-semibold text-white">Key highlights</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-primary-500/10 p-2 text-primary-300">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-sm text-slate-300">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
