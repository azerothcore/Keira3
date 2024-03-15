import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { SmartScripts } from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Component({
  selector: 'keira-timed-actionlist',
  templateUrl: './timed-actionlist.component.html',
  styleUrls: ['./timed-actionlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgxDatatableModule, AsyncPipe],
})
export class TimedActionlistComponent implements OnChanges {
  readonly DTCFG = DTCFG;
  @Input() creatureId: string | number;

  private _timedActionLists$: Observable<SmartScripts[]>;
  get timedActionlists$(): Observable<SmartScripts[]> {
    return this._timedActionLists$;
  }

  constructor(private queryService: MysqlQueryService) {}

  ngOnChanges() {
    this._timedActionLists$ = this.queryService.getTimedActionlists(this.creatureId);
  }
}
