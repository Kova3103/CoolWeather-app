package com.coolweather.repository;

import com.coolweather.entity.FavoriteCity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for favorite cities.
 */
public interface FavoriteCityRepository extends JpaRepository<FavoriteCity, Long> {
    void deleteByCityName(String cityName); // For removing by city name
    FavoriteCity findByCityName(String cityName); // For checking if exists
}