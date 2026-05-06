package com.urika.workflow.service;

import com.urika.workflow.dto.TaskCreationDTO;
import com.urika.workflow.model.Task;
import com.urika.workflow.model.User;
import com.urika.workflow.model.Workflow;
import com.urika.workflow.repository.TaskRepository;
import com.urika.workflow.repository.UserRepository;
import com.urika.workflow.repository.WorkflowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class TaskManagementService {

    private final TaskRepository taskRepository;
    private final WorkflowRepository workflowRepository;
    private final UserRepository userRepository;
    private final TaskRecommenderService recommenderService;

    public TaskManagementService(TaskRepository taskRepository, WorkflowRepository workflowRepository,
                                 UserRepository userRepository, TaskRecommenderService recommenderService) {
        this.taskRepository = taskRepository;
        this.workflowRepository = workflowRepository;
        this.userRepository = userRepository;
        this.recommenderService = recommenderService;
    }

    @Transactional
    public Task createAndAssignTask(TaskCreationDTO dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setRequiredSkill(dto.getRequiredSkill());
        task.setPriority(dto.getPriority());

        // Lier la tâche au workflow s'il est fourni
        if (dto.getWorkflowId() != null) {
            Optional<Workflow> workflowOpt = workflowRepository.findById(dto.getWorkflowId());
            workflowOpt.ifPresent(task::setWorkflow);
        }

        // --- Logique Intelligente : Assignation automatique ---
        Optional<User> bestUserOpt = recommenderService.recommendBestUserForTask(task);

        if (bestUserOpt.isPresent()) {
            User bestUser = bestUserOpt.get();
            task.setAssignee(bestUser);

            // Augmenter la charge de travail de l'utilisateur
            bestUser.setCurrentWorkload(bestUser.getCurrentWorkload() + 1);
            userRepository.save(bestUser);
        } else {
            // Optionnel : Gérer le cas où aucun utilisateur n'a la compétence requise
            task.setStatus("UNASSIGNED");
        }

        return taskRepository.save(task);
    }

    // --- NOUVELLE MÉTHODE : Clôture de la tâche et libération de l'employé ---
    @Transactional
    public Task completeTask(Long taskId) {
        // 1. Récupérer la tâche
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'ID : " + taskId));

        // 2. Vérifier si elle n'est pas déjà terminée
        if ("COMPLETED".equals(task.getStatus())) {
            throw new RuntimeException("Cette tâche est déjà marquée comme terminée.");
        }

        // 3. Mettre à jour la tâche
        task.setStatus("COMPLETED");
        task.setCompletedAt(java.time.LocalDateTime.now());

        // 4. Libérer l'employé (réduire sa charge de travail)
        User assignee = task.getAssignee();
        if (assignee != null) {
            // On s'assure que la charge ne devienne jamais négative
            int newWorkload = Math.max(0, assignee.getCurrentWorkload() - 1);
            assignee.setCurrentWorkload(newWorkload);
            userRepository.save(assignee);
        }

        return taskRepository.save(task);
    }
}