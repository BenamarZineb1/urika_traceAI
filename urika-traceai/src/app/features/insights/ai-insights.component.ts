import { Component, ViewChild, ElementRef, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-insights.component.html',
  styleUrls: ['./ai-insights.component.scss']
})
export class AiInsightsComponent implements OnInit {
  
  isDrawerOpen = false;
  activeInsight: any = null;
  chatLoading = false;
  userMessageText = '';
  chatMessages: Array<{ text: string, isUser: boolean, time: string }> = [];

  insights = signal<any[]>([]);
  selectedCategory = signal<string>('ALL');

  ngOnInit() {
    // On peuple le composant avec des anomalies basées sur de VRAIES traces de ton projet
    this.insights.set([
      {
        id: 'INS-001',
        category: 'SECURITY',
        timestamp: 'Il y a 2 min',
        confidenceScore: 98,
        title: 'Anomalie critique sur flux de traces HTTP',
        targetService: 'api-gateway-v2',
        // Référence directe à ton module d'exploration de traces
        linkedTraceId: 'trace_id_8f3a9e21b7c04e', 
        summary: 'La corrélation des traces montre une rupture de politique sur le Span "ValidateToken". 450 requêtes consécutives ont tenté d\'injecter des headers altérés.',
        requiredSkill: 'Sécurité Réseau & Configuration WAF',
        assignedTo: 'Non assigné (En attente)'
      },
      {
        id: 'INS-002',
        category: 'PERFORMANCE',
        timestamp: 'Il y a 12 min',
        confidenceScore: 91,
        title: 'Latence anormale détectée (Cascade Failure)',
        targetService: 'payment-processor',
        // Référence directe à ton module d'exploration de traces
        linkedTraceId: 'trace_id_4c11d98a23ef10', 
        summary: 'Le Span "DatabaseQuery" affiche un temps d\'exécution de 4200ms (soit +350% de la baseline). Risque d\'engorger les requêtes asynchrones en aval.',
        requiredSkill: 'Optimisation SQL & Indexation Base de Données',
        assignedTo: 'Non assigné (En attente)'
      }
    ]);
  }

  filteredInsights = computed(() => {
    const category = this.selectedCategory();
    if (category === 'ALL') return this.insights();
    return this.insights().filter(insight => insight.category === category);
  });

  avgConfidence = computed(() => {
    const allInsights = this.insights();
    if (allInsights.length === 0) return 0;
    const sum = allInsights.reduce((acc, curr) => acc + curr.confidenceScore, 0);
    return Math.round(sum / allInsights.length);
  });

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  setFilter(category: string) {
    this.selectedCategory.set(category);
  }

  openCopilot(insight: any) {
    this.activeInsight = insight;
    this.isDrawerOpen = true;
    this.chatLoading = true;
    this.chatMessages = [];

    // L'IA utilise l'ID de trace existant dans ton app pour faire son diagnostic
    setTimeout(() => {
      this.chatLoading = false;
      this.chatMessages.push({
        text: `[URIKA COGNITIVE LAYER] Analyse de la trace "${insight.linkedTraceId}" terminée. Le diagnostic confirme le besoin du skill "${insight.requiredSkill}". J'ai analysé la matrice des compétences de l'équipe disponible.`,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.scrollToBottom();
    }, 1000);
  }

  closeCopilot() {
    this.isDrawerOpen = false;
    this.activeInsight = null;
  }

  sendMessage() {
    if (!this.userMessageText.trim()) return;

    this.chatMessages.push({
      text: this.userMessageText,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.userMessageText = '';
    this.chatLoading = true;
    this.scrollToBottom();

    // Simulation de l'agent qui cherche l'expert adapté dans ta base de données
    setTimeout(() => {
      this.chatLoading = false;
      const expert = this.activeInsight.category === 'SECURITY' ? 'Yassine (Expert Cyber)' : 'Karim (Dev Backend)';
      this.chatMessages.push({
        text: `D'après notre registre RH, ${expert} maîtrise parfaitement le skill "${this.activeInsight.requiredSkill}" et son taux de charge actuel permet l'attribution.`,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.scrollToBottom();
    }, 1000);
  }

  // Action finale : basculer vers ton module de ticketing
  executeTrigger(actionType: string) {
    this.chatLoading = true;

    setTimeout(() => {
      this.chatLoading = false;
      const finalAssignee = this.activeInsight.category === 'SECURITY' ? 'Yassine (Expert Cyber)' : 'Karim (Dev Backend)';
      
      // On met à jour la carte en direct
      this.insights.update(items => items.map(item => {
        if (item.id === this.activeInsight.id) {
          return { ...item, assignedTo: finalAssignee };
        }
        return item;
      }));

      this.chatMessages.push({
        text: `✅ [WORKFLOW] Tâche créée et rattachée à la trace. Le ticket a été poussé dans le tableau de bord de ${finalAssignee}.`,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.scrollToBottom();
    }, 800);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}