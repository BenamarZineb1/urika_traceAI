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

import java.time.LocalDateTime;
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

        // 1. Gestion de la contrainte d'idempotence et du bypass 'force'
        if (dto.getTraceId() != null && !dto.isForce()) {
            Optional<Task> existingTask = taskRepository.findByTraceId(dto.getTraceId());
            if (existingTask.isPresent()) {
                System.out.println("⚠️ [Spring Boot] Tâche ignorée : La trace " + dto.getTraceId() + " est déjà associée à un ticket actif.");
                return existingTask.get();
            }
        } else if (dto.getTraceId() != null && dto.isForce()) {
            System.out.println("🔥 [Spring Boot] Mode FORCE activé. Génération d'un nouveau ticket pour la trace : " + dto.getTraceId());
        }

        // 2. Initialisation et normalisation stricte des entrées
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setTraceId(dto.getTraceId());
        task.setPriority(dto.getPriority());

        String normalizedSkill = (dto.getRequiredSkill() != null) ? dto.getRequiredSkill().trim().toUpperCase() : "BACKEND";
        task.setRequiredSkill(normalizedSkill);

        if (dto.getWorkflowId() != null) {
            Optional<Workflow> workflowOpt = workflowRepository.findById(dto.getWorkflowId());
            workflowOpt.ifPresent(task::setWorkflow);
        }

        // 3. Moteur d'assignation intelligent
        Optional<User> bestUserOpt = recommenderService.recommendBestUserForTask(task);

        if (bestUserOpt.isPresent()) {
            User bestUser = bestUserOpt.get();
            task.setAssignee(bestUser);
            task.setAssignedRole(normalizedSkill);
            task.setStatus("PENDING");

            // Mutation de la charge de travail de l'ingénieur sélectionné
            bestUser.setCurrentWorkload(bestUser.getCurrentWorkload() + 1);
            userRepository.save(bestUser);
        } else {
            task.setStatus("UNASSIGNED");
            System.out.println("⚠️ [Spring Boot] Aucun ingénieur disponible pour la compétence : " + normalizedSkill);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'ID : " + taskId));

        if ("COMPLETED".equals(task.getStatus())) {
            throw new RuntimeException("Cette tâche est déjà marquée comme terminée.");
        }

        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());

        // Libération de la charge de travail de l'ingénieur assigné
        User assignee = task.getAssignee();
        if (assignee != null) {
            int newWorkload = Math.max(0, assignee.getCurrentWorkload() - 1);
            assignee.setCurrentWorkload(newWorkload);
            userRepository.save(assignee);
        }

        return taskRepository.save(task);
    }
}