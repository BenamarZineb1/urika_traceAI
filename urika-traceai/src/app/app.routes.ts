import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'explorer',
    loadComponent: () =>
      import('./features/trace-explorer/trace-explorer.component')
        .then(m => m.TraceExplorerComponent)
  },
  {
    path: 'workflow',
    loadComponent: () =>
      import('./features/task-management/task-management.component')
        .then(m => m.TaskManagementComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
