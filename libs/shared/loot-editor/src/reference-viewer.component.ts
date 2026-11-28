import { ChangeDetectorRef, Component, inject, input, OnChanges } from '@angular/core';
import { DTCFG } from '@keira/shared/config';

import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { IconComponent } from '@keira/shared/base-editor-components';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SubscriptionHandler } from '@keira/shared/utils';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ReferenceViewerService } from './reference-viewer.service';

@Component({
  selector: 'keira-reference-viewer',
  templateUrl: './reference-viewer.component.html',
  styleUrls: ['./loot-editor.component.scss'],
  imports: [TooltipDirective, NgxDatatableModule, IconComponent, AsyncPipe, TranslatePipe],
})
export class ReferenceViewerComponent extends SubscriptionHandler implements OnChanges {
  readonly referenceId = input.required<number>();

  private readonly service = inject(ReferenceViewerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
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

  /** Opens this reference in the Reference Loot editor, through its select page that loads the given id. */
  protected openReference(): void {
    // skipLocationChange keeps the select page out of the history, otherwise going back would open the editor again.
    void this.router.navigate(['other-loots/select-reference'], { queryParams: { id: this.referenceId() }, skipLocationChange: true });
  }

  protected isReference(row: ReferenceLootTemplate): boolean {
    return row.Reference !== 0;
  }
}
