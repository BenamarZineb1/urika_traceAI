package com.urika.workflow.repository;

import com.urika.workflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional; // <-- Ne pas oublier cet import

public interface UserRepository extends JpaRepository<User, Long> {

    // 1. La méthode requise par CustomUserDetailsService pour l'authentification
    Optional<User> findByUsername(String username);

    // 2. Ta méthode existante pour trouver le meilleur ingénieur
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