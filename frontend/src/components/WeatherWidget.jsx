import React, { useState, useEffect } from 'react';
import '../css/weather.css';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tọa độ Đại học Bách Khoa Hà Nội
  const HUST_LAT = 21.0053;
  const HUST_LON = 105.8433;

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Open-Meteo API (free, no API key needed)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${HUST_LAT}&longitude=${HUST_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Bangkok`
      );
      
      if (!response.ok) throw new Error('Failed to fetch weather');
      
      const data = await response.json();
      setWeather(data.current);
      setError(null);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('天気情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Weather code to icon/description mapping
  const getWeatherInfo = (code) => {
    const weatherMap = {
      0: { icon: '☀️', desc: '晴れ', descVi: 'Nắng' },
      1: { icon: '🌤️', desc: 'やや晴れ', descVi: 'Ít mây' },
      2: { icon: '⛅', desc: '曇り', descVi: 'Nhiều mây' },
      3: { icon: '☁️', desc: '曇り', descVi: 'U ám' },
      45: { icon: '🌫️', desc: '霧', descVi: 'Sương mù' },
      48: { icon: '🌫️', desc: '霧雨', descVi: 'Sương mù' },
      51: { icon: '🌦️', desc: '小雨', descVi: 'Mưa phùn nhẹ' },
      53: { icon: '🌦️', desc: '小雨', descVi: 'Mưa phùn' },
      55: { icon: '🌧️', desc: '雨', descVi: 'Mưa phùn nặng hạt' },
      61: { icon: '🌧️', desc: '小雨', descVi: 'Mưa nhẹ' },
      63: { icon: '🌧️', desc: '雨', descVi: 'Mưa vừa' },
      65: { icon: '🌧️', desc: '大雨', descVi: 'Mưa to' },
      71: { icon: '🌨️', desc: '小雪', descVi: 'Tuyết nhẹ' },
      73: { icon: '🌨️', desc: '雪', descVi: 'Tuyết vừa' },
      75: { icon: '🌨️', desc: '大雪', descVi: 'Tuyết to' },
      80: { icon: '🌦️', desc: 'にわか雨', descVi: 'Mưa rào nhẹ' },
      81: { icon: '🌧️', desc: 'にわか雨', descVi: 'Mưa rào' },
      82: { icon: '⛈️', desc: '激しい雨', descVi: 'Mưa rào to' },
      95: { icon: '⛈️', desc: '雷雨', descVi: 'Giông bão' },
      96: { icon: '⛈️', desc: '雷雨（雹）', descVi: 'Giông có mưa đá' },
      99: { icon: '⛈️', desc: '激しい雷雨', descVi: 'Giông bão mạnh' }
    };
    return weatherMap[code] || { icon: '🌤️', desc: '晴れ', descVi: 'Nắng' };
  };

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <p>{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  const weatherInfo = getWeatherInfo(weather.weather_code);

  return (
    <div className="weather-widget">
      <div className="weather-location">
        <span className="location-icon">📍</span>
        <span className="location-name">お近くの天気 </span>
      </div>
      
      <div className="weather-main">
        <div className="weather-icon">{weatherInfo.icon}</div>
        <div className="weather-temp">{Math.round(weather.temperature_2m)}°C</div>
      </div>

      <div className="weather-description">
        {weatherInfo.desc}
      </div>

      <div className="weather-details">
        <div className="weather-detail-item">
          <span className="detail-icon">💧</span>
          <span className="detail-label">湿度:</span>
          <span className="detail-value">{weather.relative_humidity_2m}%</span>
        </div>
        <div className="weather-detail-item">
          <span className="detail-icon">💨</span>
          <span className="detail-label">風速:</span>
          <span className="detail-value">{Math.round(weather.wind_speed_10m)} km/h</span>
        </div>
      </div>

      <div className="weather-footer">
        <span className="weather-updated">今日の天気 </span>
      </div>
    </div>
  );
};

export default WeatherWidget;
