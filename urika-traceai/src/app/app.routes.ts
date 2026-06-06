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
      import('./features/workflow/workflow.component')
        .then(m => m.WorkflowComponent)
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