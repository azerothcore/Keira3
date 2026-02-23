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
  imports: [TranslateModule, FormsModule],
})
export class CreateComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  @Input({ required: true }) entityTable!: string;
  @Input({ required: true }) entityIdField!: string;
  @Input({ required: true }) customStartingId!: number;
  @Input({ required: true }) handlerService!: HandlerService<T>;
  @Input({ required: true }) queryService!: MysqlQueryService;
  // Controls whether "copy from existing" is allowed for the current entity table.
  // Default is false (disabled). Individual selectors can enable it by passing [allowCopy]="true".
  private _allowCopy = false;
  @Input()
  set allowCopy(value: boolean) {
    this._allowCopy = !!value;
    if (!this._allowCopy) {
      // Reset creation method if copy is disabled
      this.creationMethod = 'blank';
      this.sourceIdModel = undefined;
      this.isSourceIdValid = false;
    }
  }
  get allowCopy(): boolean {
    return this._allowCopy;
  }
  @Input() maxEntryValue = MAX_INT_UNSIGNED_VALUE;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  idModel!: number;
  sourceIdModel?: number;
  creationMethod: 'blank' | 'copy' = 'blank';
  private _loading = false;
  isIdFree = false;
  isSourceIdValid = false;

  get loading(): boolean {
    return this._loading;
  }

  ngOnInit() {
    if (this.queryService) {
      this.getNextId();
    }

    if (!this.allowCopy) {
      this.creationMethod = 'blank';
    }
  }

  protected checkId() {
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
    if (this.sourceIdModel && this.sourceIdModel > MAX_INT_UNSIGNED_VALUE) {
      this.sourceIdModel = MAX_INT_UNSIGNED_VALUE;
    }
  }

  private calculateNextId(currentMax: number): number {
    return currentMax < this.customStartingId ? this.customStartingId : currentMax + 1;
  }

  protected onCreationMethodChange(): void {
    if (this.creationMethod === 'blank') {
      this.sourceIdModel = undefined;
      this.isSourceIdValid = false;
    }
    this.changeDetectorRef.markForCheck();
  }

  protected checkSourceId(): void {
    if (!this.sourceIdModel) {
      this.isSourceIdValid = false;
      this.changeDetectorRef.markForCheck();
      return;
    }

    this._loading = true;
    this.subscriptions.push(
      this.queryService.selectAll<T>(this.entityTable, this.entityIdField, this.sourceIdModel).subscribe({
        next: (data) => {
          // Source ID should exist (opposite of new ID check)
          this.isSourceIdValid = data.length > 0;
          this._loading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          console.error(error);
          this.isSourceIdValid = false;
          this._loading = false;
          this.changeDetectorRef.markForCheck();
        },
      }),
    );
  }

  protected isFormValid(): boolean {
    const isNewIdValid = !!this.idModel && this.isIdFree;

    if (this.creationMethod === 'copy') {
      return isNewIdValid && !!this.sourceIdModel && this.isSourceIdValid;
    }

    return isNewIdValid;
  }

  protected onCreate(): void {
    if (this.creationMethod === 'copy') {
      this.handlerService.select(true, this.idModel, undefined, true, this.sourceIdModel!.toString());
    } else {
      this.handlerService.select(true, this.idModel);
    }
  }
}
