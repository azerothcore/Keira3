import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { SmartScripts } from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';

@Component({
  selector: 'keira-timed-actionlist',
  templateUrl: './timed-actionlist.component.html',
  styleUrls: ['./timed-actionlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
