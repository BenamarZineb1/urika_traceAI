package com.urika.workflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Désactive la protection CSRF pour permettre les requêtes POST depuis Swagger
                .csrf(AbstractHttpConfigurer::disable)
                // Configuration des autorisations
                .authorizeHttpRequests(auth -> auth
                        // Autorise l'accès libre à l'interface Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Autorise l'accès libre à nos points d'entrée (endpoints) pour le développement
                        .requestMatchers("/api/**").permitAll()
                        // Exige une authentification pour tout le reste
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}