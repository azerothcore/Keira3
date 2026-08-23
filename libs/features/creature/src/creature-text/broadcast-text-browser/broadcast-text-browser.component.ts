import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { DTCFG } from '@keira/shared/config';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { BroadcastTextRow } from './broadcast-text-browser.model';
import { BroadcastTextBrowserService } from './broadcast-text-browser.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-broadcast-text-browser',
  templateUrl: './broadcast-text-browser.component.html',
  imports: [ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslatePipe, TooltipDirective],
})
export class BroadcastTextBrowserComponent {
  /** Whether the editor has a row to copy into: without one there is nowhere for the copy to land. */
  readonly targetRowSelected = input(false);
  readonly copyToRow = output<BroadcastTextRow>();

  protected readonly DTCFG = DTCFG;
  protected readonly browserService = inject(BroadcastTextBrowserService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected onSearch(): void {
    this.browserService.onSearch(this.changeDetectorRef);
  }

  protected onCopy(): void {
    this.copyToRow.emit(this.browserService.selectedRow as BroadcastTextRow);
  }
}
