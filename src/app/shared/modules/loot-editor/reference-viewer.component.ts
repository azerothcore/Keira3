import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira-config/datatable.config';
import { ReferenceViewerService } from '@keira-shared/modules/loot-editor/reference-viewer.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-viewer',
  templateUrl: './reference-viewer.component.html',
  styleUrls: ['./loot-editor.component.scss'],
})
export class ReferenceViewerComponent extends SubscriptionHandler implements OnChanges {
  @Input() referenceId: number;

  readonly DTCFG = DTCFG;
  referenceLootRows: ReferenceLootTemplate[];
  nestedReferenceIds: number[] = [];

  constructor(public service: ReferenceViewerService, public queryService: MysqlQueryService) {
    super();
  }

  ngOnChanges(): void {
    this.referenceLootRows = null;
    this.nestedReferenceIds = [];

    this.subscriptions.push(
      this.service.getReferenceById(this.referenceId)?.subscribe((result: ReferenceLootTemplate[]) => {
        this.referenceLootRows = result;

        this.nestedReferenceIds = this.referenceLootRows
          .filter((referenceLootRow) => referenceLootRow.Reference > 0)
          .map((referenceLootRow) => referenceLootRow.Reference);
      }),
    );
  }

  isReference(row: ReferenceLootTemplate): boolean {
    return row.Reference !== 0;
  }
}
