package com.urika.workflow.service;

import com.urika.workflow.model.Task;
import com.urika.workflow.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class WorkflowAnalyticsService {

    private final TaskRepository taskRepository;

    public WorkflowAnalyticsService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // 1. Compter les tâches en attente
    public long countPendingTasks() {
        return taskRepository.countByStatus("PENDING");
    }

    // 2. Calculer le temps moyen de résolution des tâches (en minutes)
    public double calculateAverageCompletionTimeMinutes() {
        List<Task> completedTasks = taskRepository.findByStatus("COMPLETED");

        if (completedTasks.isEmpty()) {
            return 0.0; // Éviter la division par zéro s'il n'y a aucune tâche terminée
        }

        long totalMinutes = 0;

        for (Task task : completedTasks) {
            if (task.getCreatedAt() != null && task.getCompletedAt() != null) {
                Duration duration = Duration.between(task.getCreatedAt(), task.getCompletedAt());
                totalMinutes += duration.toMinutes();
            }
        }

        return (double) totalMinutes / completedTasks.size();
    }
}