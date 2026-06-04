package com.urika.workflow.repository;

import com.urika.workflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    long countByStatus(String status);

    List<Task> findByStatus(String status);

    Optional<Task> findByTraceId(String traceId);
}