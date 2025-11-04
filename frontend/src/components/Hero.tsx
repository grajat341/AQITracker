import { type FC } from 'react';
import { motion } from 'framer-motion';
import { ThermometerSun, ShieldAlert, TrendingUp } from 'lucide-react';

export const Hero: FC = () => (
  <section id="overview" className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-radial" />
    <div className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-16 lg:grid-cols-[1.1fr,0.9fr]">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1 text-sm text-primary-200">
            <div className="pulse-dot">
              <span />
              <span />
            </div>
            Live AQI Monitoring
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Breathe easy with real-time air quality intelligence
          </h1>
          <p className="text-lg text-slate-300">
            Track pollution levels, get tailored health recommendations, and monitor environmental trends for
            cities across the globe. AQITracker delivers reliable metrics sourced from international monitoring
            networks in a sleek, responsive interface.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[ 
              {
                icon: ThermometerSun,
                title: 'Realtime AQI',
                description: 'Minute-by-minute insights from certified sensors'
              },
              {
                icon: ShieldAlert,
                title: 'Health Guidance',
                description: 'Personalized suggestions based on air quality'
              },
              {
                icon: TrendingUp,
                title: 'Historical Trends',
                description: 'Interactive charts highlight pollution patterns'
              }
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ y: -6 }} className="glass-panel glow-ring rounded-2xl p-4">
                <item.icon className="mb-3 h-6 w-6 text-primary-300" />
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-primary-500/30" />
            <div className="relative rounded-[2.5rem] border border-slate-800/60 bg-slate-900/80 p-8 shadow-2xl">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wider text-slate-400">Featured City</p>
                  <p className="text-2xl font-semibold text-white">Singapore</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300">AQI 42</span>
              </div>
              <div className="mt-10 space-y-6">
                <div>
                  <p className="text-sm font-medium text-slate-400">Primary pollutant</p>
                  <p className="text-xl font-semibold text-white">PM2.5</p>
                  <p className="text-sm text-slate-500">Safe for outdoor activities</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[47, 51, 56, 44].map((value, index) => (
                    <div key={index} className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-4">
                      <p className="text-sm text-slate-400">Last {index + 1}h</p>
                      <p className="text-lg font-semibold text-white">AQI {value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
