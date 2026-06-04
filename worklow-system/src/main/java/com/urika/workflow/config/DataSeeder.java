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

            if (userRepository.count() == 0) {

                User backend = new User();
                backend.setUsername("Zineb_Benamar");
                backend.setSkills(Set.of("BACKEND"));
                backend.setCurrentWorkload(2);

                User dba = new User();
                dba.setUsername("Youssef_ElAlami");
                dba.setSkills(Set.of("DBA"));
                dba.setCurrentWorkload(0);

                User devops = new User();
                devops.setUsername("Kawtar_Naciri");
                devops.setSkills(Set.of("DEVOPS"));
                devops.setCurrentWorkload(1);

                User security = new User();
                security.setUsername("Leila_Baroudi");
                security.setSkills(Set.of("SECURITY"));
                security.setCurrentWorkload(0);

                User frontend = new User();
                frontend.setUsername("Mehdi_Tazi");
                frontend.setSkills(Set.of("FRONTEND"));
                frontend.setCurrentWorkload(1);

                userRepository.saveAll(Set.of(backend, dba, devops, security, frontend));
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