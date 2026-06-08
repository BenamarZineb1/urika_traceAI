import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceService } from '../../core/services/trace.service';
import { UiService } from '../../core/services/ui.service';
import { AiPanelComponent } from '../ai-panel/ai-panel.component';
import { Trace } from '../../core/models/trace.model'; // Assure-toi d'importer ton modèle

@Component({
  selector: 'app-trace-explorer',
  standalone: true,
  imports: [
    CommonModule,
    AiPanelComponent
  ],
  templateUrl: './trace-explorer.component.html',
  styleUrls: ['./trace-explorer.component.scss']
})
export class TraceExplorerComponent implements OnInit {

  protected readonly traceService = inject(TraceService);
  protected readonly uiService = inject(UiService);

  /**
   * =====================================================
   * KPI OBSERVABILITY (Signaux calculés)
   * =====================================================
   */
  readonly totalTraces = computed(() =>
    this.traceService.traces().length
  );

  readonly errorCount = computed(() =>
    this.traceService.traces().filter(trace => trace.status === 'error').length
  );

  readonly slowCount = computed(() =>
    this.traceService.traces().filter(trace => trace.status === 'slow').length
  );

  readonly healthyCount = computed(() =>
    this.traceService.traces().filter(trace => trace.status === 'ok').length
  );

  /**
   * =====================================================
   * LIFECYCLE & MÉTHODES
   * =====================================================
   */
  ngOnInit(): void {
    this.traceService.loadTraces();
  }

  refresh(): void {
    this.traceService.loadTraces();
  }

  /**
   * Reçoit désormais l'objet Trace complet directement du template HTML
   */
  analyze(trace: Trace): void {
    if (!trace) {
      console.warn('[EXPLORER] Tentative d\'analyse sur une trace indéfinie.');
      return;
    }

    console.log('[EXPLORER] Envoi de la trace vers l\'UiService :', trace.trace_id);

    // ✅ On crée une copie superficielle ({...trace}) pour casser la référence mémoire.
    // Cela garantit que la détection de changement d'Angular réveille la modale IA.
    this.uiService.openAnalysis({ ...trace });
  }
}