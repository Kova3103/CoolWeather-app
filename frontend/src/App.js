import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Optional, create if needed for custom styles

/**
 * Main component for CoolWeather app.
 */
function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false); // New: Loading state
  const [error, setError] = useState(null); // New: Error state for UI

  const fetchWeather = async (searchCity) => {
    console.log('Fetching weather for:', searchCity);
    setLoading(true); // Show loading
    setError(null); // Clear previous error
    try {
      const res = await axios.get(`http://localhost:8080/api/weather/${searchCity}`);
      setWeather(res.data);
      console.log('Weather data:', res.data);
      const forecastRes = await axios.get(`http://localhost:8080/api/forecast/${searchCity}`);
      setForecast(forecastRes.data.list.slice(0, 5));
      console.log('Forecast data:', forecastRes.data);
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      console.error('Error fetching weather:', errorMsg);
      setError('Error fetching weather: ' + errorMsg); // Show in UI
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const addFavorite = async (favCity) => {
    try {
      await axios.post('http://localhost:8080/api/favorites', { city: favCity });
      loadFavorites();
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      console.error('Error adding favorite:', errorMsg);
      setError('Error adding favorite: ' + errorMsg);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/favorites');
      setFavorites(res.data);
    } catch (err) {
      const errorMsg = err.response ? err.response.data : err.message;
      console.error('Error loading favorites:', errorMsg);
      setError('Error loading favorites: ' + errorMsg);
    }
  };

  useEffect(() => {
    loadFavorites();
    // Initial load with geolocation
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
    }, (err) => {
      console.error('Geolocation error:', err);
      fetchWeather('London'); // Fallback city
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search submitted with city:', city);
    if (city.trim()) {
      fetchWeather(city);
      setCity('');
    } else {
      console.log('No city entered');
      setError('Please enter a city name.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-4">CoolWeather</h1>
      <form onSubmit={handleSearch} className="mb-4 w-full max-w-md">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="p-2 border rounded w-3/4"
        />
        <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded">Search</button>
      </form>
      {loading && <p className="text-blue-500">Loading...</p>} {/* Show loading */}
      {error && <p className="text-red-500 mb-4">{error}</p>} {/* Show error in UI */}
      {weather && (
        <div className="bg-white p-4 rounded shadow mb-4 w-full max-w-md">
          <h2 className="text-2xl">{weather.name}</h2>
          <p>Temp: {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind: {weather.wind.speed} m/s</p>
          <p>{weather.weather[0].description}</p>
          <button onClick={() => addFavorite(weather.name)} className="mt-2 p-2 bg-green-500 text-white rounded">Add Favorite</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 w-full max-w-5xl">
        {forecast.map((item, idx) => (
          <div key={idx} className="bg-blue-100 p-4 rounded shadow">
            <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
            <p>Temp: {item.main.temp}°C</p>
            <p>{item.weather[0].description}</p>
          </div>
        ))}
      </div>
      <div className="w-full max-w-md">
        <h3 className="text-xl mb-2">Favorites</h3>
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
