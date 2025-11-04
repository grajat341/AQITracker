import { type FC } from 'react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: FC<Props> = ({ message, onRetry }) => (
  <div className="glass-panel rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
    <h2 className="text-lg font-semibold">Unable to load air quality data</h2>
    <p className="mt-2 text-sm text-rose-100/70">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 rounded-full border border-rose-400/50 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-200/80 hover:text-white"
      >
        Try again
      </button>
    )}
  </div>
);
