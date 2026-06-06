import {
  Injectable,
  signal
} from '@angular/core';

import {
  Trace,
  TraceAnalysis
} from '../models/trace.model';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public selectedTrace =
    signal<Trace | null>(null);

  public selectedAnalysis =
    signal<TraceAnalysis | null>(null);

  public openAnalysis(
    trace: Trace
  ): void {

    this.selectedTrace.set(trace);
  }

  public setAnalysis(
    analysis: TraceAnalysis
  ): void {

    this.selectedAnalysis.set(
      analysis
    );
  }

  public closeAnalysis(): void {

    this.selectedTrace.set(null);

    this.selectedAnalysis.set(null);
  }

  public clearAnalysis(): void {

    this.selectedAnalysis.set(null);
  }
}