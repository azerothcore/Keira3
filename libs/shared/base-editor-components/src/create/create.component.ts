import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SubscriptionHandler } from '@keira/shared/utils';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { QueryError } from 'mysql2';
import { map, Observable } from 'rxjs';

const MAX_INT_UNSIGNED_VALUE = 4294967295;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-create',
  templateUrl: './create.component.html',
  imports: [TranslateDirective, TranslatePipe, FormsModule],
})
export class CreateComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  @Input({ required: true }) entityTable!: string;
  @Input({ required: true }) entityIdField!: string;
  @Input({ required: true }) customStartingId!: number;
  @Input({ required: true }) handlerService!: HandlerService<T>;
  @Input({ required: true }) queryService!: MysqlQueryService;
  @Input() maxEntryValue = MAX_INT_UNSIGNED_VALUE;
  @Input() nextIdFrom: 'max' | 'min' = 'max';

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
    const currentId$: Observable<number | null> =
      this.nextIdFrom === 'min'
        ? this.queryService.getMinId(this.entityTable, this.entityIdField).pipe(map((rows) => rows[0].min))
        : this.queryService.getMaxId(this.entityTable, this.entityIdField).pipe(map((rows) => rows[0].max));

    this.subscriptions.push(
      currentId$.subscribe({
        next: (currentId) => {
          this.idModel = this.calculateNextId(currentId);
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

  private calculateNextId(currentId: number | null): number {
    if (this.nextIdFrom === 'min') {
      return currentId === null ? this.customStartingId : currentId - 1;
    }
    return currentId === null || currentId < this.customStartingId ? this.customStartingId : currentId + 1;
  }
}
