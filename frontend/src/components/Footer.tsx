import { type FC } from 'react';

export const Footer: FC = () => (
  <footer id="about" className="border-t border-slate-800/60 bg-slate-950/80">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-medium text-slate-300">AQITracker</p>
        <p className="mt-1 max-w-xl text-xs text-slate-500">
          Built with performance and accessibility in mind. Optimized for static hosting or containerized deployments.
        </p>
      </div>
      <div className="flex gap-6 text-xs uppercase tracking-widest text-slate-600">
        <a href="https://openaq.org/" target="_blank" rel="noreferrer" className="transition hover:text-primary-300">
          Powered by OpenAQ
        </a>
        <span>© {new Date().getFullYear()} AQITracker</span>
      </div>
    </div>
  </footer>
);
