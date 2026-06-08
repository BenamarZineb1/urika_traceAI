package com.urika.workflow.config;

import com.urika.workflow.model.User;
import com.urika.workflow.model.Workflow;
import com.urika.workflow.repository.UserRepository;
import com.urika.workflow.repository.WorkflowRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, WorkflowRepository workflowRepository) {
        return args -> {
            
            if (userRepository.count() == 0) {
                // Le Hash BCrypt correspondant à "password123"
                String defaultPassword = new BCryptPasswordEncoder().encode("password123");

                // 👑 1. L'ADMINISTRATEUR DU SYSTÈME
                User admin = new User();
                admin.setUsername("reda");
                admin.setPassword(defaultPassword);
                admin.setRole("ROLE_ADMIN");
                admin.setSkills(Set.of("MANAGEMENT", "ADMIN"));
                admin.setCurrentWorkload(0);

                // 💻 2. L'ÉQUIPE TECHNIQUE (INGÉNIEURS)
                User backend = new User();
                backend.setUsername("Zineb_Benamar");
                backend.setPassword(defaultPassword);
                backend.setRole("ROLE_USER");
                backend.setSkills(Set.of("BACKEND"));
                backend.setCurrentWorkload(2);

                User dba = new User();
                dba.setUsername("Youssef_ElAlami");
                dba.setPassword(defaultPassword);
                dba.setRole("ROLE_USER");
                dba.setSkills(Set.of("DBA"));
                dba.setCurrentWorkload(0);

                User devops = new User();
                devops.setUsername("Kawtar_Naciri");
                devops.setPassword(defaultPassword);
                devops.setRole("ROLE_USER");
                devops.setSkills(Set.of("DEVOPS"));
                devops.setCurrentWorkload(1);

                User security = new User();
                security.setUsername("Leila_Baroudi");
                security.setPassword(defaultPassword);
                security.setRole("ROLE_USER");
                security.setSkills(Set.of("SECURITY"));
                security.setCurrentWorkload(0);

                User frontend = new User();
                frontend.setUsername("Mehdi_Tazi");
                frontend.setPassword(defaultPassword);
                frontend.setRole("ROLE_USER");
                frontend.setSkills(Set.of("FRONTEND"));
                frontend.setCurrentWorkload(1);

                userRepository.saveAll(Set.of(admin, backend, dba, devops, security, frontend));
                System.out.println("✅ [DataSeeder] Tous les utilisateurs ont été créés automatiquement avec le mot de passe 'password123' !");
            }

            if (workflowRepository.count() == 0) {
                Workflow wf = new Workflow();
                wf.setName("Incident Workflow");
                wf.setStatus("ACTIVE");
                workflowRepository.save(wf);
            }
        };
    }
}