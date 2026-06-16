import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http'; // Ajout crucial

interface Feature {
  title: string;
  desc: string;
  iconSvg: SafeHtml;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient); // Injection du client HTTP

  public readonly isDemoModalOpen = signal<boolean>(false);
  
  // Nouveaux états pour gérer l'UI pendant et après l'envoi
  public isSubmitting = false;
  public isSuccess = false;

  public demoForm = {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: ''
  };

  public features: Feature[] = [];

  ngOnInit() {
    // Ton code existant pour les features...
    this.features = [
      {
        title: 'Intelligence Artificielle',
        desc: 'Développement d\'assistants sur mesure, automatisation intelligente des processus métiers et intégration de modèles prédictifs.',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" width="24" height="24" stroke="#f26622" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3" fill="#f26622"/></svg>`)
      },
      {
        title: 'Solutions Web & SEO',
        desc: 'Création de sites internet vitrines, plateformes e-commerce sur mesure et optimisation SEO avancée pour maximiser votre conversion.',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" width="24" height="24" stroke="#f26622" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`)
      },
      {
        title: 'Cloud & Cybersécurité',
        desc: 'Sécurisation robuste de vos infrastructures et serveurs informatiques en collaboration avec notre partenaire Fortinet.',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" width="24" height="24" stroke="#f26622" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`)
      },
      {
        title: 'Outsourcing & Infogérance',
        desc: 'Externalisation informatique agile (BPO), gestion de centres d\'appels multilingues et support technique disponible 24h/24 et 7j/7.',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" width="24" height="24" stroke="#f26622" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`)
      }
    ];
  }

  public navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  public openDemoModal(): void {
    this.isDemoModalOpen.set(true);
    this.isSuccess = false; // Réinitialise l'état au cas où
  }

  public closeDemoModal(): void {
    this.isDemoModalOpen.set(false);
    setTimeout(() => {
      this.resetForm();
      this.isSuccess = false;
    }, 300); // Laisse le temps à l'animation de fermeture de se faire
  }

  public isFormValid(): boolean {
    return !!(
      this.demoForm.firstName.trim() &&
      this.demoForm.lastName.trim() &&
      this.demoForm.email.trim() &&
      this.demoForm.company.trim() &&
      this.demoForm.phone.trim()
    );
  }

  public submitDemoRequest(): void {
    if (this.isFormValid() && !this.isSubmitting) {
      this.isSubmitting = true; // Déclenche le loader sur le bouton

      // Remplace par l'URL de ton backend FastAPI
      const backendUrl = 'http://localhost:8000/api/contact'; 

      this.http.post(backendUrl, this.demoForm).subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          // Simule un petit délai pour que le jury ait le temps de voir l'état "chargement"
          setTimeout(() => {
            this.isSubmitting = false;
            this.isSuccess = true; // Affiche l'écran de confirmation
          }, 800);
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi:', error);
          this.isSubmitting = false;
          alert('Une erreur est survenue lors de la connexion au serveur.');
        }
      });
    }
  }

  private resetForm(): void {
    this.demoForm = {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      phone: ''
    };
  }
}