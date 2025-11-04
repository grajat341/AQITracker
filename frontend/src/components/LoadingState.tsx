import { type FC } from 'react';

export const LoadingState: FC = () => {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-32 rounded bg-slate-800/60" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4).keys()].map((index) => (
            <div key={index} className="h-24 rounded-2xl bg-slate-900/60" />
          ))}
        </div>
      </div>
    </div>
  );
};
