import { useState } from "react";
import "./App.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getWeather() {
    console.log("Button clicked");
    console.log("City:", city);

    if (!city.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();
      console.log("Geo data:", geoData);

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found.");
        return;
      }

      const place = geoData.results[0];
      const { latitude, longitude, name, country } = place;

      setLocationName(`${name}, ${country}`);

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`
      );

      const weatherData = await weatherResponse.json();
      console.log("Weather data:", weatherData);

      setWeather(weatherData.current);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching weather data.");
    } finally {
      setLoading(false);
    }
  }

 async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        setLoading(true);
        setError("");
        setWeather(null);

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`
        );

        const weatherData = await weatherResponse.json();

        setLocationName("Your location");
        setWeather(weatherData.current);
      } catch (err) {
        console.error(err);
        setError("Could not fetch weather for your location.");
      } finally {
        setLoading(false);
      }
    },
    () => {
      setError("Unable to retrieve your location.");
    }
  );
}


  function getWeatherInfo(code) {
  const weatherCodes = {
    0: { text: "Klar himmel", icon: "☀️" },
    1: { text: "Hovedsaklig klart", icon: "🌤️" },
    2: { text: "Delvis skyet", icon: "⛅" },
    3: { text: "Overskyet", icon: "☁️" },
    45: { text: "Tåke", icon: "🌫️" },
    48: { text: "Avsetter rimtåke", icon: "🌫️" },
    51: { text: "Lett duskregn", icon: "🌦️" },
    53: { text: "Moderat yr", icon: "🌦️" },
    55: { text: "Tett duskregn", icon: "🌧️" },
    61: { text: "Lett regn", icon: "🌦️" },
    63: { text: "Moderat regn", icon: "🌧️" },
    65: { text: "Kraftig regn", icon: "🌧️" },
    71: { text: "Lett snø", icon: "🌨️" },
    73: { text: "Moderat snø", icon: "❄️" },
    75: { text: "Kraftig snø", icon: "❄️" },
    80: { text: "Regnbyger", icon: "🌦️" },
    81: { text: "Moderat regnbyger", icon: "🌧️" },
    82: { text: "Voldsomme regnbyger", icon: "⛈️" },
    95: { text: "Lyn og Torden", icon: "⛈️" }
  };

  return weatherCodes[code] || { text: "Unknown weather", icon: "❓" };
}

const weatherInfo = weather ? getWeatherInfo(weather.weather_code) : null; 

  return (
    <div className="app">
      <h1>Værmelding</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Skriv inn by ..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) =>{ 
            if(e.key === "Enter") {
              getWeather();
            }
          }}
        />
        <button onClick={getWeather}>Søk</button>
      </div>

      <button onClick={getWeatherByLocation}>Min lokasjon</button>


      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
      <div className="weather-card">
      <h2>{locationName}</h2>
      <h3>{weatherInfo.icon} {weatherInfo.text}</h3>
      <p>Temperatur: {weather.temperature_2m}°C</p>
      <p>Vindkast: {weather.wind_speed_10m} km/h</p>
      </div>
      )}
    </div>
  );
}