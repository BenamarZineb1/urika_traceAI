import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { TraceService } from '../../core/services/trace.service';
import { UiService } from '../../core/services/ui.service';

import { AiPanelComponent } from '../ai-panel/ai-panel.component';

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

  protected readonly traceService =
    inject(TraceService);

  protected readonly uiService =
    inject(UiService);

  ngOnInit(): void {
    this.traceService.loadTraces();
  }

  analyze(traceId: string): void {

    const trace =
      this.traceService
        .traces()
        .find(
          t => t.trace_id === traceId
        );

    if (!trace) {
      return;
    }

    this.uiService.openAnalysis(trace);
  }
}