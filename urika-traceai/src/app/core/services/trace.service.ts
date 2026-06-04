import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Trace, TraceAnalysis } from '../models/trace.model';

@Injectable({
  providedIn: 'root'
})
export class TraceService {

  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8000/api';

  // State global des traces
  public traces = signal<Trace[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  /**
   * Charger toutes les traces (state + observable clean)
   */
  public loadTraces(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Trace[]>(`${this.API_URL}/traces`)
      .subscribe({
        next: (data) => {
          this.traces.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur Backend:', err);
          this.error.set('Impossible de charger les traces');
          this.loading.set(false);
        }
      });
  }

  /**
   * Version observable pure (si besoin dans components)
   */
  public getTraces(): Observable<Trace[]> {
    return this.http.get<Trace[]>(`${this.API_URL}/traces`);
  }

  /**
   * Analyse IA d’une trace (Ollama via FastAPI)
   */
  public analyzeTrace(traceId: string): Observable<TraceAnalysis> {
    return this.http.get<TraceAnalysis>(
      `${this.API_URL}/analyze/${traceId}`
    );
  }

  /**
   * Version simple basée sur objet Trace
   */
  public analyzeFromTrace(trace: Trace): Observable<TraceAnalysis> {
    return this.analyzeTrace(trace.trace_id);
  }

  /**
   * Version avancée (future usage: refresh cache UI après analyse)
   */
  public analyzeAndRefresh(trace: Trace): Observable<TraceAnalysis> {
    return this.http.get<TraceAnalysis>(
      `${this.API_URL}/analyze/${trace.trace_id}`
    ).pipe(
      tap(() => {
        console.log(`Analyse IA terminée pour ${trace.trace_id}`);
      })
    );
  }
}
