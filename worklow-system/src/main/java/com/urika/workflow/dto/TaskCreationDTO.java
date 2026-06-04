package com.urika.workflow.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskCreationDTO {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String requiredSkill;

    @Min(1)
    @Max(5)
    private int priority;

    private Long workflowId;

    private String traceId;

    private boolean force;
}