package com.urika.workflow.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Bienvenue sur le Système Intelligent de Gestion des Workflows ! L'API fonctionne parfaitement.";
    }
}