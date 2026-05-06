package com.urika.workflow.repository;

import com.urika.workflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Compte le nombre de tâches selon leur statut
    long countByStatus(String status);

    // Récupère la liste des tâches selon leur statut
    List<Task> findByStatus(String status);

}