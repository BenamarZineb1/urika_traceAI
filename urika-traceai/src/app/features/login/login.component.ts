import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variables liées à ton formulaire
  username = 'yassine.admin'; // Valeur initiale par défaut
  password = 'password123';
  
  // Signal réactif pour la gestion visuelle des rôles
  selectedRole = signal<'ADMIN' | 'DEV'>('ADMIN');

  // Met à jour dynamiquement les champs selon l'avatar cliqué
  selectRole(role: 'ADMIN' | 'DEV') {
    this.selectedRole.set(role);
    this.username = role === 'ADMIN' ? 'yassine.admin' : 'Zineb_Benamar'; // Aligné sur tes données Spring Boot
    this.password = 'password123';
  }

  onLogin() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        // Redirection intelligente en fonction du rôle ciblé
        if (this.selectedRole() === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/my-tasks']);
        }
      },
      error: (err) => {
        console.error('Erreur d\'authentification Spring Security', err);
        alert('Identifiants ou rôle invalides pour cette session.');
      }
    });
  }
}