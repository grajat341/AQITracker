import { type FC } from 'react';
import { Moon, Sun, Wind } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { label: 'Overview', href: '#overview' },
  { label: 'Trends', href: '#trends' },
  { label: 'Recommendations', href: '#recommendations' },
  { label: 'About', href: '#about' }
];

export const Header: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/70 border-b border-slate-800/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#overview" className="flex items-center gap-3 text-xl font-semibold">
          <span className="rounded-xl bg-primary-500/20 p-2 text-primary-400 ring-1 ring-primary-500/40">
            <Wind className="h-6 w-6" />
          </span>
          AQITracker
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} className="transition hover:text-primary-300">
              {item.label}
            </a>
          ))}
        </nav>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-500/60 hover:text-primary-200"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4" /> Light mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" /> Dark mode
            </>
          )}
        </button>
      </div>
    </header>
  );
};
