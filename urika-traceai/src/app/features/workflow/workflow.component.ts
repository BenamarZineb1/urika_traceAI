import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowService } from '../../core/services/workflow.service';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  public readonly workflowService = inject(WorkflowService);

  /**
   * Tâches en attente (Filtrées dynamiquement via Signal)
   */
  readonly todoTasks = computed(() => {
    const allTasks = this.workflowService.tasks() || [];
    return allTasks.filter((t: Task) => t.status === 'PENDING');
  });

  /**
   * Tâches en cours de traitement (Filtrées dynamiquement via Signal)
   */
  readonly inProgressTasks = computed(() => {
    const allTasks = this.workflowService.tasks() || [];
    return allTasks.filter((t: Task) => t.status === 'IN_PROGRESS');
  });

  /**
   * Tâches résolues et clôturées (Filtrées dynamiquement via Signal)
   */
  readonly doneTasks = computed(() => {
    const allTasks = this.workflowService.tasks() || [];
    return allTasks.filter((t: Task) => t.status === 'COMPLETED');
  });

  ngOnInit(): void {
    this.workflowService.loadTasks();
  }

  /**
   * Force le rafraîchissement des données depuis le backend
   */
  refresh(): void {
    this.workflowService.loadTasks();
  }

  /**
   * ✅ AJOUT : Passe une tâche à l'état IN_PROGRESS
   * Déclenche la transition locale instantanée pour l'IHM
   */
  start(task: Task): void {
    if (!task.id) return;
    this.workflowService.updateTaskStatus(task.id, 'IN_PROGRESS');
  }

  /**
   * Passe une tâche à l'état COMPLETED
   * Déclenche l'appel HTTP officiel sur la route unique de ton Spring Boot
   */
  finish(task: Task): void {
    if (!task.id) return;
    this.workflowService.updateTaskStatus(task.id, 'COMPLETED');
  }
}