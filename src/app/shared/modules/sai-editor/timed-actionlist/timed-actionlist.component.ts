import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';

@Component({
  selector: 'keira-timed-actionlist',
  templateUrl: './timed-actionlist.component.html',
  styleUrls: ['./timed-actionlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimedActionlistComponent implements OnChanges {
  @Input() creatureId: string|number;

  constructor(
    private queryService: MysqlQueryService,
  ) { }

  /* istanbul ignore next */ // TODO: write test once this component is complete
  ngOnChanges(): void {
    if (!!this.creatureId) {
      this.queryService.getTimedActionlists(this.creatureId).subscribe((result) => {
        console.log(result);
      });
    }
  }

}
