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

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/tasks`;

  public tasks =
    signal<Task[]>([]);

  public loading =
    signal(false);

  public error =
    signal<string | null>(null);

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
  public createTask(
    task: TaskCreationDTO
  ): Observable<Task> {
    return this.http
      .post<Task>(this.apiUrl, task)
      .pipe(
        tap((newTask: Task) => {
          // ✅ OPTIMISATION : Ajout local et immédiat dans le Signal
          this.tasks.update((currentTasks) => [...currentTasks, newTask]);
        })
      );
  }

  /**
   * Mise à jour du statut adaptée aux contraintes métiers du Backend
   * 🛠️ CORRECTION : Appelle /api/tasks/{id}/complete uniquement pour le statut COMPLETED
   */
  public updateTaskStatus(
    taskId: number,
    status: TaskStatus
  ): void {
    this.error.set(null);

    // 1. Si l'action n'est pas "COMPLETED", le backend n'a pas de route associée.
    // On effectue une transition purement locale pour l'IHM (ex: déplacement dans IN_PROGRESS).
    if (status !== 'COMPLETED') {
      console.log(`[WorkflowService] Transition locale vers ${status} (Pas de route serveur requise)`);
      this.tasks.update((currentTasks) =>
        currentTasks.map((t) =>
          t.id === taskId ? { ...t, status } : t
        )
      );
      return;
    }

    // 2. Si le statut visé est COMPLETED, on déclenche l'appel sur la seule route valide du backend.
    // Note : On passe un objet vide {} car la méthode Java @PutMapping("/{id}/complete") n'attend pas de Body.
    this.http
      .put<Task>(
        `${this.apiUrl}/${taskId}/complete`,
        {}
      )
      .subscribe({
        next: (updatedTaskFromServer: Task) => {
          console.log(`[WorkflowService] Succès ! Tâche #${taskId} marquée comme complétée côté serveur.`);
          
          // ✅ OPTIMISATION : Remplacement chirurgical des données avec le retour officiel du serveur
          this.tasks.update((currentTasks) =>
            currentTasks.map((t) =>
              t.id === taskId ? { ...t, ...updatedTaskFromServer } : t
            )
          );
        },
        error: (err) => {
          console.error(`Erreur lors du traitement HTTP PUT sur /api/tasks/${taskId}/complete`, err);
          this.error.set('Impossible de clore cette tâche sur le serveur');
          
          // Sécurité anti-désynchronisation : On réaligne l'UI sur la base de données
          this.loadTasks();
        }
      });
  }

  /**
   * Conversion Trace + Analyse IA vers DTO Spring Boot
   */
  public mapToTaskDTO(
    trace: Trace,
    analysis: TraceAnalysis
  ): TaskCreationDTO {
    return {
      title:
        `${trace.service} - ${trace.endpoint}`,

      description:
        `${analysis.diagnostic}\n\n${analysis.recommandation}`,

      requiredSkill:
        analysis.suggested_role as SkillType,

      priority:
        trace.status === 'error'
          ? 5
          : trace.status === 'slow'
            ? 4
            : 2,

      // ✅ SÉCURITÉ : Récupère l'ID qu'il soit écrit en snake_case ou camelCase à l'exécution
      traceId:
        trace.trace_id || (trace as any).traceId || '',

      force: false
    };
  }
}