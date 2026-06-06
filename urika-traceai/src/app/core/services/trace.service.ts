import {
  Injectable,
  inject,
  signal
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  Trace,
  TraceAnalysis
} from '../models/trace.model';

@Injectable({
  providedIn: 'root'
})
export class TraceService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    environment.aiApiUrl;

  public traces =
    signal<Trace[]>([]);

  public loading =
    signal(false);

  public error =
    signal<string | null>(null);

  public loadTraces(): void {

    this.loading.set(true);
    this.error.set(null);

    this.http.get<Trace[]>(
      `${this.apiUrl}/traces`
    )
    .subscribe({

      next: (data) => {

        this.traces.set(data);
        this.loading.set(false);
      },

      error: (err) => {

        console.error(err);

        this.error.set(
          'Impossible de charger les traces'
        );

        this.loading.set(false);
      }
    });
  }

  public getTraces(): Observable<Trace[]> {

    return this.http.get<Trace[]>(
      `${this.apiUrl}/traces`
    );
  }

  public analyzeTrace(
    traceId: string
  ): Observable<TraceAnalysis> {

    return this.http.get<TraceAnalysis>(
      `${this.apiUrl}/analyze/${traceId}`
    );
  }

  public analyzeFromTrace(
    trace: Trace
  ): Observable<TraceAnalysis> {

    return this.analyzeTrace(
      trace.trace_id
    );
  }

  public getAIAnalysis(
    trace: Trace
  ): Observable<TraceAnalysis> {

    return this.analyzeTrace(
      trace.trace_id
    );
  }

  public analyzeAndRefresh(
    trace: Trace
  ): Observable<TraceAnalysis> {

    return this.analyzeTrace(
      trace.trace_id
    ).pipe(

      tap(() => {

        console.log(
          `Analyse terminée : ${trace.trace_id}`
        );
      })
    );
  }
}