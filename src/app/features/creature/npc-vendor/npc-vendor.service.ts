import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { IconService } from '@keira-shared/modules/icon/icon.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemExtendedCost } from '@keira-shared/types/item-extended-cost.type';
import { NpcVendor, NPC_VENDOR_ID, NPC_VENDOR_ID_2, NPC_VENDOR_TABLE } from '@keira-types/npc-vendor.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class NpcVendorService extends MultiRowEditorService<NpcVendor> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
    readonly sqliteQueryService: SqliteQueryService,
    protected toastrService: ToastrService,
    private iconService: IconService,
  ) {
    super(NpcVendor, NPC_VENDOR_TABLE, NPC_VENDOR_ID, NPC_VENDOR_ID_2, handlerService, queryService, toastrService);
  }

  private cache: Promise<string>[] = [];

  private extendedCostCache(extendedCost: number): Promise<string> {
    if (!this.cache[extendedCost]) {
      this.cache[extendedCost] = this.getItemExtendedCostReadable(extendedCost);
    }
    return this.cache[extendedCost];
  }

  private async getItemExtendedCostReadable(extendedCost: number): Promise<string> {
    const extendedCostData: ItemExtendedCost[] = await this.sqliteQueryService.getItemExtendedCost([extendedCost]);
    const extCost = extendedCostData[0];

    let resultText = '<div class="item-extended-cost">';

    if (extCost) {
      if (extCost.reqHonorPoints > 0) {
        resultText += `<span class="mx-2">${extCost.reqHonorPoints}</span>
          <span class="mx-1 alliance side"></span>
          <span class="mx-1 horde side"></span>`;
      }

      if (extCost.reqArenaPoints > 0) {
        resultText += `<span class="mx-2">${extCost.reqArenaPoints}</span>
        <span class="mx-1 arena side"></span>`;
      }

      for (const index of [1, 2, 3, 4, 5]) {
        if (extCost['reqItemId' + index] > 0) {
          const itemIcon = await this.iconService.getIconByItemId(extCost['reqItemId' + index]).toPromise();

          resultText += `<span class="mx-2">${extCost['itemCount' + index]}</span>
          <img src="https://wow.zamimg.com/images/wow/icons/small/${itemIcon ? itemIcon : 'inv_misc_questionmark'}.jpg">`;
        }
      }
    }

    resultText += '</div>';

    return resultText;
  }

  getItemExtendedCost(extendedCost: number): Promise<string> {
    return this.extendedCostCache(extendedCost);
  }
}
