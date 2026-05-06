package com.urika.workflow.controller;

import com.urika.workflow.dto.TaskCreationDTO;
import com.urika.workflow.model.Task;
import com.urika.workflow.repository.TaskRepository;
import com.urika.workflow.service.TaskManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200") // Autorise Angular
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskManagementService taskManagementService; // Injection du service intelligent

    // 1. Création ET Assignation Intelligente
    @PostMapping
    public Task create(@RequestBody TaskCreationDTO dto) {
        // On passe par le service qui va chercher le meilleur utilisateur
        return taskManagementService.createAndAssignTask(dto);
    }

    // 2. Récupérer toutes les tâches
    @GetMapping
    public List<Task> getAll() {
        return taskRepository.findAll();
    }

    // 3. Clôturer une tâche (Nouvel endpoint ajouté !)
    @PutMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        return taskManagementService.completeTask(id);
    }
}