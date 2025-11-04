import { type FC, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { useAQI } from './hooks/useAQI';
import { AQICard } from './components/AQICard';
import { CitySelector } from './components/CitySelector';
import { ErrorState } from './components/ErrorState';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Highlights } from './components/Highlights';
import { LoadingState } from './components/LoadingState';
import { PollutantList } from './components/PollutantList';
import { TrendChart } from './components/TrendChart';

const AQIDashboard: FC = () => {
  const { data, loading, error, cities, refresh } = useAQI({ defaultCity: 'Delhi' });

  const selectedCity = data?.city ?? cities[0]?.city;

  const content = useMemo(() => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={() => refresh(selectedCity || 'Delhi')} />;
    if (!data) return null;

    return (
      <div className="space-y-10">
        <AQICard data={data} />
        <TrendChart data={data} />
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <PollutantList data={data} />
          <Highlights data={data} />
        </div>
      </div>
    );
  }, [data, error, loading, refresh, selectedCity]);

  return (
    <div className="relative space-y-10">
      <Hero />
      <main className="relative mx-auto max-w-6xl px-6 pb-20">
        <CitySelector cities={cities} selectedCity={selectedCity} onSelect={(city) => refresh(city)} />
        <div className="mt-10">{content}</div>
      </main>
      <Footer />
    </div>
  );
};

const App: FC = () => (
  <ThemeProvider>
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <AQIDashboard />
    </div>
  </ThemeProvider>
);

export default App;
