package com.urika.workflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    // ex: "PENDING", "IN_PROGRESS", "COMPLETED", "UNASSIGNED"
    private String status = "PENDING";

    private String traceId;
    private String assignedRole;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    // --- LES NOUVEAUX CHAMPS POUR TASK MANAGEMENT ---
    private String requiredSkill;
    private Integer priority;

    // Relation avec Workflow (Plusieurs tâches peuvent appartenir à un workflow)
    @ManyToOne
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;

    // Relation avec User (Un utilisateur assigné à la tâche)
    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}