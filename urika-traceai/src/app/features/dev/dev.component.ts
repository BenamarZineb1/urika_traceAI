import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkflowService } from '../../core/services/workflow.service';
import { ChatService } from '../../core/services/chat.service';
import { Task, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-dev',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {
  public authService = inject(AuthService);
  public workflowService = inject(WorkflowService);
  public chatService = inject(ChatService); 
  private router = inject(Router);

  engineerTasks = computed(() => {
    const loggedUsername = this.authService.getCurrentUser();
    if (!loggedUsername) return [];
    return this.workflowService.tasks().filter(t => t.assignee?.username === loggedUsername);
  });

  selectedTaskForNotes = signal<Task | null>(null);
  currentNoteText = '';

  // Propriétés en lecture seule pour optimiser la détection de changements d'Angular
  readonly isChatOpen = this.chatService.isChatOpen;
  readonly newMessage = this.chatService.newMessageText;
  readonly chatMessages = this.chatService.messages;

  ngOnInit(): void {
    this.workflowService.loadTasks();
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  updateStatus(taskId: number, newStatus: TaskStatus) {
    console.log(`[DevComponent] Action de transition détectée pour le ticket #${taskId} -> ${newStatus}`);
    this.workflowService.updateTaskStatus(taskId, newStatus);
  }

  openNotesModal(task: Task) {
    this.selectedTaskForNotes.set(task);
    this.currentNoteText = task.description || '';
  }

  saveNotes() {
    const task = this.selectedTaskForNotes();
    if (task) {
      this.workflowService.updateTaskDescription(task.id, this.currentNoteText);
      this.selectedTaskForNotes.set(null);
    }
  }

  toggleChat() {
    this.chatService.toggleChat();
  }

  sendChatMessage() {
    this.chatService.sendMessage();
  }
}