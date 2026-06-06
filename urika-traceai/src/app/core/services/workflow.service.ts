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
          this.tasks.set(data);
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
          // Évite une requête HTTP GET superflue et règle les problèmes de latence BDD
          this.tasks.update((currentTasks) => [...currentTasks, newTask]);
        })
      );
  }

  /**
   * Mise à jour du statut avec modification locale du Signal
   */
  public updateTaskStatus(
    taskId: number,
    status: TaskStatus
  ): void {
    this.http
      .put<Task>(
        `${this.apiUrl}/${taskId}/status`,
        { status }
      )
      .subscribe({
        next: (updatedTask: Task) => {
          // ✅ OPTIMISATION : Mise à jour chirurgicale de la tâche dans le Signal
          this.tasks.update((currentTasks) =>
            currentTasks.map((t) =>
              t.id === taskId ? { ...t, ...updatedTask, status } : t
            )
          );
        },
        error: (err) => {
          console.error('Erreur update status', err);
          this.error.set('Erreur lors de la mise à jour du statut');
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