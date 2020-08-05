import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { OPTION_ICON } from '@keira-shared/constants/options/gossip-option-icon';

@Injectable()
export class GossipPreviewService {
  private readonly OPTION_ICON = OPTION_ICON;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    private readonly sqliteQueryService: SqliteQueryService,
    private readonly mysqlQueryService: MysqlQueryService,
  ) { }

  /**
   * query functions
   */

  private getItemsetSlotBak(itemset: number | string): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM items WHERE itemset = ${itemset} ORDER BY slotBak, id`).toPromise();
  }

}
