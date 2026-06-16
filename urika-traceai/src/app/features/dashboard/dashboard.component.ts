import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Chart, registerables } from 'chart.js';
import { TraceService } from '../../core/services/trace.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  protected readonly traceService = inject(TraceService);

  @ViewChild('latencyChart')
  latencyChart!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  /**
   * KPI - Total des traces réelles
   */
  readonly totalTraces = computed(() => this.traceService.traces().length);

  /**
   * KPI - Nombre d'incidents
   */
  readonly errorCount = computed(() =>
    this.traceService.traces().filter(t => t.status === 'slow').length
  );

  /**
   * Évalue s'il y a des données valides pour générer un graphique de latence
   */
  readonly hasChartData = computed(() => {
    const traces = this.traceService.traces();
    if (!traces || traces.length === 0) return false;
    
    // Vérifie si au moins une trace possède une latence strictement supérieure à 0
    return traces.some(t => {
      const val = t.duration_ms !== undefined && t.duration_ms !== null ? Number(t.duration_ms) : 0;
      return val > 0 && Number.isFinite(val);
    });
  });

  /**
   * KPI - Calcul de la latence moyenne avec tolérance aux types (string, null, undefined)
   */
  readonly avgLatency = computed(() => {
    const traces = this.traceService.traces();
    if (!traces || traces.length === 0) return 0;

    const durations = traces
      .map(t => (t.duration_ms !== undefined && t.duration_ms !== null ? Number(t.duration_ms) : 0))
      .filter(value => value > 0 && Number.isFinite(value));

    if (!durations.length) return 0;

    const total = durations.reduce((sum, value) => sum + value, 0);
    return Math.round(total / durations.length);
  });

  /**
   * État de santé des microservices construit sur les valeurs réelles
   */
  readonly servicesHealth = computed(() => {
    const traces = this.traceService.traces();
    if (!traces || traces.length === 0) return [];

    const servicesMap = new Map<string, { name: string, status: string, latency: number }>();

    traces.forEach(trace => {
      if (!trace.service) return;

      const currentLatency = trace.duration_ms !== undefined && trace.duration_ms !== null ? Number(trace.duration_ms) : 0;
      
      let calculatedStatus = 'healthy';
      if (trace.status === 'slow') {
        calculatedStatus = currentLatency > 500 ? 'critical' : 'warning';
      }

      if (!servicesMap.has(trace.service)) {
        servicesMap.set(trace.service, {
          name: trace.service,
          status: calculatedStatus,
          latency: currentLatency
        });
      }
    });

    return Array.from(servicesMap.values());
  });

  constructor() {
    // Redessine ou met à jour le graphique si les données changent dynamiquement
    effect(() => {
      const traces = this.traceService.traces();
      const hasData = this.hasChartData();

      if (hasData) {
        // Laisse le temps au template d'injecter le canvas si l'état change
        setTimeout(() => {
          if (this.latencyChart && !this.chart) {
            this.initializeChart();
          } else if (this.chart) {
            this.updateChart(traces);
          }
        }, 0);
      } else if (this.chart) {
        this.chart.destroy();
        this.chart = undefined;
      }
    });
  }

  ngOnInit(): void {
    this.traceService.loadTraces();
  }

  ngAfterViewInit(): void {
    if (this.hasChartData()) {
      this.initializeChart();
    }
  }

  private initializeChart(): void {
    if (!this.latencyChart) return;

    const traces = this.traceService.traces();

    this.chart = new Chart(this.latencyChart.nativeElement, {
      type: 'line',
      data: {
        labels: traces.map((t, index) => t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : `Trace ${index + 1}`),
        datasets: [
          {
            label: 'Latence (ms)',
            data: traces.map(t => (t.duration_ms !== undefined && t.duration_ms !== null ? Number(t.duration_ms) : 0)),
            borderColor: '#f26622',
            backgroundColor: 'rgba(242, 102, 34, 0.08)',
            fill: true,
            tension: 0.2,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f26622'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  private updateChart(traces: any[]): void {
    if (!this.chart) return;
    this.chart.data.labels = traces.map((t, index) => t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : `Trace ${index + 1}`);
    this.chart.data.datasets[0].data = traces.map(t => (t.duration_ms !== undefined && t.duration_ms !== null ? Number(t.duration_ms) : 0));
    this.chart.update();
  }
}