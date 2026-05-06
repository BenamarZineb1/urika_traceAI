package com.urika.workflow.service;

import com.urika.workflow.model.Task;
import com.urika.workflow.model.User;
import com.urika.workflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class TaskRecommenderService {

    private final UserRepository userRepository;

    public TaskRecommenderService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> recommendBestUserForTask(Task task) {
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                // 1. Filtrage insensible à la casse (Java == java == JAVA)
                .filter(user -> user.getSkills() != null &&
                        user.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase(task.getRequiredSkill().trim())))
                // 2. Tri par charge de travail minimale
                .min(Comparator.comparingInt(User::getCurrentWorkload));
    }
}