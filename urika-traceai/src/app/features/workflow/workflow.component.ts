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

  protected readonly workflowService = inject(WorkflowService);

  /**
   * Tâches en attente
   */
  readonly todoTasks = computed(() =>
    this.workflowService.tasks().filter(
      (t: Task) => t.status === 'PENDING'
    )
  );

  /**
   * Tâches en cours
   */
  readonly inProgressTasks = computed(() =>
    this.workflowService.tasks().filter(
      (t: Task) => t.status === 'IN_PROGRESS'
    )
  );

  /**
   * Tâches terminées
   */
  readonly doneTasks = computed(() =>
    this.workflowService.tasks().filter(
      (t: Task) => t.status === 'COMPLETED'
    )
  );

  ngOnInit(): void {
    this.workflowService.loadTasks();

    // Debug
    setTimeout(() => {
      console.log('TASKS CHARGÉES :', this.workflowService.tasks());
    }, 1000);
  }

  refresh(): void {
    this.workflowService.loadTasks();
  }

  start(task: Task): void {
    if (!task.id) {
      return;
    }

    this.workflowService.updateTaskStatus(
      task.id,
      'IN_PROGRESS'
    );
  }

  finish(task: Task): void {
    if (!task.id) {
      return;
    }

    this.workflowService.updateTaskStatus(
      task.id,
      'COMPLETED'
    );
  }
}