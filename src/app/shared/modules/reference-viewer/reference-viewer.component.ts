import { Component, Input, OnChanges } from '@angular/core';

import { ReferenceViewerService } from '@keira-shared/modules/reference-viewer/reference-viewer.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { DTCFG } from '@keira-config/datatable.config';

@Component({
  selector: 'keira-reference-viewer',
  templateUrl: './reference-viewer.component.html',
  styleUrls: ['./reference-viewer.component.scss'],
})
export class ReferenceViewerComponent extends SubscriptionHandler implements OnChanges {

  @Input() referenceId: number;

  readonly DTCFG = DTCFG;
  referenceLootRows: ReferenceLootTemplate[];
  nestedReferenceIds: number[] = [];

  constructor(
    public service: ReferenceViewerService,
    public queryService: MysqlQueryService,
  ) {
    super();
  }

  ngOnChanges(): void {
    console.log('***************************** qui');
    this.referenceLootRows = null;
    this.nestedReferenceIds = [];

    this.subscriptions.push(this.service.getReferenceById(this.referenceId).subscribe((result: ReferenceLootTemplate[]) => {
        this.referenceLootRows = result;

        for (const referenceLootRow of this.referenceLootRows) {
          if (referenceLootRow.Reference > 0) {
            this.nestedReferenceIds.push(referenceLootRow.Reference);
          }
        }
      }),
    );
  }
}
