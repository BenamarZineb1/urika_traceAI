import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TaskCreationDTO } from '../models/task-creation.dto';

export interface Task {
  id?: number;
  traceId: string;
  requiredSkill: string;
  priority: number;
  status: 'UNASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/tasks`;

  public tasks = signal<Task[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  /**
   * Charger toutes les tâches
   */
  public loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Task[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur chargement Kanban');
        this.loading.set(false);
      }
    });
  }

  /**
   * CRÉATION TASK (CORRIGÉE POUR SPRING BOOT)
   */
  public createTask(task: TaskCreationDTO) {
    this.loading.set(true);

    return this.http.post<Task>(this.apiUrl, task);
  }

  /**
   * UPDATE STATUS (compatible Spring Boot endpoint /status)
   */
  public updateTaskStatus(taskId: number, status: 'UNASSIGNED' | 'IN_PROGRESS' | 'COMPLETED') {
    this.http.put<Task>(`${this.apiUrl}/${taskId}/status`, { status })
      .subscribe({
        next: () => {
          this.tasks.update(tasks =>
            tasks.map(t =>
              t.id === taskId ? { ...t, status } : t
            )
          );
        },
        error: (err) => console.error('Erreur update status:', err)
      });
  }

  /**
   * MAPPING TRACE + AI → SPRING DTO
   */
  public mapToTaskDTO(trace: any, analysis: any): TaskCreationDTO {
    return {
      title: `${trace.service} - ${trace.endpoint}`,
      description: `${analysis.diagnostic}\n${analysis.recommandation}`,
      requiredSkill: analysis.suggested_role,
      priority: trace.status === 'error'
        ? 5
        : trace.status === 'slow'
          ? 4
          : 2,
      traceId: trace.trace_id,
      force: false
    };
  }
}
