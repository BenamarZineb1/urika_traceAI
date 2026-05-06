package com.urika.workflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TaskCreationDTO {

    @NotBlank(message = "Le titre de la tâche ne peut pas être vide")
    private String title;

    @NotBlank(message = "Une compétence requise doit être spécifiée (ex: JAVA)")
    private String requiredSkill;

    @Min(value = 1, message = "La priorité minimale est 1")
    @Max(value = 5, message = "La priorité maximale est 5")
    private int priority;

    private Long workflowId;

    // Vos Getters et Setters existants...
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getRequiredSkill() { return requiredSkill; }
    public void setRequiredSkill(String requiredSkill) { this.requiredSkill = requiredSkill; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    public Long getWorkflowId() { return workflowId; }
    public void setWorkflowId(Long workflowId) { this.workflowId = workflowId; }
}