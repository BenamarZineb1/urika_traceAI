import { Injectable, signal } from '@angular/core';
import { Trace, TraceAnalysis } from '../models/trace.model';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  // Trace sélectionnée dans le dashboard
  selectedTrace = signal<Trace | null>(null);

  // Analyse IA associée (IMPORTANT pour ton panel AI)
  selectedAnalysis = signal<TraceAnalysis | null>(null);

  /**
   * Ouvre le panel d'analyse
   */
  openAnalysis(trace: Trace): void {
    this.selectedTrace.set(trace);
  }

  /**
   * Stocke aussi l'analyse IA
   */
  setAnalysis(analysis: TraceAnalysis): void {
    this.selectedAnalysis.set(analysis);
  }

  /**
   * Ferme le panel complètement
   */
  closeAnalysis(): void {
    this.selectedTrace.set(null);
    this.selectedAnalysis.set(null);
  }

  /**
   * Reset partiel (utile si tu veux garder trace mais reset IA)
   */
  clearAnalysis(): void {
    this.selectedAnalysis.set(null);
  }
}
