import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import countryCapitals from './data/countryCapitals';

/**
 * Main component for the CoolWeather app.
 * Handles weather fetching, favorites management, and UI rendering.
 */
function App() {
  // State for current weather data
  const [weather, setWeather] = useState(null);
  // State for 5-day forecast data, averaged per day (starting from tomorrow)
  const [forecast, setForecast] = useState([]);
  // State for list of favorite cities
  const [favorites, setFavorites] = useState([]);
  // State for user-input city search
  const [city, setCity] = useState('');
  // State to indicate loading status
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);
  // State for country code of the current city
  const [country, setCountry] = useState(null);
  // State for weather data of the country's capital
  const [countryWeather, setCountryWeather] = useState(null);
  // State to determine if it's nighttime based on sunrise/sunset
  const [isNight, setIsNight] = useState(false);
  // State for formatted local time in the city's timezone
  const [currentTime, setCurrentTime] = useState('');
  // State to toggle detailed weather view
  const [showDetails, setShowDetails] = useState(false);
  // State for hourly temperature data for the next 24 hours
  const [hourlyTemps, setHourlyTemps] = useState([]);
  // State to toggle 24-hour forecast sidebar
  const [show24hForecast, setShow24hForecast] = useState(false);


  /**
   * Fetches weather and forecast data for a given city.
   * Also fetches weather for the country's capital and processes forecast data.
   * @param {string} searchCity - The city to fetch weather for.
   */
  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching weather for ${searchCity}`); // Debug log for tracking API calls
      // Fetch current weather data
      const res = await axios.get(`http://localhost:8080/api/weather/${searchCity}`);
      setWeather(res.data);

  // Calculate if it's night based on sunrise/sunset times
  const currentTimeUnix = Math.floor(Date.now() / 1000);
  const sunrise = res.data.sys.sunrise;
  const sunset = res.data.sys.sunset;
  const night = currentTimeUnix < sunrise || currentTimeUnix > sunset;
  setIsNight(night);

  // Calculate local time adjusted for timezone (API returns timezone offset in seconds)
  const timezoneOffset = res.data.timezone; // In seconds
  const utcTime = Math.floor(Date.now() / 1000) + (new Date().getTimezoneOffset() * 60);
  const localTs = (utcTime + timezoneOffset) * 1000;
  const localDate = new Date(localTs);

  // Format HH:MM for the city's local time
  const timeStr = localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Build a GMT offset label from the timezone offset (e.g., GMT+1 or GMT+5:30)
  const offsetHoursFloat = timezoneOffset / 3600;
  const sign = offsetHoursFloat >= 0 ? '+' : '-';
  const absHours = Math.abs(offsetHoursFloat);
  const hoursPart = Math.floor(absHours);
  const minutesPart = Math.round((absHours - hoursPart) * 60);
  const offsetLabel = `GMT${sign}${hoursPart}${minutesPart ? ':' + String(minutesPart).padStart(2, '0') : ''}`;

  setCurrentTime(`${timeStr} ${offsetLabel}`);

      // Get country code and fetch capital's weather if available
      const countryCode = res.data.sys.country;
      setCountry(countryCode);
      const capital = countryCapitals[countryCode];
      if (capital) {
        const countryRes = await axios.get(`http://localhost:8080/api/weather/${capital}`);
        setCountryWeather(countryRes.data);
      }

      // Fetch 5-day forecast data
      const forecastRes = await axios.get(`http://localhost:8080/api/forecast/${searchCity}`);
      const forecastList = forecastRes.data.list;


      // Group forecast by day and calculate daily averages (for future days only)
      const dailyForecasts = {};
      forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = { tempSum: 0, humiditySum: 0, count: 0, descriptions: [] };
        }
        dailyForecasts[date].tempSum += item.main.temp;
        dailyForecasts[date].humiditySum += item.main.humidity;
        dailyForecasts[date].count += 1;
        dailyForecasts[date].descriptions.push(item.weather[0].description);
      });

      // Process averaged forecasts starting from TOMORROW (slice(1, 6) for 5 future days)
      const sortedDates = Object.keys(dailyForecasts).sort();
      const futureDates = sortedDates.slice(1, 6); // Skip today, take next 5 days
      const averagedForecasts = futureDates.map(date => {
        const data = dailyForecasts[date];
        const avgTemp = data.tempSum / data.count;
        const avgHumidity = data.humiditySum / data.count;

        // Determine most common weather description and icon for the day
        const descriptionCounts = {};
        const iconCounts = {};
        forecastList.forEach(item => {
          const itemDate = new Date(item.dt * 1000).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          if (itemDate === date) {
            const desc = item.weather[0].description;
            const icon = item.weather[0].icon;
            descriptionCounts[desc] = (descriptionCounts[desc] || 0) + 1;
            iconCounts[icon] = (iconCounts[icon] || 0) + 1;
          }
        });
        const mostCommonDescription = Object.entries(descriptionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'clear';
        const mostCommonIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '01d';

  // Force icon to day ('d') or night ('n') variant so all panels match current local day/night
  const iconSuffix = night ? 'n' : 'd';
  const normalizedIcon = mostCommonIcon ? (mostCommonIcon.slice(0, -1) + iconSuffix) : mostCommonIcon;
  return { date, avgTemp, avgHumidity, description: mostCommonDescription, icon: normalizedIcon };
      });
      setForecast(averagedForecasts);

      // Extract temperatures for the next 24 hours (filtered from forecast list)
      const now = Math.floor(Date.now() / 1000);
      const next24Hours = forecastList.filter(item => item.dt >= now && item.dt <= now + 24 * 3600);
      // Use the city's timezone offset when formatting hourly times so labels match the city's local time
      setHourlyTemps(next24Hours.map(item => ({
        time: new Date((item.dt + timezoneOffset) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temp: item.main.temp
      })));
    } catch (err) {
      console.error('Weather fetch error:', err); // Log errors for debugging
      setError('Error fetching weather: ' + (err.response ? err.response.data : err.message) + ' (Check API key or city name)');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a city to the favorites list via API.
   * @param {string} favCity - The city to add as a favorite.
   */
  const addFavorite = async (favCity) => {
    try {
      await axios.post('http://localhost:8080/api/favorites', { city: favCity });
      loadFavorites(); // Reload favorites after adding
    } catch (err) {
      setError('Error adding favorite: ' + (err.response ? err.response.data : err.message));
    }
  };

  /**
   * Removes a city from the favorites list via API.
   * @param {string} favCity - The city to remove from favorites.
   */
  const removeFavorite = async (favCity) => {
    try {
      await axios.delete(`http://localhost:8080/api/favorites/${favCity}`);
      loadFavorites(); // Reload favorites after removal
    } catch (err) {
      setError('Error removing favorite: ' + (err.response ? err.response.data : err.message));
    }
  };

  /**
   * Loads the list of favorite cities from the API.
   */
  const loadFavorites = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/favorites');
      setFavorites(res.data);
    } catch (err) {
      setError('Error loading favorites: ' + (err.response ? err.response.data : err.message));
    }
  };

  // Effect to load initial data: favorites and geolocation-based weather
  useEffect(() => {
    setLoading(true);
    loadFavorites(); // Load favorites on mount

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Geolocation coordinates:", pos.coords); // Debug log for coordinates
        // Reverse geocode to get city name
        axios.get(`http://localhost:8080/api/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then((geoRes) => {
            let localCity = geoRes.data;
            console.log("Reverse geocode result:", localCity); // Debug log for geocode result
            // Fallback to 'London' if result is invalid (e.g., municipality or non-alphabetic)
            if (localCity.toLowerCase().includes("municipality") || !localCity.match(/^[a-zA-Z\s]+$/)) {
              localCity = "London";
            }
            setCity(localCity);
            fetchWeather(localCity);
          })
          .catch((err) => {
            console.error("Geolocation reverse error:", err);
            setError('Geolocation error: ' + err.message);
            fetchWeather('London'); // Fallback to default city
          });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError('Geolocation error: ' + err.message);
        fetchWeather('London'); // Fallback to default city on geolocation failure
      }
    );
  }, []); // Empty dependency array: runs once on mount

  /**
   * Handles city search form submission.
   * @param {Event} e - The form submission event.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      console.log("Searching for city:", city); // Debug log for search input
      fetchWeather(city);
      setCity(''); // Clear input after search
    } else {
      setError('Please enter a city name.');
    }
  };

  /**
   * Determines the background CSS class based on weather condition.
   * @param {string} condition - The main weather condition (e.g., 'Rain', 'Clear').
   * @returns {string} - The corresponding CSS class.
   */
  const getBackgroundClass = (condition) => {
    if (!condition) return 'clear';
    const code = condition.toLowerCase();
    if (code.includes('rain')) return 'rainy';
    if (code.includes('cloud')) return 'cloudy';
    if (code.includes('snow')) return 'snowy';
    if (code.includes('clear')) return 'sunny';
    return 'clear'; // Default fallback
  };

  /**
   * Gets the URL for the weather icon from OpenWeatherMap.
   * @param {string} icon - The icon code from API.
   * @returns {string} - The full icon URL.
   */
  const getIconUrl = (icon) => {
    if (icon) {
      return `http://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    // Fallback to a default icon if none provided
    return `http://openweathermap.org/img/wn/01d@2x.png`;
  };

  /**
   * Gets the full day name from a date string.
   * @param {string} dateStr - The date string in 'YYYY-MM-DD' format.
   * @returns {string} - The weekday name (e.g., 'Monday').
   */
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  /**
   * Opens Google Maps for the current city's location.
   */
  const handleSeeOnMap = () => {
    if (weather) {
      const url = `https://www.google.com/maps/search/?api=1&query=${weather.name},${weather.sys.country}`;
      window.open(url, '_blank'); // Open in new tab
    }
  };

  // Render the main UI
  return (
    <div className={`min-h-screen flex flex-col items-center p-4 transition-background duration-1000 ease-in-out ${getBackgroundClass(weather?.weather[0].main)} ${isNight ? 'night' : 'day'}`}>
      <h1 className="text-4xl title-font mb-4 text-white">CoolWeather</h1>
      {/* Search form */}
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
      {/* Current weather display */}
      {weather && (
        <div className="bg-white/70 p-4 rounded-lg shadow-lg mb-4 w-full max-w-md text-center">
          <h2 className="text-3xl font-semibold">{weather.name}, {weather.sys.country}</h2>
          <img
            src={getIconUrl(weather.weather[0].icon)}
            alt={weather.weather[0].description}
            className="mx-auto"
          />
          <p className="text-xl">{weather.main.temp}°C</p>
          <p className="capitalize">{weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind: {weather.wind.speed} m/s</p>
          <p>Local Time: {currentTime}</p>
          {/* Action buttons */}
          <div className="mt-2 flex justify-center space-x-2">
            <button onClick={() => addFavorite(weather.name)} className="p-2 bg-green-500 text-white rounded">Add Favorite</button>
            <button onClick={() => setShowDetails(!showDetails)} className="p-2 bg-blue-500 text-white rounded">See Details</button>
            <button onClick={() => setShow24hForecast(!show24hForecast)} className="p-2 bg-purple-500 text-white rounded">24h Forecast</button>
          </div>
          <button onClick={handleSeeOnMap} className="mt-2 p-2 bg-yellow-500 text-white rounded">See on Map</button>
          {/* Detailed weather section (toggleable) */}
          {showDetails && (
            <div className="mt-4 p-4 bg-white/80 rounded-lg shadow-lg transition-opacity duration-500 ease-in-out opacity-100" style={{ display: showDetails ? 'block' : 'none' }}>
              <h3 className="text-2xl font-semibold mb-2">Detailed Weather</h3>
              <p>Pressure: {weather.main.pressure} hPa</p>
              <p>Wind Direction: {weather.wind.deg}°</p>
              <p>Visibility: {(weather.visibility / 1000).toFixed(1)} km</p>
              <p>Cloudiness: {weather.clouds.all}%</p>
              <p>Sea Level: {weather.main.sea_level || 'N/A'} hPa</p>
              <p>Ground Level: {weather.main.grnd_level || 'N/A'} hPa</p>
              <p>Sunrise: {new Date((weather.sys.sunrise + (weather.timezone || 0)) * 1000).toLocaleTimeString()}</p>
              <p>Sunset: {new Date((weather.sys.sunset + (weather.timezone || 0)) * 1000).toLocaleTimeString()}</p>
              <p>Feels Like: {weather.main.feels_like}°C</p>
            </div>
          )}
        </div>
      )}
      {/* Country capital weather display */}
      {countryWeather && (
        <div className="bg-white/70 p-4 rounded-lg shadow-lg mb-4 w-full max-w-md text-center">
          <h3 className="text-2xl font-semibold">Overall in {country} (Capital: {countryCapitals[country]})</h3>
          <img
            src={getIconUrl(countryWeather.weather[0].icon)}
            alt={countryWeather.weather[0].description}
            className="mx-auto"
          />
          <p className="text-xl">{countryWeather.main.temp}°C</p>
          <p className="capitalize">{countryWeather.weather[0].description}</p>
        </div>
      )}
      {/* 5-day forecast grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 w-full max-w-5xl">
        {forecast.map((day, idx) => (
          <div key={idx} className="p-4 rounded-lg shadow-lg text-center bg-white/80">
            <p className="font-bold">{getDayName(day.date)}</p>
            <p className="text-sm">{day.date}</p>
            <img
              src={getIconUrl(day.icon)}
              alt={day.description}
              className="mx-auto"
            />
            <p>{day.avgTemp.toFixed(1)}°C</p>
            <p className="capitalize">{day.description}</p>
            <p>Humidity: {day.avgHumidity.toFixed(1)}%</p>
          </div>
        ))}
      </div>
      {/* Favorites list */}
      <div className="bg-white/70 p-4 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl mb-2">Favorites</h3>
        <ul className="list-disc pl-4">
          {favorites.map((fav, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span onClick={() => fetchWeather(fav)} className="cursor-pointer hover:underline flex-1">{fav}</span>
              <button onClick={() => removeFavorite(fav)} className="ml-2 p-1 bg-red-500 text-white rounded text-xs">Remove</button>
            </li>
          ))}
        </ul>
      </div>
      {/* 24-hour forecast sidebar (toggleable) */}
      <div className={`sidebar ${show24hForecast ? 'open' : 'closed'}`}>
        <h3 className="text-xl font-semibold mb-2">24-Hour Forecast</h3>
        <p className="text-sm text-gray-600">Note: Data is provided in 3-hour intervals (up to 8 entries in 24 hours).</p>
        <div className="mt-2 space-y-2">
          {hourlyTemps.map((hour, idx) => (
            <div key={idx} className="flex justify-between p-2 bg-gray-200 rounded">
              <span>{hour.time}</span>
              <span>{hour.temp.toFixed(1)}°C</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShow24hForecast(false)}
          className="mt-4 p-2 bg-red-500 text-white rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default App;