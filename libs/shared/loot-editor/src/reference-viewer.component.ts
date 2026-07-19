import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnChanges } from '@angular/core';
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
  imports: [TooltipModule, NgxDatatableModule, IconComponent, AsyncPipe],
})
export class ReferenceViewerComponent extends SubscriptionHandler implements OnChanges {
  readonly referenceId = input.required<number>();

  private readonly service = inject(ReferenceViewerService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly queryService = inject(MysqlQueryService);

  protected readonly DTCFG = DTCFG;
  protected referenceLootRows: ReferenceLootTemplate[] | undefined;
  protected nestedReferenceIds: number[] = [];

  ngOnChanges(): void {
    this.referenceLootRows = undefined;
    this.nestedReferenceIds = [];

    this.subscriptions.push(
      this.service.getReferenceById(this.referenceId())?.subscribe((result: ReferenceLootTemplate[]) => {
        this.referenceLootRows = result.map((row) => {
          let Chance = row.Chance;

          if (row.GroupId !== 0) {
            const groupCount = result.filter((r) => r.GroupId === row.GroupId).length;
            Chance = (row.Chance === 0 ? 100 / groupCount : row.Chance / groupCount).toFixed(2) as unknown as number;
          }

          return {
            ...row,
            Chance,
          };
        });

        this.nestedReferenceIds = this.referenceLootRows
          .filter((referenceLootRow) => referenceLootRow.Reference > 0)
          .map((referenceLootRow) => referenceLootRow.Reference);

        this.cdr.markForCheck();
      }),
    );
  }

  protected isReference(row: ReferenceLootTemplate): boolean {
    return row.Reference !== 0;
  }
}
