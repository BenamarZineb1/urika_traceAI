package com.urika.workflow.service;

import com.urika.workflow.model.Task;
import com.urika.workflow.model.User;
import com.urika.workflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskRecommenderService {

    private final UserRepository userRepository;

    public TaskRecommenderService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Recommande et attribue le meilleur ingénieur disponible pour une tâche donnée.
     * Sécurisé contre les valeurs nulles ou les listes d'utilisateurs vides.
     */
    public Optional<User> recommendBestUserForTask(Task task) {
        // 1. Sécurité : Si aucun skill n'est requis ou fourni, on évite le crash SQL
        if (task == null || task.getRequiredSkill() == null || task.getRequiredSkill().isBlank()) {
            return Optional.empty();
        }

        // 2. Appel au Repository (qui trie déjà par u.currentWorkload ASC)
        List<User> sortedUsers = userRepository.findBestUsers(task.getRequiredSkill());

        // 3. Retourne le premier utilisateur (le moins chargé) s'il existe
        return sortedUsers.isEmpty() ? Optional.empty() : Optional.of(sortedUsers.get(0));
    }
}