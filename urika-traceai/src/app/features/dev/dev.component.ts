import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkflowService } from '../../core/services/workflow.service';
import { ChatService } from '../../core/services/chat.service'; // Ajuste le chemin selon ton arborescence
import { Task, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-dev',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {
  // --- INJECTIONS DES SERVICES ---
  // On passe en public ou protected accessible par le template HTML
  public authService = inject(AuthService);
  public workflowService = inject(WorkflowService);
  public chatService = inject(ChatService); 
  private router = inject(Router);

  // --- FILTRAGE DES TÂCHES DE L'INGÉNIEUR CONNECTÉ ---
  engineerTasks = computed(() => {
    const loggedUsername = this.authService.getCurrentUser();
    if (!loggedUsername) return [];
    
    // Filtre les tâches récupérées depuis le signal du WorkflowService
    return this.workflowService.tasks().filter(t => t.assignee?.username === loggedUsername);
  });

  selectedTaskForNotes = signal<Task | null>(null);
  currentNoteText = '';

  // --- GETTERS POUR GARANTIR LA RÉACTIVITÉ DES SIGNALS DANS LE TEMPLATE ---
  // Utiliser des getters évite les pertes de référence mémoire lors des cycles de détection d'Angular
  get isChatOpen() {
    return this.chatService.isChatOpen;
  }

  get newMessage() {
    return this.chatService.newMessageText;
  }

  get chatMessages() {
    return this.chatService.messages;
  }

  ngOnInit(): void {
    // Charge les tâches au démarrage depuis le serveur via l'API REST
    this.workflowService.loadTasks();
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * ⚡ PRISE EN CHARGE : Communique directement avec le backend via le service.
   * Le signal global partagé mettra automatiquement à jour l'interface (Dev et Admin)
   */
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
      this.workflowService.tasks.update((currentTasks) =>
        currentTasks.map((t) =>
          t.id === task.id ? { ...t, description: this.currentNoteText } : t
        )
      );
      this.selectedTaskForNotes.set(null);
    }
  }

  // --- ACTIONS DE L'AI ASSISTANT DÉLÉGUÉES AU CHATSERVICE ---
  toggleChat() {
    this.chatService.toggleChat();
  }

  sendChatMessage() {
    // Le service s'occupe de lire le signal `newMessageText`, 
    // de valider la chaîne et de lancer la requête vers Ollama / API Cloud.
    this.chatService.sendMessage();
  }
}