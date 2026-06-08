package com.urika.workflow.controller;

import com.urika.workflow.dto.JwtResponse;
import com.urika.workflow.dto.LoginRequest;
import com.urika.workflow.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // À restreindre en production à l'URL de votre application Angular
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    // Injection par constructeur conforme aux standards de production Spring
    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        
        // 1. Authentification de l'ingénieur via le gestionnaire de Spring Security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        // 2. Stockage de l'authentification validée dans le contexte Thread-Local du serveur
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Génération du jeton cryptographique JWT contenant l'identité de l'utilisateur
        String jwt = tokenProvider.generateToken(authentication);
        
        // 4. Renvoi du payload standardisé à la SPA Angular
        return ResponseEntity.ok(new JwtResponse(jwt, loginRequest.getUsername()));
    }
}