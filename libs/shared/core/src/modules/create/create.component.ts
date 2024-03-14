import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { QueryError } from 'mysql2';
import { HandlerService } from '../../abstract/service/handlers/handler.service';
import { MysqlQueryService } from '@keira/shared/core';
import { TableRow } from '@keira/shared/constants';
import { SubscriptionHandler } from '@keira/shared/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: true,
  imports: [TranslateModule, FormsModule, NgClass],
})
export class CreateComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  @Input() entityTable: string;
  @Input() entityIdField: string;
  @Input() customStartingId: number;
  @Input() handlerService: HandlerService<T>;
  @Input() queryService: MysqlQueryService;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public idModel: number;
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

  private calculateNextId(currentMax) {
    return currentMax < this.customStartingId ? this.customStartingId : currentMax + 1;
  }
}
