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
import { RouterModule } from '@angular/router'; // <-- AJOUT POUR LE BOUTON

import { Chart, registerables } from 'chart.js';
import { TraceService } from '../../core/services/trace.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // <-- AJOUT ICI
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  protected readonly traceService = inject(TraceService);

  @ViewChild('latencyChart')
  latencyChart!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  /**
   * =====================================================
   * KPI
   * =====================================================
   */
  readonly totalTraces = computed(() =>
    this.traceService.traces().length
  );

  readonly errorCount = computed(() =>
    this.traceService
      .traces()
      .filter(t => t.status === 'error')
      .length
  );

  readonly avgLatency = computed(() => {
    const traces = this.traceService.traces();

    if (!traces.length) {
      return 0;
    }

    const durations = traces
      .map(trace => Number(trace.duration_ms) || 0)
      .filter(value => Number.isFinite(value));

    if (!durations.length) {
      return 0;
    }

    const total = durations.reduce((sum, value) => sum + value, 0);

    return Math.round(total / durations.length);
  });

  /**
   * =====================================================
   * HEALTH OVERVIEW
   * =====================================================
   */
  readonly servicesHealth = [
    { name: 'API Gateway', status: 'healthy', latency: 120 },
    { name: 'Auth Service', status: 'healthy', latency: 98 },
    { name: 'User Service', status: 'warning', latency: 321 },
    { name: 'Notification Worker', status: 'critical', latency: 812 }
  ];

  /**
   * =====================================================
   * CONSTRUCTOR
   * =====================================================
   */
  constructor() {
    effect(() => {
      const traces = this.traceService.traces();

      if (this.chart && traces.length > 0) {
        this.updateChart(traces);
      }
    });
  }

  /**
   * =====================================================
   * LIFECYCLE
   * =====================================================
   */
  ngOnInit(): void {
    this.traceService.loadTraces();
  }

  ngAfterViewInit(): void {
    this.initializeChart();
    this.simulateLiveData(); // <-- LANCEMENT DE L'ANIMATION LIVE
  }

  /**
   * =====================================================
   * CHART
   * =====================================================
   */
  private initializeChart(): void {
    const traces = this.traceService.traces();

    this.chart = new Chart(this.latencyChart.nativeElement, {
      type: 'line',
      data: {
        labels: traces.map((_, index) => `T-${index + 1}`),
        datasets: [
          {
            label: 'Latence (ms)',
            data: traces.map(trace => trace.duration_ms ?? 0),
            borderColor: '#f26622',
            backgroundColor: 'rgba(242, 102, 34, 0.08)',
            fill: true,
            tension: 0.25,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointBackgroundColor: '#f26622'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#111827',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  /**
   * =====================================================
   * UPDATE CHART
   * =====================================================
   */
  private updateChart(traces: any[]): void {
    if (!this.chart) {
      return;
    }

    this.chart.data.labels = traces.map((_, index) => `T-${index + 1}`);
    this.chart.data.datasets[0].data = traces.map(trace => trace.duration_ms ?? 0);
    this.chart.update();
  }

  /**
   * =====================================================
   * SIMULATE LIVE DATA (NOUVEAU)
   * =====================================================
   */
  private simulateLiveData(): void {
    if (!this.chart) return;

    setInterval(() => {
      const data = this.chart!.data.datasets[0].data;
      const labels = this.chart!.data.labels as string[];

      // Garde les 20 dernières valeurs pour ne pas saturer le graphique
      if (data.length > 20) {
        data.shift();
        labels.shift();
      }

      // Génère une latence aléatoire entre 80ms et 150ms
      const newLatency = Math.floor(Math.random() * (150 - 80 + 1) + 80);
      
      data.push(newLatency);
      labels.push(`T-Live`);

      // Met à jour le graphique
      this.chart!.update('active');
    }, 2000);
  }
}