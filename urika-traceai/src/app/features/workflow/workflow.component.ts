import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowService, Task } from '../../core/services/workflow.service';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit {
  protected workflowService = inject(WorkflowService);

  readonly todoTasks = computed(() =>
    this.workflowService.tasks().filter((t: Task) => t.status === 'UNASSIGNED'),
  );
  readonly inProgressTasks = computed(() =>
    this.workflowService.tasks().filter((t: Task) => t.status === 'IN_PROGRESS'),
  );
  readonly doneTasks = computed(() =>
    this.workflowService.tasks().filter((t: Task) => t.status === 'COMPLETED'),
  );

  ngOnInit(): void {
    this.workflowService.loadTasks();
  }

  refresh(): void {
    this.workflowService.loadTasks();
  }

  start(task: Task): void {
    if (task.id) {
      this.workflowService.updateTaskStatus(task.id, 'IN_PROGRESS');
    }
  }

  finish(task: Task): void {
    if (task.id) {
      this.workflowService.updateTaskStatus(task.id, 'COMPLETED');
    }
  }

  trackById = (_: number, t: Task) => t.id;
}
