package com.urika.workflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // Récupère la clé secrète depuis application.properties ou utilise une valeur par défaut sécurisée
    @Value("${app.jwtSecret:UneCleSecreteTresLongueQuiDoitFaireAuMoins256BitsPourEtreSecurisee_Urika2024}")
    private String jwtSecret;

    // Durée de validité du token (24 heures par défaut)
    @Value("${app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        String username;
        if (authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            username = authentication.getPrincipal().toString();
        }

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            logger.error("Signature JWT invalide : {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Le token JWT a expiré : {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Le token JWT n'est pas supporté : {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("La chaîne claims JWT est vide : {}", e.getMessage());
        }
        return false;
    }
}