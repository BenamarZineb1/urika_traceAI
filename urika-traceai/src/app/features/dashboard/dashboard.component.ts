import { Component, OnInit, inject, computed, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceService } from '../../core/services/trace.service';
import { Chart, registerables } from 'chart.js';

// Enregistrement des composants de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  protected traceService = inject(TraceService);

  // Référence vers le canvas HTML
  @ViewChild('latencyChart') latencyChart!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  // Tes stats existantes (toujours parfaites avec les Signals)
  totalTraces = computed(() => this.traceService.traces().length);
  errorCount = computed(() => this.traceService.traces().filter(t => t.status === 'error').length);
  avgLatency = computed(() => {
    const traces = this.traceService.traces();
    if (traces.length === 0) return 0;
    const sum = traces.reduce((acc, t) => acc + t.duration_ms, 0);
    return Math.round(sum / traces.length);
  });

  constructor() {
    // Met à jour le graphique automatiquement si les données changent
    effect(() => {
      const traces = this.traceService.traces();
      if (this.chart && traces.length > 0) {
        this.updateChart(traces);
      }
    });
  }

  ngOnInit() {
    this.traceService.loadTraces();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  private initChart() {
    const traces = this.traceService.traces();

    this.chart = new Chart(this.latencyChart.nativeElement, {
      type: 'line',
      data: {
        labels: traces.map((_, i) => `T-${i + 1}`),
        datasets: [{
          label: 'Latence (ms)',
          data: traces.map(t => t.duration_ms),
          borderColor: '#38bdf8', // Le bleu Urika
          backgroundColor: 'rgba(56, 189, 248, 0.06)', // Remplissage légèrement plus discret
          fill: true,
          tension: 0.1, // CORRIGÉ : Donne un aspect de vagues brisées/pics au lieu de courbes lisses
          borderWidth: 2,
          pointRadius: 0, // CORRIGÉ : Cache les points par défaut pour épurer la ligne
          pointHoverRadius: 5, // Affiche le point uniquement au survol
          pointBackgroundColor: '#38bdf8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  private updateChart(traces: any[]) {
    if (!this.chart) return;
    this.chart.data.labels = traces.map((_, i) => `T-${i + 1}`);
    this.chart.data.datasets[0].data = traces.map(t => t.duration_ms);
    this.chart.update();
  }
}
