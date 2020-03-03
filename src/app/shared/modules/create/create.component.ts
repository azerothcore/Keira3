import { Component, Input, OnInit } from '@angular/core';
import { MysqlError } from 'mysql';

import { TableRow } from '../../types/general';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { HandlerService } from '../../abstract/service/handlers/handler.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  @Input() entityTable: string;
  @Input() entityIdField: string;
  @Input() customStartingId: number;
  @Input() handlerService: HandlerService<T>;
  @Input() queryService: MysqlQueryService;

  public idModel: number;
  private _loading = false;
  isIdFree = false;

  get loading(): boolean { return this._loading; }

  ngOnInit() {
    if (this.queryService) {
      this.getNextId();
    }
  }

  checkId() {
    this._loading = true;
    this.subscriptions.push(
      this.queryService.selectAll<T>(this.entityTable, this.entityIdField, this.idModel).subscribe((data) => {
        this.isIdFree = data.length <= 0;
      }, (error: MysqlError) => {
        console.error(error);
      }).add(() => {
        this._loading = false;
      })
    );
  }

  private getNextId(): void {
    this._loading = true;
    this.subscriptions.push(
      this.queryService.getMaxId(this.entityTable, this.entityIdField).subscribe((data) => {
        const currentMax = data[0].max;
        this.idModel = this.calculateNextId(currentMax);
        this.isIdFree = true;
      }, (error: MysqlError) => {
        console.error(error);
      }).add(() => {
        this._loading = false;
      })
    );
  }

  private calculateNextId(currentMax) {
    return currentMax < this.customStartingId ? this.customStartingId : currentMax + 1;
  }
}
