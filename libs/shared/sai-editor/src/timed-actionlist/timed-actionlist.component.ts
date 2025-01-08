import { ChangeDetectionStrategy, Component, inject, Input, OnChanges } from '@angular/core';

import { AsyncPipe } from '@angular/common';
import { SmartScripts } from '@keira/shared/acore-world-model';
import { SelectComplexKeyComponent } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SaiSearchService } from '@keira/shared/selectors';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { Observable } from 'rxjs';
import { SaiHandlerService } from '../sai-handler.service';

@Component({
  selector: 'keira-timed-actionlist',
  templateUrl: './timed-actionlist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgxDatatableModule, AsyncPipe],
})
export class TimedActionlistComponent extends SelectComplexKeyComponent<SmartScripts> implements OnChanges {
  @Input({ required: true }) creatureId!: string | number;

  private readonly queryService = inject(MysqlQueryService);
  protected override readonly handlerService = inject(SaiHandlerService);
  readonly selectService = inject(SaiSearchService);

  private _timedActionLists$!: Observable<SmartScripts[]>;
  get timedActionlists$(): Observable<SmartScripts[]> {
    return this._timedActionLists$;
  }

  ngOnChanges(): void {
    this._timedActionLists$ = this.queryService.getTimedActionlists(this.creatureId);
  }

  override onSelect(event: { selected: SmartScripts[] }): void {
    console.log('### event 2', event);
    this.handlerService.select(false, event.selected[0], `Timed Actionlist ID ${event.selected[0].entryorguid}`);
  }
}
