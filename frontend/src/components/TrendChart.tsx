import { type FC } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AQIInsight } from '../types';

interface Props {
  data: AQIInsight;
}

const chartGradient = (
  <defs>
    <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgba(79, 70, 229, 0.9)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgba(79, 70, 229, 0.1)" stopOpacity={0} />
    </linearGradient>
  </defs>
);

export const TrendChart: FC<Props> = ({ data }) => {
  const showPlaceholder = data.source === 'fallback' || data.trend.length === 0;

  return (
    <div className="glass-panel rounded-3xl p-6" id="trends">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">24h AQI trend</h2>
          <p className="text-sm text-slate-400">Understand how air quality shifted hour-by-hour.</p>
        </div>
        <span className="rounded-full border border-slate-700/70 px-3 py-1 text-xs font-medium text-slate-300">
          Local time zone
        </span>
      </div>
      <div className="mt-6 h-72 w-full">
        {showPlaceholder ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800/70 bg-slate-900/40 text-sm text-slate-400">
            Trend data will appear once live readings resume.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              {chartGradient}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="time" stroke="rgba(148, 163, 184, 0.6)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(148, 163, 184, 0.6)" tickLine={false} axisLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#e2e8f0'
                }}
              />
              <Area type="monotone" dataKey="aqi" stroke="rgb(99, 102, 241)" fill="url(#aqiGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
