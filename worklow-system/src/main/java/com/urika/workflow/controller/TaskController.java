package com.urika.workflow.controller;

import com.urika.workflow.dto.TaskCreationDTO;
import com.urika.workflow.model.Task;
import com.urika.workflow.repository.TaskRepository;
import com.urika.workflow.service.TaskManagementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // ✅ AJOUT 1 : Synchronisation du statut (IN_PROGRESS, etc.)
    @PutMapping("/{id}/status")
    public Task updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'ID : " + id));
        
        // CORRECTION : On assigne directement le statut en tant que String
        task.setStatus(payload.get("status"));

        return taskRepository.save(task);
    }

    // ✅ AJOUT 2 : Sauvegarde des notes / description depuis la modale
    @PatchMapping("/{id}/description")
    public Task updateDescription(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'ID : " + id));
        
        task.setDescription(payload.get("description"));
        
        return taskRepository.save(task);
    }
}