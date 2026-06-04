import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { UiService } from './core/services/ui.service';
import { TraceService } from './core/services/trace.service';
import { AiPanelComponent } from './features/ai-panel/ai-panel.component';
import { Trace } from './core/models/trace.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AiPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public uiService = inject(UiService);
  protected traceService = inject(TraceService);

  // État de la navigation mobile
  public isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  analyzeFromNav(traceId: string): void {
    const trace = this.traceService.traces().find((t: Trace) => t.trace_id === traceId);
    if (trace) {
      this.uiService.openAnalysis(trace);
    }
  }
}
