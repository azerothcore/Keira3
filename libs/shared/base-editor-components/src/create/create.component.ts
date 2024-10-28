import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SubscriptionHandler } from '@keira/shared/utils';
import { TranslateModule } from '@ngx-translate/core';
import { QueryError } from 'mysql2';

const MAX_INT_UNSIGNED_VALUE = 4294967295;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-create',
  templateUrl: './create.component.html',
  standalone: true,
  imports: [TranslateModule, FormsModule],
})
export class CreateComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  @Input({ required: true }) entityTable!: string;
  @Input({ required: true }) entityIdField!: string;
  @Input({ required: true }) customStartingId!: number;
  @Input({ required: true }) handlerService!: HandlerService<T>;
  @Input({ required: true }) queryService!: MysqlQueryService;
  @Input() maxEntryValue = MAX_INT_UNSIGNED_VALUE;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public idModel!: number;
  private _loading = false;
  isIdFree = false;

  get loading(): boolean {
    return this._loading;
  }

  ngOnInit() {
    if (this.queryService) {
      this.getNextId();
    }
  }

  checkId() {
    this._loading = true;
    this.subscriptions.push(
      this.queryService.selectAll<T>(this.entityTable, this.entityIdField, this.idModel).subscribe({
        next: (data) => {
          this.isIdFree = data.length <= 0;
          this._loading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          console.error(error);
          this._loading = false;
        },
      }),
    );
  }

  private getNextId(): void {
    this._loading = true;
    this.subscriptions.push(
      this.queryService.getMaxId(this.entityTable, this.entityIdField).subscribe({
        next: (data) => {
          const currentMax = data[0].max;
          this.idModel = this.calculateNextId(currentMax);
          this.isIdFree = true;
          this._loading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          console.error(error);
          this._loading = false;
        },
      }),
    );
  }

  protected checkMaxValue(): void {
    if (this.idModel > MAX_INT_UNSIGNED_VALUE) {
      this.idModel = MAX_INT_UNSIGNED_VALUE;
    }
  }

  private calculateNextId(currentMax: number): number {
    return currentMax < this.customStartingId ? this.customStartingId : currentMax + 1;
  }
}
