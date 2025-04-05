import { ChangeDetectionStrategy, Component, inject, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { SmartScripts } from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Component({
  selector: 'keira-timed-actionlist',
  templateUrl: './timed-actionlist.component.html',
  styleUrls: ['./timed-actionlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxDatatableModule, AsyncPipe],
})
export class TimedActionlistComponent implements OnChanges {
  @Input({ required: true }) creatureId!: string | number;

  private readonly queryService = inject(MysqlQueryService);

  readonly DTCFG = DTCFG;

  private _timedActionLists$!: Observable<SmartScripts[]>;
  get timedActionlists$(): Observable<SmartScripts[]> {
    return this._timedActionLists$;
  }

  ngOnChanges() {
    this._timedActionLists$ = this.queryService.getTimedActionlists(this.creatureId);
  }
}
