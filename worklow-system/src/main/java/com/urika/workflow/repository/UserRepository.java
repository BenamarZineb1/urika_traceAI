package com.urika.workflow.repository;

import com.urika.workflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Sélectionne les ingénieurs possédant la compétence requise (sans distinction de casse)
     * et les trie par charge de travail ascendante (le moins occupé en premier).
     */
    @Query("""
        SELECT u FROM User u 
        JOIN u.skills s 
        WHERE LOWER(s) = LOWER(:skill) 
        ORDER BY u.currentWorkload ASC
    """)
    List<User> findBestUsers(@Param("skill") String skill);
}