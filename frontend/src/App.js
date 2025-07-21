import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Use index.css for styles

/**
 * Main component for CoolWeather app.
 */
function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState(null);
  const [countryWeather, setCountryWeather] = useState(null);

  const countryCapitals = {
    // The map from earlier, truncated for brevity; add all as provided before
    "GB": "London",
    "US": "Washington, D.C.",
    // ... (include the full map from my previous response)
  };

  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:8080/api/weather/${searchCity}`);
      setWeather(res.data);
      const countryCode = res.data.sys.country;
      setCountry(countryCode);
      const capital = countryCapitals[countryCode];
      if (capital) {
        const countryRes = await axios.get(`http://localhost:8080/api/weather/${capital}`);
        setCountryWeather(countryRes.data);
      }
      const forecastRes = await axios.get(`http://localhost:8080/api/forecast/${searchCity}`);
      setForecast(forecastRes.data.list.slice(0, 5));
    } catch (err) {
      setError('Error fetching weather: ' + (err.response ? err.response.data : err.message));
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (favCity) => {
    try {
      await axios.post('http://localhost:8080/api/favorites', { city: favCity });
      loadFavorites();
    } catch (err) {
      setError('Error adding favorite: ' + (err.response ? err.response.data : err.message));
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/favorites');
      setFavorites(res.data);
    } catch (err) {
      setError('Error loading favorites: ' + (err.response ? err.response.data : err.message));
    }
  };

  useEffect(() => {
    loadFavorites();
    navigator.geolocation.getCurrentPosition((pos) => {
      axios.get(`http://localhost:8080/api/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
        .then((geoRes) => {
          const localCity = geoRes.data;
          setCity(localCity); // Display city on load
          fetchWeather(localCity);
        })
        .catch(() => fetchWeather('London')); // Fallback
    }, (err) => {
      setError('Geolocation error: ' + err.message);
      fetchWeather('London');
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      setCity('');
    } else {
      setError('Please enter a city name.');
    }
  };

  const getBackgroundClass = (condition) => {
    if (!condition) return 'clear';
    const code = condition.toLowerCase();
    if (code.includes('rain')) return 'rainy';
    if (code.includes('cloud')) return 'cloudy';
    if (code.includes('snow')) return 'snowy';
    if (code.includes('clear')) return 'sunny';
    return 'clear';
  };

  const getIconUrl = (icon) => {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${getBackgroundClass(weather?.weather[0].main)}`}>
      <h1 className="text-4xl font-bold mb-4 text-white">CoolWeather</h1>
      <form onSubmit={handleSearch} className="mb-4 w-full max-w-md">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="p-2 border rounded w-3/4 bg-white/80 text-black"
        />
        <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded">Search</button>
      </form>
      {loading && <p className="text-white">Loading...</p>}
      {error && <p className="text-red-300 mb-4">{error}</p>}
      {weather && (
        <div className="bg-white/70 p-4 rounded-lg shadow-lg mb-4 w-full max-w-md text-center">
          <h2 className="text-3xl font-semibold">{weather.name}, {weather.sys.country}</h2>
          <img src={getIconUrl(weather.weather[0].icon)} alt={weather.weather[0].description} className="mx-auto" />
          <p className="text-xl">{weather.main.temp}°C</p>
          <p className="capitalize">{weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind: {weather.wind.speed} m/s</p>
          <button onClick={() => addFavorite(weather.name)} className="mt-2 p-2 bg-green-500 text-white rounded">Add Favorite</button>
        </div>
      )}
      {countryWeather && (
        <div className="bg-white/70 p-4 rounded-lg shadow-lg mb-4 w-full max-w-md text-center">
          <h3 className="text-2xl font-semibold">Overall in {country} (Capital: {countryCapitals[country]})</h3>
          <img src={getIconUrl(countryWeather.weather[0].icon)} alt={countryWeather.weather[0].description} className="mx-auto" />
          <p className="text-xl">{countryWeather.main.temp}°C</p>
          <p className="capitalize">{countryWeather.weather[0].description}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 w-full max-w-5xl">
        {forecast.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-lg shadow-lg text-center ${getBackgroundClass(item.weather[0].main)}`}>
            <p className="font-bold">{new Date(item.dt * 1000).toLocaleDateString()}</p>
            <img src={getIconUrl(item.weather[0].icon)} alt={item.weather[0].description} className="mx-auto" />
            <p>{item.main.temp}°C</p>
            <p className="capitalize">{item.weather[0].description}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/70 p-4 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl mb-2">Favorites</h3>
        <ul className="list-disc pl-4">
          {favorites.map((fav, idx) => (
            <li key={idx} onClick={() => fetchWeather(fav)} className="cursor-pointer hover:underline">{fav}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
