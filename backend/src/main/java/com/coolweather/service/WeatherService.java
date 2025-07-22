package com.coolweather.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

/**
 * Service to fetch weather data from OpenWeatherMap.
 */
@Service
public class WeatherService {

    @Value("${openweathermap.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Retrieves current weather for a city.
     * @param city City name
     * @return Weather data as JSON or null if error
     */
    public Map<String, Object> getWeather(String city) {
        try {
            String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=metric";
            return restTemplate.getForObject(url, Map.class);
        } catch (HttpClientErrorException e) {
            System.err.println("Weather API error: " + e.getMessage() + " - Status: " + e.getStatusCode());
            return null;
        } catch (Exception e) {
            System.err.println("Unexpected error fetching weather: " + e.getMessage());
            return null;
        }
    }

    /**
     * Retrieves 5-day forecast for a city.
     * @param city City name
     * @return Forecast data as JSON or null if error
     */
    public Map<String, Object> getForecast(String city) {
        try {
            String url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey + "&units=metric";
            return restTemplate.getForObject(url, Map.class);
        } catch (HttpClientErrorException e) {
            System.err.println("Forecast API error: " + e.getMessage() + " - Status: " + e.getStatusCode());
            return null;
        } catch (Exception e) {
            System.err.println("Unexpected error fetching forecast: " + e.getMessage());
            return null;
        }
    }

    /**
     * Reverse geocodes lat/lon to city name.
     * @param lat Latitude
     * @param lon Longitude
     * @return City name or null if error
     */
    public String getCityFromLatLon(double lat, double lon) {
        try {
            String url = "https://api.openweathermap.org/geo/1.0/reverse?lat=" + lat + "&lon=" + lon + "&limit=1&appid=" + apiKey;
            @SuppressWarnings("unchecked")
            Map<String, Object>[] response = restTemplate.getForObject(url, Map[].class);
            if (response != null && response.length > 0) {
                return (String) response[0].get("name");
            }
            return null;
        } catch (Exception e) {
            System.err.println("Reverse geocode error: " + e.getMessage());
            return null;
        }
    }
}