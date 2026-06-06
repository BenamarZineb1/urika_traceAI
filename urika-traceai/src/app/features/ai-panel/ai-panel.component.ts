import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Trace,
  TraceAnalysis
} from '../../core/models/trace.model';

import { TraceService } from '../../core/services/trace.service';
import { WorkflowService } from '../../core/services/workflow.service';

@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-panel.component.html',
  styleUrls: ['./ai-panel.component.scss']
})
export class AiPanelComponent implements OnChanges {

  @Input({ required: true })
  trace!: Trace;

  @Output()
  close = new EventEmitter<void>();

  private readonly traceService = inject(TraceService);
  private readonly workflowService = inject(WorkflowService);
  private readonly cdr = inject(ChangeDetectorRef);

  private currentTraceId: string | null = null;

  public analysis: TraceAnalysis | null = null;
  public loading = false;
  public error: string | null = null;

  /**
   * Getter pour gérer proprement l'affichage de l'ID dans le template
   */
  get displayTraceId(): string {
    return this.trace.trace_id || (this.trace as any).traceId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[AI PANEL] Trace reçue :', this.trace);

    const traceId = this.displayTraceId;
    console.log('[AI PANEL] Trace ID :', traceId);

    if (!traceId) {
      this.error = 'Aucun identifiant de trace trouvé.';
      return;
    }

    if (this.currentTraceId === traceId) {
      return;
    }

    this.currentTraceId = traceId;
    this.loadAnalysis(traceId);
  }

  private loadAnalysis(traceId: string): void {
    this.loading = true;
    this.error = null;
    this.analysis = null;

    console.log('[AI PANEL] Analyse demandée :', traceId);

    this.traceService.analyzeTrace(traceId).subscribe({
      next: (analysis: TraceAnalysis) => {
        console.log('[AI PANEL] Analyse reçue :', analysis);

        this.analysis = analysis;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[AI PANEL] Erreur API :', error);

        this.error = error?.error?.detail || error?.message || 'Erreur lors de l’analyse IA';

        this.currentTraceId = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  public createTaskFromError(trace: Trace, analysis: TraceAnalysis): void {
    const taskDto = this.workflowService.mapToTaskDTO(trace, analysis);

    this.workflowService.createTask(taskDto).subscribe({
      next: () => {
        alert('Tâche créée avec succès.');
        // Ferme la modale. Le service s'occupe déjà de rafraîchir le Signal des tâches !
        this.close.emit();
      },
      error: (error) => {
        console.error('[AI PANEL] Erreur création tâche :', error);
        alert('Impossible de créer la tâche.');
      }
    });
  }
}