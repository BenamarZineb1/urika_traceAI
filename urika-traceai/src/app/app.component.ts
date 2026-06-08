import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { UiService } from './core/services/ui.service';
import { AuthService } from './core/services/auth.service';
import { AiPanelComponent } from './features/ai-panel/ai-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AiPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public uiService = inject(UiService);
  public authService = inject(AuthService);
  private router = inject(Router);

  isMobileMenuOpen = false;

  // ==================================================
  // TraceAI Platform Metrics
  // ==================================================
  totalTraces = 15421;
  totalIncidents = 27;
  criticalIncidents = 3;
  aiModel = 'Llama 3';
  aiStatus = 'Online';
  aiConfidence = 91;

  /**
   * 👑 Rôle Guard - Source de vérité pour l'affichage HTML
   * Permet d'identifier si l'utilisateur connecté ('admin' ou 'reda') est Admin.
   */
  public isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser()?.toLowerCase().trim();
    return currentUser === 'admin' || currentUser === 'reda';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // ==================================================
  // AI Assistant & Logout
  // ==================================================
  openAssistant(): void {
    if (this.uiService.selectedTrace()) {
      return;
    }
    console.log('TraceAI Assistant');
  }

  logout(): void {
    // Étape A : Suppression du token et de la session utilisateur localement
    this.authService.logout();
    
    // Étape B : Redirection immédiate vers la mire de connexion sécurisée
    this.router.navigate(['/login']);
  }
}