import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { SubscriptionHandler } from '@keira/shared/utils';
import { ReferenceViewerService } from './reference-viewer.service';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { IconComponent } from '@keira/shared/base-editor-components';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-viewer',
  templateUrl: './reference-viewer.component.html',
  styleUrls: ['./loot-editor.component.scss'],
  standalone: true,
  imports: [TooltipModule, NgxDatatableModule, IconComponent, NgClass, AsyncPipe],
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
