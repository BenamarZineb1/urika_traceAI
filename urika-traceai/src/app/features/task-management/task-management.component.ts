import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowService, Task } from '../../core/services/workflow.service';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit {
  protected workflowService = inject(WorkflowService);

  todoTasks = computed(() =>
    this.workflowService.tasks().filter((t: Task) => t.status === 'UNASSIGNED')
  );

  inProgressTasks = computed(() =>
    this.workflowService.tasks().filter((t: Task) => t.status === 'IN_PROGRESS')
  );

  doneTasks = computed(() =>
    this.workflowService.tasks().filter((t: Task) => t.status === 'COMPLETED')
  );

  ngOnInit(): void {
    this.refreshTasks();
  }

  refreshTasks(): void {
    this.workflowService.loadTasks();
  }

  updateStatus(taskId: number | undefined, newStatus: 'UNASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'): void {
    if (taskId) {
      this.workflowService.updateTaskStatus(taskId, newStatus);
    }
  }
}
