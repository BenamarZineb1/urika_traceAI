import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowService } from '../../core/services/workflow.service';
import { Task, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit {

  protected readonly workflowService = inject(WorkflowService);

  /**
   * ✅ Filtrage strict : affiche uniquement les tâches en attente
   */
  readonly todoTasks = computed(() => {
    const allTasks = this.workflowService.tasks() || [];
    return allTasks.filter((task: Task) => task.status === 'PENDING');
  });

  /**
   * ✅ Affiche uniquement les tâches en cours
   */
  readonly inProgressTasks = computed(() => {
    const allTasks = this.workflowService.tasks() || [];
    return allTasks.filter((task: Task) => task.status === 'IN_PROGRESS');
  });

  /**
   * ✅ Affiche uniquement les tâches complétées
   */
  readonly doneTasks = computed(() => {
    const allTasks = this.workflowService.tasks() || [];
    return allTasks.filter((task: Task) => task.status === 'COMPLETED');
  });

  ngOnInit(): void {
    this.workflowService.loadTasks();
  }

  refreshTasks(): void {
    this.workflowService.loadTasks();
  }

  updateStatus(taskId: number | undefined, newStatus: TaskStatus): void {
    if (taskId === undefined) {
      return;
    }
    this.workflowService.updateTaskStatus(taskId, newStatus);
  }
}