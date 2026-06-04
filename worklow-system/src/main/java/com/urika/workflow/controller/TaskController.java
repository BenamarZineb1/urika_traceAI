package com.urika.workflow.controller;

import com.urika.workflow.dto.TaskCreationDTO;
import com.urika.workflow.model.Task;
import com.urika.workflow.repository.TaskRepository;
import com.urika.workflow.service.TaskManagementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8000"})
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskManagementService taskManagementService;

    public TaskController(TaskRepository taskRepository, TaskManagementService taskManagementService) {
        this.taskRepository = taskRepository;
        this.taskManagementService = taskManagementService;
    }

    @PostMapping
    public Task create(@RequestBody TaskCreationDTO dto) {
        return taskManagementService.createAndAssignTask(dto);
    }

    @GetMapping
    public List<Task> getAll() {
        return taskRepository.findAll();
    }

    @PutMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        return taskManagementService.completeTask(id);
    }
}