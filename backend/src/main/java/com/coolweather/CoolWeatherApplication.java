package com.coolweather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main application class for CoolWeather.
 */
@SpringBootApplication
@EnableTransactionManagement // Enable transaction management
public class CoolWeatherApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoolWeatherApplication.class, args);
    }
}