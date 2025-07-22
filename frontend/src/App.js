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
  const [isNight, setIsNight] = useState(false);

  const countryCapitals = {
    "AF": "Kabul",
    "AL": "Tirana",
    "DZ": "Algiers",
    "AS": "Pago Pago",
    "AD": "Andorra la Vella",
    "AO": "Luanda",
    "AI": "The Valley",
    "AG": "Saint John's",
    "AR": "Buenos Aires",
    "AM": "Yerevan",
    "AW": "Oranjestad",
    "AU": "Canberra",
    "AT": "Vienna",
    "AZ": "Baku",
    "BS": "Nassau",
    "BH": "Manama",
    "BD": "Dhaka",
    "BB": "Bridgetown",
    "BY": "Minsk",
    "BE": "Brussels",
    "BZ": "Belmopan",
    "BJ": "Porto-Novo",
    "BM": "Hamilton",
    "BT": "Thimphu",
    "BO": "Sucre",
    "BQ": "Kralendijk",
    "BA": "Sarajevo",
    "BW": "Gaborone",
    "BV": "Bouvet Island",
    "BR": "Brasília",
    "IO": "Diego Garcia",
    "BN": "Bandar Seri Begawan",
    "BG": "Sofia",
    "BF": "Ouagadougou",
    "BI": "Bujumbura",
    "CV": "Praia",
    "KH": "Phnom Penh",
    "CM": "Yaoundé",
    "CA": "Ottawa",
    "KY": "George Town",
    "CF": "Bangui",
    "TD": "N'Djamena",
    "CL": "Santiago",
    "CN": "Beijing",
    "CX": "Flying Fish Cove",
    "CC": "West Island",
    "CO": "Bogotá",
    "KM": "Moroni",
    "CD": "Kinshasa",
    "CG": "Brazzaville",
    "CK": "Avarua",
    "CR": "San José",
    "HR": "Zagreb",
    "CU": "Havana",
    "CW": "Willemstad",
    "CY": "Nicosia",
    "CZ": "Prague",
    "DK": "Copenhagen",
    "DJ": "Djibouti",
    "DM": "Roseau",
    "DO": "Santo Domingo",
    "EC": "Quito",
    "EG": "Cairo",
    "SV": "San Salvador",
    "GQ": "Malabo",
    "ER": "Asmara",
    "EE": "Tallinn",
    "SZ": "Mbabane",
    "ET": "Addis Ababa",
    "FK": "Stanley",
    "FO": "Tórshavn",
    "FJ": "Suva",
    "FI": "Helsinki",
    "FR": "Paris",
    "GF": "Cayenne",
    "PF": "Papeetē",
    "TF": "Port-aux-Français",
    "GA": "Libreville",
    "GM": "Banjul",
    "GE": "Tbilisi",
    "DE": "Berlin",
    "GH": "Accra",
    "GI": "Gibraltar",
    "GR": "Athens",
    "GL": "Nuuk",
    "GD": "St. George's",
    "GP": "Basse-Terre",
    "GU": "Hagåtña",
    "GT": "Guatemala City",
    "GG": "St. Peter Port",
    "GN": "Conakry",
    "GW": "Bissau",
    "GY": "Georgetown",
    "HT": "Port-au-Prince",
    "HM": "Heard Island and McDonald Islands",
    "VA": "Vatican City",
    "HN": "Tegucigalpa",
    "HK": "Hong Kong",
    "HU": "Budapest",
    "IS": "Reykjavík",
    "IN": "New Delhi",
    "ID": "Jakarta",
    "IR": "Tehran",
    "IQ": "Baghdad",
    "IE": "Dublin",
    "IM": "Douglas",
    "IL": "Jerusalem",
    "IT": "Rome",
    "JM": "Kingston",
    "JP": "Tokyo",
    "JE": "Saint Helier",
    "JO": "Amman",
    "KZ": "Nur-Sultan",
    "KE": "Nairobi",
    "KI": "South Tarawa",
    "KP": "Pyongyang",
    "KR": "Seoul",
    "KW": "Kuwait City",
    "KG": "Bishkek",
    "LA": "Vientiane",
    "LV": "Riga",
    "LB": "Beirut",
    "LS": "Maseru",
    "LR": "Monrovia",
    "LY": "Tripoli",
    "LI": "Vaduz",
    "LT": "Vilnius",
    "LU": "Luxembourg",
    "MO": "Macao",
    "MK": "Skopje",
    "MG": "Antananarivo",
    "MW": "Lilongwe",
    "MY": "Kuala Lumpur",
    "MV": "Malé",
    "ML": "Bamako",
    "MT": "Valletta",
    "MH": "Majuro",
    "MQ": "Fort-de-France",
    "MR": "Nouakchott",
    "MU": "Port Louis",
    "YT": "Mamoudzou",
    "MX": "Mexico City",
    "FM": "Palikir",
    "MD": "Chișinău",
    "MC": "Monaco",
    "MN": "Ulan Bator",
    "ME": "Podgorica",
    "MS": "Plymouth",
    "MA": "Rabat",
    "MZ": "Maputo",
    "MM": "Naypyidaw",
    "NA": "Windhoek",
    "NR": "Yaren",
    "NP": "Kathmandu",
    "NL": "Amsterdam",
    "NC": "Nouméa",
    "NZ": "Wellington",
    "NI": "Managua",
    "NE": "Niamey",
    "NG": "Abuja",
    "NU": "Alofi",
    "NF": "Kingston",
    "NO": "Oslo",
    "OM": "Muscat",
    "PK": "Islamabad",
    "PW": "Ngerulmud",
    "PS": "Ramallah",
    "PA": "Panama City",
    "PG": "Port Moresby",
    "PY": "Asunción",
    "PE": "Lima",
    "PH": "Manila",
    "PN": "Adamstown",
    "PL": "Warsaw",
    "PT": "Lisbon",
    "PR": "San Juan",
    "QA": "Doha",
    "RE": "Saint-Denis",
    "RO": "Bucharest",
    "RU": "Moscow",
    "RW": "Kigali",
    "BL": "Gustavia",
    "SH": "Jamestown",
    "KN": "Basseterre",
    "LC": "Castries",
    "MF": "Marigot",
    "PM": "Saint-Pierre",
    "VC": "Kingstown",
    "WS": "Apia",
    "SM": "San Marino",
    "ST": "São Tomé",
    "SA": "Riyadh",
    "SN": "Dakar",
    "RS": "Belgrade",
    "SC": "Victoria",
    "SL": "Freetown",
    "SG": "Singapore",
    "SX": "Philipsburg",
    "SK": "Bratislava",
    "SI": "Ljubljana",
    "SB": "Honiara",
    "SO": "Mogadishu",
    "ZA": "Pretoria",
    "GS": "Grytviken",
    "SS": "Juba",
    "ES": "Madrid",
    "LK": "Sri Jayawardenepura Kotte",
    "SD": "Khartoum",
    "SR": "Paramaribo",
    "SJ": "Longyearbyen",
    "SE": "Stockholm",
    "CH": "Bern",
    "SY": "Damascus",
    "TW": "Taipei",
    "TJ": "Dushanbe",
    "TZ": "Dodoma",
    "TH": "Bangkok",
    "TL": "Dili",
    "TG": "Lomé",
    "TK": "Fakaofo",
    "TO": "Nuku'alofa",
    "TT": "Port of Spain",
    "TN": "Tunis",
    "TR": "Ankara",
    "TM": "Ashgabat",
    "TC": "Cockburn Town",
    "TV": "Funafuti",
    "UG": "Kampala",
    "UA": "Kyiv",
    "AE": "Abu Dhabi",
    "GB": "London",
    "US": "Washington, D.C.",
    "UY": "Montevideo",
    "UZ": "Tashkent",
    "VU": "Port Vila",
    "VE": "Caracas",
    "VN": "Hanoi",
    "VG": "Road Town",
    "VI": "Charlotte Amalie",
    "WF": "Mata-Utu",
    "EH": "El Aaiún",
    "YE": "Sana'a",
    "ZM": "Lusaka",
    "ZW": "Harare"
  };

  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:8080/api/weather/${searchCity}`);
      setWeather(res.data);
      const currentTime = Math.floor(Date.now() / 1000);
      const sunrise = res.data.sys.sunrise;
      const sunset = res.data.sys.sunset;
      setIsNight(currentTime < sunrise || currentTime > sunset);
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
      if (favorites.includes(favCity)) {
        setError('City already in favorites.');
        return;
      }
      const response = await axios.post('http://localhost:8080/api/favorites', { city: favCity });
      if (response.status === 200) {
        loadFavorites();
      }
    } catch (err) {
      setError('Error adding favorite: ' + (err.response ? err.response.data : err.message));
    }
  };

  const removeFavorite = async (favCity) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/favorites/${favCity}`);
      if (response.status === 200) {
        loadFavorites();
      }
    } catch (err) {
      setError('Error removing favorite: ' + (err.response ? err.response.data : err.message));
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
    setLoading(true);
    loadFavorites();
    navigator.geolocation.getCurrentPosition((pos) => {
      axios.get(`http://localhost:8080/api/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
        .then((geoRes) => {
          const localCity = geoRes.data;
          setCity(localCity);
          fetchWeather(localCity);
        })
        .catch(() => fetchWeather('London'));
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
    <div className={`min-h-screen flex flex-col items-center p-4 transition-background duration-1000 ease-in-out ${getBackgroundClass(weather?.weather[0].main)} ${isNight ? 'night' : 'day'}`}>
      <h1 className="text-4xl title-font mb-4 text-white">CoolWeather</h1>
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
          <div key={idx} className="p-4 rounded-lg shadow-lg text-center bg-white/80">
            <p className="font-bold">{new Date(item.dt * 1000).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
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
            <li key={idx} className="flex justify-between items-center">
              <span onClick={() => fetchWeather(fav)} className="cursor-pointer hover:underline flex-1">{fav}</span>
              <button onClick={() => removeFavorite(fav)} className="ml-2 p-1 bg-red-500 text-white rounded text-xs">Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
