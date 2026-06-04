import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trace, TraceAnalysis } from '../../core/models/trace.model';
import { TraceService } from '../../core/services/trace.service';
import { WorkflowService, Task } from '../../core/services/workflow.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-panel.component.html',
  styleUrls: ['./ai-panel.component.scss']
})
export class AiPanelComponent implements OnChanges {

  @Input() trace!: Trace;
  @Output() close = new EventEmitter<void>();

  private traceService = inject(TraceService);
  private workflowService = inject(WorkflowService);
  private http = inject(HttpClient);

  public analysis$!: Observable<TraceAnalysis>;
  public isForcingLoad = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trace'] && this.trace?.trace_id) {
      this.loadAnalysis(false);
    }
  }

  /**
   * Charge l'analyse Ollama avec option de forçage pour bypasser le verrou Spring Boot
   */
  public loadAnalysis(forceBypass: boolean = false): void {
    if (!this.trace?.trace_id) return;

    if (forceBypass) {
      this.isForcingLoad = true;

      // On crée une copie de la trace augmentée d'un flag dynamique de forçage
      // On utilise un cast 'any' temporaire pour contourner la signature stricte à 1 argument de getAIAnalysis
      const tracePayload = { ...this.trace, force: true };
      this.analysis$ = this.traceService.getAIAnalysis(tracePayload as any);

      // Reset du loader d'inférence visuelle une fois la réponse émise
      this.analysis$.subscribe({
        next: () => this.isForcingLoad = false,
        error: () => this.isForcingLoad = false
      });
    } else {
      this.analysis$ = this.traceService.getAIAnalysis(this.trace);
    }
  }

  public createTaskFromError(trace: Trace, analysis: TraceAnalysis): void {
    if (!analysis) return;

    const newTask: Task = {
      traceId: trace.trace_id,
      serviceName: trace.service,
      endpoint: trace.endpoint || 'Endpoint non spécifié',
      durationMs: trace.duration_ms || 0,
      status: 'UNASSIGNED',
      errorDetails: trace.message || 'Contenu de log vide',
      aiDiagnostic: analysis.diagnostic
    };

    this.http.post<Task>(`${environment.apiUrl}/tasks`, newTask).subscribe({
      next: () => {
        this.workflowService.loadTasks();
        this.close.emit();
      },
      error: (err) => {
        console.error("[OLLAMA/API PIPELINE ERROR] Échec de la synchronisation :", err);
      }
    });
  }
}
