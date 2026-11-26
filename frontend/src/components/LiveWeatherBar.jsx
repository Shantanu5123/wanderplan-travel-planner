import React, { useEffect, useState } from 'react';
import { CloudSun, Droplets, Sparkles, AlertCircle } from 'lucide-react';
import { fetchLiveForecast } from '../services/weatherService';

export default function LiveWeatherBar({ latitude, longitude, startDate, endDate, destination }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetchLiveForecast(latitude, longitude, startDate, endDate);
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [latitude, longitude, startDate, endDate]);

  if (loading) {
    return (
      <div className="weather-bar-container skeleton-shimmer" style={{ height: '78px', borderRadius: '16px' }} />
    );
  }

  const forecast = data?.forecast || [];

  return (
    <div className="weather-bar-container">
      <div className="weather-header-pill">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <CloudSun size={17} color="#38bdf8" />
          <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>
            {data?.isLive ? 'Live Weather Forecast' : 'Seasonal Climate Projection'}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
          {data?.isLive ? 'Free Open-Meteo API' : 'Typical Seasonal Temperatures'}
        </span>
      </div>

      <div className="weather-forecast-scroll">
        {forecast.map((f, i) => (
          <div key={i} className="weather-day-chip">
            <span className="weather-icon-emoji">{f.weatherIcon}</span>
            <div className="weather-chip-info">
              <span className="weather-day-label">
                {f.date.includes('-') ? new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : f.date}
              </span>
              <div className="weather-temps">
                <span className="temp-high">{f.maxTemp}°</span>
                <span className="temp-low">/ {f.minTemp}°C</span>
              </div>
            </div>
            <div className="weather-rain-badge" title="Precipitation Probability">
              <Droplets size={11} color="#38bdf8" />
              <span>{f.rainProb}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
