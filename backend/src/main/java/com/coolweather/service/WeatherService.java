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
            System.err.println("Weather API error: " + e.getMessage());
            return null; // Or throw a custom exception
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
            System.err.println("Forecast API error: " + e.getMessage());
            return null; // Or throw a custom exception
        }
    }
}