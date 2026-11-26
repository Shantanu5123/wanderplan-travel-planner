import axios from 'axios';

// Weather code mapping according to WMO Weather interpretation codes (WW)
export function getWeatherDetails(wmoCode) {
  if (wmoCode === 0) return { label: 'Clear Sky', icon: '☀️' };
  if (wmoCode === 1 || wmoCode === 2) return { label: 'Mainly Sunny', icon: '🌤️' };
  if (wmoCode === 3) return { label: 'Overcast', icon: '☁️' };
  if (wmoCode >= 45 && wmoCode <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (wmoCode >= 51 && wmoCode <= 55) return { label: 'Drizzle', icon: '🌦️' };
  if (wmoCode >= 61 && wmoCode <= 65) return { label: 'Rain', icon: '🌧️' };
  if (wmoCode >= 71 && wmoCode <= 77) return { label: 'Snow Flurries', icon: '❄️' };
  if (wmoCode >= 80 && wmoCode <= 82) return { label: 'Rain Showers', icon: '🌧️' };
  if (wmoCode >= 95 && wmoCode <= 99) return { label: 'Thunderstorm', icon: '⛈️' };
  return { label: 'Pleasant', icon: '⛅' };
}

/**
 * Fetch free live or 16-day forecast from Open-Meteo
 * Fallback to seasonal estimation if outside the 16-day forecast window
 */
export async function fetchLiveForecast(latitude, longitude, startDate, endDate) {
  try {
    const today = new Date();
    const start = startDate ? new Date(startDate) : today;
    const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));

    // Open-Meteo provides up to 16 days daily forecast
    if (diffDays <= 16 && latitude && longitude) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await axios.get(url, { timeout: 6000 });
      if (res.data?.daily) {
        const d = res.data.daily;
        const days = d.time.map((dateStr, idx) => {
          const wmo = d.weathercode ? d.weathercode[idx] : 1;
          const details = getWeatherDetails(wmo);
          return {
            date: dateStr,
            maxTemp: Math.round(d.temperature_2m_max[idx]),
            minTemp: Math.round(d.temperature_2m_min[idx]),
            rainProb: d.precipitation_probability_max ? d.precipitation_probability_max[idx] : 0,
            weatherIcon: details.icon,
            weatherLabel: details.label,
          };
        });

        // Filter around trip window if applicable
        if (startDate) {
          const matching = days.filter((item) => !endDate || (item.date >= startDate && item.date <= endDate));
          if (matching.length > 0) return { isLive: true, forecast: matching };
        }
        return { isLive: true, forecast: days.slice(0, 5) };
      }
    }
  } catch (err) {
    console.warn('Open-Meteo forecast fetch notice:', err.message);
  }

  // Fallback: seasonal typical forecast
  return {
    isLive: false,
    forecast: [
      { date: 'Day 1', maxTemp: 24, minTemp: 16, rainProb: 15, weatherIcon: '☀️', weatherLabel: 'Sunny & Clear' },
      { date: 'Day 2', maxTemp: 25, minTemp: 17, rainProb: 20, weatherIcon: '🌤️', weatherLabel: 'Mainly Sunny' },
      { date: 'Day 3', maxTemp: 23, minTemp: 15, rainProb: 35, weatherIcon: '⛅', weatherLabel: 'Scattered Clouds' },
      { date: 'Day 4', maxTemp: 22, minTemp: 14, rainProb: 40, weatherIcon: '🌦️', weatherLabel: 'Light Breeze' },
      { date: 'Day 5', maxTemp: 24, minTemp: 16, rainProb: 10, weatherIcon: '☀️', weatherLabel: 'Pleasant & Mild' },
    ],
  };
}
