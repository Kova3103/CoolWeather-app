package com.coolweather.controller;

import com.coolweather.entity.FavoriteCity;
import com.coolweather.repository.FavoriteCityRepository;
import com.coolweather.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for weather and favorites endpoints.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}) // Support both frontend ports
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private FavoriteCityRepository repository;

    /**
     * Fetches current weather for a city.
     * @param city City name
     * @return JSON weather data or error response
     */
    @GetMapping("/weather/{city}")
    public ResponseEntity<?> getWeather(@PathVariable String city) {
        Map<String, Object> weather = weatherService.getWeather(city);
        if (weather == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to fetch weather data. Check API key or city name.");
        }
        return ResponseEntity.ok(weather);
    }

    /**
     * Fetches 5-day forecast for a city.
     * @param city City name
     * @return JSON forecast data or error response
     */
    @GetMapping("/forecast/{city}")
    public ResponseEntity<?> getForecast(@PathVariable String city) {
        Map<String, Object> forecast = weatherService.getForecast(city);
        if (forecast == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to fetch forecast data. Check API key or city name.");
        }
        return ResponseEntity.ok(forecast);
    }

    /**
     * Reverse geocode lat/lon to city.
     * @param lat Latitude
     * @param lon Longitude
     * @return City name or error
     */
    @GetMapping("/reverse")
    public ResponseEntity<?> getCityFromLatLon(@RequestParam double lat, @RequestParam double lon) {
        String city = weatherService.getCityFromLatLon(lat, lon);
        if (city == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to get city from location.");
        }
        return ResponseEntity.ok(city);
    }

    /**
     * Adds a city to favorites.
     * @param body JSON with city name
     * @return Success or error response
     */
    @Transactional
    @PostMapping("/favorites")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, String> body) {
        try {
            String favCity = body.get("city");
            if (favCity == null || favCity.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("City name is required.");
            }
            if (repository.findByCityName(favCity) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("City already in favorites.");
            }
            FavoriteCity favorite = new FavoriteCity();
            favorite.setCityName(favCity);
            repository.save(favorite);
            return ResponseEntity.ok("Favorite added successfully.");
        } catch (Exception e) {
            System.err.println("Error adding favorite: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding favorite: " + e.getMessage());
        }
    }

    /**
     * Removes a city from favorites.
     * @param city City name
     * @return Success or error response
     */
    @Transactional
    @DeleteMapping("/favorites/{city}")
    public ResponseEntity<?> removeFavorite(@PathVariable String city) {
        try {
            FavoriteCity favorite = repository.findByCityName(city);
            if (favorite == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("City not found in favorites.");
            }
            repository.deleteByCityName(city);
            System.out.println("Successfully removed favorite: " + city); // Debug log
            return ResponseEntity.ok("Favorite removed successfully.");
        } catch (Exception e) {
            System.err.println("Error removing favorite: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error removing favorite: " + e.getMessage());
        }
    }

    /**
     * Lists favorite cities.
     * @return List of city names
     */
    @GetMapping("/favorites")
    public List<String> getFavorites() {
        return repository.findAll().stream().map(FavoriteCity::getCityName).collect(Collectors.toList());
    }
}
