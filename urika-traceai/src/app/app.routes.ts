import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

/**
 * 🔒 Authentification Globale Guard
 * Bloque l'accès si aucun token n'est trouvé.
 */
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true; 
  }

  router.navigate(['/login']); 
  return false;
};

/**
 * 👑 Admin RBAC Guard
 * Accès réservé à l'Admin ou à l'utilisateur 'reda' (insensible à la casse).
 */
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser()?.toLowerCase().trim();

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Autorise si le profil correspond à un administrateur
  if (user === 'admin' || user === 'reda') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * 🛠️ Developer RBAC Guard
 * Empêche les profils Administrateurs ('admin' et 'reda') d'accéder aux vues Kanban privées.
 */
const devGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser()?.toLowerCase().trim();

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Si ce n'est pas un admin, l'accès au Kanban de dev est accordé
  if (user !== 'admin' && user !== 'reda') {
    return true;
  }

  router.navigate(['/explorer']);
  return false;
};

export const routes: Routes = [
  // 1. Landing Page publique
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },

  // 2. Page de Login
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component')
        .then(m => m.LoginComponent)
  },

  // 3. Espace personnel ingénieur dev (Masqué pour l'Admin & Reda)
  {
    path: 'my-tasks',
    loadComponent: () =>
      import('./features/dev/dev.component')
        .then(m => m.DevComponent),
    canActivate: [devGuard]
  },

  // 4. Dashboard global (Accessible à tout le monde)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // 5. Trace Explorer (Strictement réservé à l'Admin & Reda)
  {
    path: 'explorer',
    loadComponent: () =>
      import('./features/trace-explorer/trace-explorer.component')
        .then(m => m.TraceExplorerComponent),
    canActivate: [adminGuard]
  },

  // 6. Gestion des Workflows (Accessible à tous)
  {
    path: 'workflow',
    loadComponent: () =>
      import('./features/workflow/workflow.component')
        .then(m => m.WorkflowComponent),
    canActivate: [authGuard]
  },

  // Redirection automatique des URL invalides ou anciennes (comme /insights)
  {
    path: '**',
    redirectTo: ''
  }
];