package com.urika.workflow.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(
        name = "tasks",
        uniqueConstraints = @UniqueConstraint(columnNames = "traceId")
)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status = "PENDING";

    private String traceId;

    private String assignedRole;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    private String requiredSkill;
    private Integer priority;

    @ManyToOne
    private Workflow workflow;

    @ManyToOne
    private User assignee;

    @PrePersist
    public void init() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}