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

  // Utilisation de protected pour permettre l'accès direct depuis le template HTML
  protected readonly workflowService = inject(WorkflowService);

  /**
   * Filtrage réactif des tâches par colonne via computed()
   */
  readonly todoTasks = computed(() =>
    this.workflowService.tasks().filter(
      (t: Task) => t.status === 'UNASSIGNED'
    )
  );

  readonly inProgressTasks = computed(() =>
    this.workflowService.tasks().filter(
      (t: Task) => t.status === 'IN_PROGRESS'
    )
  );

  readonly doneTasks = computed(() =>
    this.workflowService.tasks().filter(
      (t: Task) => t.status === 'COMPLETED'
    )
  );

  ngOnInit(): void {
    this.workflowService.loadTasks();
  }

  refresh(): void {
    this.workflowService.loadTasks();
  }

  start(task: Task): void {
    if (!task.id) return;
    this.workflowService.updateTaskStatus(task.id, 'IN_PROGRESS');
  }

  finish(task: Task): void {
    if (!task.id) return;
    this.workflowService.updateTaskStatus(task.id, 'COMPLETED');
  }
}