package com.coolweather.controller;

import com.coolweather.entity.FavoriteCity;
import com.coolweather.repository.FavoriteCityRepository;
import com.coolweather.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for weather and favorites endpoints.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private FavoriteCityRepository repository;

    @GetMapping("/weather/{city}")
    public ResponseEntity<?> getWeather(@PathVariable String city) {
        Map<String, Object> weather = weatherService.getWeather(city);
        if (weather == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to fetch weather data");
        }
        return ResponseEntity.ok(weather);
    }

    @GetMapping("/forecast/{city}")
    public ResponseEntity<?> getForecast(@PathVariable String city) {
        Map<String, Object> forecast = weatherService.getForecast(city);
        if (forecast == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to fetch forecast data");
        }
        return ResponseEntity.ok(forecast);
    }

    @PostMapping("/favorites")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, String> body) {
        try {
            FavoriteCity favorite = new FavoriteCity();
            favorite.setCityName(body.get("city"));
            repository.save(favorite);
            return ResponseEntity.ok("Favorite added");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error adding favorite: " + e.getMessage());
        }
    }

    @GetMapping("/favorites")
    public List<String> getFavorites() {
        return repository.findAll().stream().map(FavoriteCity::getCityName).collect(Collectors.toList());
    }
}
