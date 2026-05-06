package com.urika.workflow.config;

import com.urika.workflow.model.User;
import com.urika.workflow.model.Workflow;
import com.urika.workflow.repository.UserRepository;
import com.urika.workflow.repository.WorkflowRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, WorkflowRepository workflowRepository) {
        return args -> {
            // 1. Initialisation des Utilisateurs
            if (userRepository.count() == 0) {
                User user1 = new User();
                user1.setUsername("Alice_Dev");
                user1.setSkills(Set.of("JAVA", "SQL"));
                user1.setCurrentWorkload(3);

                User user2 = new User();
                user2.setUsername("Bob_Data");
                user2.setSkills(Set.of("PYTHON", "DATA_ANALYSIS"));
                user2.setCurrentWorkload(1);

                User user3 = new User();
                user3.setUsername("Charlie_Dev");
                user3.setSkills(Set.of("JAVA", "REACT"));
                user3.setCurrentWorkload(0);

                userRepository.saveAll(Set.of(user1, user2, user3));
                System.out.println("✅ Jeu de données d'utilisateurs chargé avec succès !");
            }

            // 2. Initialisation des Workflows (Ce qu'il manquait !)
            if (workflowRepository.count() == 0) {
                Workflow defaultWorkflow = new Workflow();
                defaultWorkflow.setName("Développement Backend");
                defaultWorkflow.setStatus("ACTIVE");
                // Selon votre modèle Workflow, vous pouvez ajouter d'autres champs ici

                workflowRepository.save(defaultWorkflow);
                System.out.println("✅ Jeu de données de workflows chargé avec succès !");
            }
        };
    }
}