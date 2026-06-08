package com.urika.workflow.security;

import com.urika.workflow.model.User;
import com.urika.workflow.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList; // Utilisé pour les rôles/droits (vide par défaut ici)

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Remplace "findByUsername" par la méthode exacte de ton UserRepository
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + username));

        // Spring Security s'attend à un objet org.springframework.security.core.userdetails.User
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(), // Le mot de passe haché en base
                new ArrayList<>() // Ici tu pourrais injecter les rôles (ex: ROLE_ADMIN)
        );
    }
}