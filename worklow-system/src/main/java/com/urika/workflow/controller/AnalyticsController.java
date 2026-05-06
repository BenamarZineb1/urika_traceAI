package com.urika.workflow.controller;

import com.urika.workflow.service.WorkflowAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
@Tag(name = "Analyses et Tableau de bord", description = "Endpoints pour récupérer les métriques du système")
public class AnalyticsController {

    private final WorkflowAnalyticsService analyticsService;

    public AnalyticsController(WorkflowAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Obtenir les métriques", description = "Renvoie les indicateurs clés (KPIs) comme le nombre de tâches en attente et le temps moyen de résolution.")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        metrics.put("pendingTasksCount", analyticsService.countPendingTasks());
        metrics.put("averageCompletionTimeMinutes", analyticsService.calculateAverageCompletionTimeMinutes());

        return ResponseEntity.ok(metrics);
    }
}