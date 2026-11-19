import { ChangeDetectionStrategy, Component, inject, OnChanges, input } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SaiHandlerService } from '../sai-handler.service';

/** The timed actionlists a creature's SmartAI calls; a click on one opens it in the SmartAI editor. */
@Component({
  selector: 'keira-timed-actionlist',
  templateUrl: './timed-actionlist.component.html',
  styleUrls: ['./timed-actionlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxDatatableModule, AsyncPipe],
})
export class TimedActionlistComponent implements OnChanges {
  readonly creatureId = input.required<string | number>();

  private readonly queryService = inject(MysqlQueryService);
  private readonly handlerService = inject(SaiHandlerService);

  readonly DTCFG = DTCFG;

  private _timedActionLists$!: Observable<SmartScripts[]>;
  get timedActionlists$(): Observable<SmartScripts[]> {
    return this._timedActionLists$;
  }

  ngOnChanges() {
    this._timedActionLists$ = this.queryService.getTimedActionlists(this.creatureId());
  }

  /** Opens the timed actionlist of the row clicked. */
  onSelect({ selected }: { selected: SmartScripts[] }): void {
    const { entryorguid } = selected[0];
    this.handlerService.select(
      false,
      { entryorguid, source_type: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST },
      `Timed Actionlist ID ${entryorguid}`,
    );
  }
}
