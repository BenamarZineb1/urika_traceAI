import {
  Injectable,
  inject,
  signal
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  Task,
  TaskStatus,
  SkillType
} from '../models/task.model';

import {
  TaskCreationDTO
} from '../models/task-creation.dto';

import {
  Trace,
  TraceAnalysis
} from '../models/trace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  public tasks = signal<Task[]>([]);
  public loading = signal(false);
  public error = signal<string | null>(null);

  /**
   * Chargement initial du Kanban
   */
  public loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<Task[]>(this.apiUrl)
      .subscribe({
        next: (data) => {
          this.tasks.set(data || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement tâches', err);
          this.error.set('Erreur lors du chargement des tâches');
          this.loading.set(false);
        }
      });
  }

  /**
   * Création d'une tâche avec mise à jour réactive et locale du Signal
   */
  public createTask(task: TaskCreationDTO): Observable<Task> {
    return this.http
      .post<Task>(this.apiUrl, task)
      .pipe(
        tap((newTask: Task) => {
          this.tasks.update((currentTasks) => [...currentTasks, newTask]);
        })
      );
  }

  /**
   * 🛠️ CORRECTION : Synchronisation de TOUS les statuts avec le backend
   */
  public updateTaskStatus(taskId: number, status: TaskStatus): void {
    this.error.set(null);

    // 1. Mise à jour optimiste et immédiate pour fluidifier l'interface locale
    this.tasks.update((currentTasks) =>
      currentTasks.map((t) => t.id === taskId ? { ...t, status } : t)
    );

    // 2. Détermination de l'appel API en fonction du statut
    let apiCall: Observable<Task>;
    
    if (status === 'COMPLETED') {
      apiCall = this.http.put<Task>(`${this.apiUrl}/${taskId}/complete`, {});
    } else {
      // ✅ APPEL RÉSEAU AJOUTÉ : Nécessite une route PUT /api/tasks/{id}/status côté Backend
      apiCall = this.http.put<Task>(`${this.apiUrl}/${taskId}/status`, { status });
    }

    // 3. Exécution de la requête
    apiCall.subscribe({
      next: (updatedTaskFromServer: Task) => {
        console.log(`[WorkflowService] Succès ! Tâche #${taskId} -> ${status} synchronisée avec le serveur.`);
        
        // Remplacement par les données officielles du serveur
        this.tasks.update((currentTasks) =>
          currentTasks.map((t) =>
            t.id === taskId ? { ...t, ...updatedTaskFromServer } : t
          )
        );
      },
      error: (err) => {
        console.error(`Erreur lors de la synchronisation HTTP pour #${taskId}`, err);
        this.error.set('Impossible de synchroniser le statut sur le serveur');
        
        // Sécurité anti-désynchronisation : On annule le changement local
        this.loadTasks();
      }
    });
  }

  /**
   * 🛠️ AJOUT : Sauvegarde des notes / description
   * Nécessite une route PATCH /api/tasks/{id}/description côté Backend
   */
  public updateTaskDescription(taskId: number, description: string): void {
    // Mise à jour locale optimiste
    this.tasks.update((currentTasks) =>
      currentTasks.map((t) => t.id === taskId ? { ...t, description } : t)
    );

    // Appel serveur
    this.http.patch<Task>(`${this.apiUrl}/${taskId}/description`, { description })
      .subscribe({
        next: () => console.log(`[WorkflowService] Notes de la tâche #${taskId} sauvegardées.`),
        error: (err) => {
          console.error(`Erreur lors de la sauvegarde de la description pour #${taskId}`, err);
          this.loadTasks(); // Annulation en cas d'échec
        }
      });
  }

  /**
   * Conversion Trace + Analyse IA vers DTO Spring Boot
   */
  public mapToTaskDTO(trace: Trace, analysis: TraceAnalysis): TaskCreationDTO {
    return {
      title: `${trace.service} - ${trace.endpoint}`,
      description: `${analysis.diagnostic}\n\n${analysis.recommandation}`,
      requiredSkill: analysis.suggested_role as SkillType,
      priority: trace.status === 'error' ? 5 : trace.status === 'slow' ? 4 : 2,
      traceId: trace.trace_id || (trace as any).traceId || '',
      force: false
    };
  }
}