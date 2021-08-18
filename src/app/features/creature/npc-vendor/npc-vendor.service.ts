import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
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
    public readonly queryService: MysqlQueryService,
    public readonly sqliteQueryService: SqliteQueryService,
    protected toastrService: ToastrService,
    private readonly sanitizer: DomSanitizer,
  ) {
    super(NpcVendor, NPC_VENDOR_TABLE, NPC_VENDOR_ID, NPC_VENDOR_ID_2, handlerService, queryService, toastrService);
  }

  private cache: { [key: string]: Promise<string>[] } = {};

  private extendedCostCache(cacheId: string, extendedCost: number): Promise<string> {
    if (!this.cache[cacheId]) {
      this.cache[cacheId] = [];
    }
    if (!this.cache[cacheId][extendedCost]) {
      this.cache[cacheId][extendedCost] = this.getItemExtendedCostReadable(extendedCost);
    }
    return this.cache[cacheId][extendedCost];
  }

  private async getItemExtendedCostReadable(extendedCost: number): Promise<string> {
    const extendedCostData: ItemExtendedCost[] = await this.sqliteQueryService.getItemExtendedCost([extendedCost]);
    // return this.sqliteQueryService.getItemExtendedCost([extendedCost]).then((extendedCostData) => {
    let resultText = '<div class="item-extended-cost">';

    if (extendedCostData[0]?.reqHonorPoints > 0) {
      console.log('honor: ', extendedCostData[0].reqHonorPoints);
      resultText += `<span class="mx-2">${extendedCostData[0].reqHonorPoints}</span>
        <span class="mx-1 alliance side"></span>
        <span class="mx-1 horde side"></span>`;
    }

    // if (extendedCostData[0]?.reqArenaPoints > 0) {
    //   console.log('arena: ', extendedCostData[0].reqArenaPoints);
    //   // resultText +=
    //   //   extendedCostData[0].reqArenaPoints + ' <img src="assets/img/quest/alliance.gif"> <img src="assets/img/quest/horde.gif"> ';
    // }

    resultText += '</div>';

    return resultText;
  }

  getItemExtendedCost(extendedCost: number): Promise<string> {
    return this.extendedCostCache('extendedCost', extendedCost);
  }
}
