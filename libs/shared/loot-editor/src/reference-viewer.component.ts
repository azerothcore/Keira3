import { ChangeDetectionStrategy, Component, inject, Input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { AsyncPipe } from '@angular/common';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { IconComponent } from '@keira/shared/base-editor-components';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SubscriptionHandler } from '@keira/shared/utils';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ReferenceViewerService } from './reference-viewer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-viewer',
  templateUrl: './reference-viewer.component.html',
  styleUrls: ['./loot-editor.component.scss'],
  standalone: true,
  imports: [TooltipModule, NgxDatatableModule, IconComponent, AsyncPipe],
})
export class ReferenceViewerComponent extends SubscriptionHandler implements OnChanges {
  @Input({ required: true }) referenceId!: number;

  readonly service = inject(ReferenceViewerService);
  readonly queryService = inject(MysqlQueryService);

  readonly DTCFG = DTCFG;
  referenceLootRows: ReferenceLootTemplate[] | undefined;
  nestedReferenceIds: number[] = [];

  ngOnChanges(): void {
    this.referenceLootRows = undefined;
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
