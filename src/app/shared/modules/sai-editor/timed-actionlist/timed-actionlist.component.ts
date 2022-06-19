import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira-config/datatable.config';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SmartScripts } from '@keira-types/smart-scripts.type';
import { Observable } from 'rxjs';

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
