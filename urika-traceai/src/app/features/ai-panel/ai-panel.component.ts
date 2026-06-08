import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Trace, TraceAnalysis } from '../../core/models/trace.model';
import { TraceService } from '../../core/services/trace.service';
import { WorkflowService } from '../../core/services/workflow.service';

@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-panel.component.html',
  styleUrls: ['./ai-panel.component.scss']
})
export class AiPanelComponent implements OnDestroy {

  private _trace!: Trace;

  // Interception absolue de l'objet envoyé par le Parent
  @Input({ required: true })
  set trace(value: Trace) {
    if (value) {
      this._trace = value;
      console.log('[AI PANEL SETTER] Nouvelle trace reçue :', value.trace_id);
      this.initiateAnalysis();
    }
  }

  get trace(): Trace {
    return this._trace;
  }

  @Output() close = new EventEmitter<void>();

  private readonly traceService = inject(TraceService);
  private readonly workflowService = inject(WorkflowService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Variables de gestion d'état de l'interface
  public analysis: TraceAnalysis | null = null;
  public loading = false;
  public error: string | null = null;

  // Configuration du Loader Premium Évolutif
  public countdown = 5;
  public currentStepMessage = "Initialisation du modèle Llama 3...";
  private loaderInterval: any = null;

  private loadingSteps = [
    "Connexion à l'instance locale Ollama...",
    "Extraction de la stack-trace et du contexte...",
    "Analyse syntaxique des patterns d'erreur...",
    "Génération des recommandations de résolution...",
    "Finalisation du rapport d'incident..."
  ];

  get displayTraceId(): string {
    return this.trace?.trace_id || (this.trace as any)?.traceId || '';
  }

  ngOnDestroy(): void {
    this.clearLoaderTimer();
  }

  private initiateAnalysis(): void {
    const traceId = this.displayTraceId;
    if (!traceId) {
      this.error = 'Aucun identifiant de trace trouvé.';
      this.loading = false;
      this.analysis = null;
      return;
    }
    this.loadAnalysis(traceId);
  }

  private loadAnalysis(traceId: string): void {
    this.loading = true;
    this.error = null;
    this.analysis = null;
    this.cdr.detectChanges(); // Notification immédiate au DOM pour ré-afficher le loader
    
    this.startPremiumLoader();

    console.log('[AI PANEL] Envoi de la requête API pour ID :', traceId);

    this.traceService.analyzeTrace(traceId).subscribe({
      next: (analysis: TraceAnalysis) => {
        this.clearLoaderTimer();
        this.analysis = analysis;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.clearLoaderTimer();
        console.error('[AI PANEL] Erreur reçue :', error);
        this.error = error?.error?.detail || error?.message || 'Erreur lors de l’analyse IA';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private startPremiumLoader(): void {
    this.clearLoaderTimer();
    this.countdown = 5;
    this.currentStepMessage = this.loadingSteps[0];
    this.cdr.detectChanges();

    this.loaderInterval = setInterval(() => {
      this.countdown--;
      
      const stepIndex = 5 - this.countdown;
      if (stepIndex < this.loadingSteps.length) {
        this.currentStepMessage = this.loadingSteps[stepIndex];
      } else {
        this.currentStepMessage = "Calcul final en cours...";
      }

      if (this.countdown <= 0) {
        this.countdown = 1; // Stabilisation visuelle si Ollama prend plus de temps
      }

      this.cdr.detectChanges();
    }, 1000);
  }

  private clearLoaderTimer(): void {
    if (this.loaderInterval) {
      clearInterval(this.loaderInterval);
      this.loaderInterval = null;
    }
  }

  public createTaskFromError(trace: Trace, analysis: TraceAnalysis): void {
    const taskDto = this.workflowService.mapToTaskDTO(trace, analysis);
    this.workflowService.createTask(taskDto).subscribe({
      next: () => {
        alert('Tâche créée avec succès.');
        this.close.emit();
      },
      error: (error) => {
        console.error('[AI PANEL] Erreur création tâche :', error);
        alert('Impossible de créer la tâche.');
      }
    });
  }
}