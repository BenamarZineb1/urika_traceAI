import {
  Component,
  OnInit,
  inject,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { WorkflowService } from '../../core/services/workflow.service';

import {
  Task,
  TaskStatus
} from '../../core/models/task.model';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit {

  protected readonly workflowService =
    inject(WorkflowService);

  readonly todoTasks = computed(() =>
    this.workflowService.tasks().filter(
      (task: Task) =>
        task.status === 'UNASSIGNED'
    )
  );

  readonly inProgressTasks = computed(() =>
    this.workflowService.tasks().filter(
      (task: Task) =>
        task.status === 'IN_PROGRESS'
    )
  );

  readonly doneTasks = computed(() =>
    this.workflowService.tasks().filter(
      (task: Task) =>
        task.status === 'COMPLETED'
    )
  );

  ngOnInit(): void {
    this.workflowService.loadTasks();
  }

  refreshTasks(): void {
    this.workflowService.loadTasks();
  }

  updateStatus(
    taskId: number | undefined,
    newStatus: TaskStatus
  ): void {

    if (taskId === undefined) {
      return;
    }

    this.workflowService.updateTaskStatus(
      taskId,
      newStatus
    );
  }
}