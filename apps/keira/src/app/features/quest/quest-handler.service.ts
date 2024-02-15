import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { CREATURE_QUESTENDER_TABLE } from '@keira-types/creature-questender.type';
import { CREATURE_QUESTSTARTER_TABLE } from '@keira-types/creature-queststarter.type';
import { GAMEOBJECT_QUESTENDER_TABLE } from '@keira-types/gameobject-questender.type';
import { GAMEOBJECT_QUESTSTARTER_TABLE } from '@keira-types/gameobject-queststarter.type';
import { QUEST_OFFER_REWARD_TABLE } from '@keira-types/quest-offer-reward.type';
import { QUEST_REQUEST_ITEMS_TABLE } from '@keira-types/quest-request-items.type';
import { QUEST_TEMPLATE_ADDON_TABLE } from '@keira-types/quest-template-addon.type';
import { QuestTemplate, QUEST_TEMPLATE_TABLE } from '@keira-types/quest-template.type';

@Injectable()
export class QuestHandlerService extends HandlerService<QuestTemplate> {
  get isQuestTemplateUnsaved(): boolean {
    return this.statusMap[QUEST_TEMPLATE_TABLE];
  }
  get isQuestTemplateAddonUnsaved(): boolean {
    return this.statusMap[QUEST_TEMPLATE_ADDON_TABLE];
  }
  get isQuestOfferRewardUnsaved(): boolean {
    return this.statusMap[QUEST_OFFER_REWARD_TABLE];
  }
  get isQuestRequestItemsUnsaved(): boolean {
    return this.statusMap[QUEST_REQUEST_ITEMS_TABLE];
  }
  get isCreatureQueststarterUnsaved(): boolean {
    return this.statusMap[CREATURE_QUESTSTARTER_TABLE];
  }
  get isCreatureQuestenderUnsaved(): boolean {
    return this.statusMap[CREATURE_QUESTENDER_TABLE];
  }
  get isGameobjectQueststarterUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_QUESTSTARTER_TABLE];
  }
  get isGameobjectQuestenderUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_QUESTENDER_TABLE];
  }

  protected _statusMap = {
    [QUEST_TEMPLATE_TABLE]: false,
    [QUEST_TEMPLATE_ADDON_TABLE]: false,
    [QUEST_OFFER_REWARD_TABLE]: false,
    [QUEST_REQUEST_ITEMS_TABLE]: false,
    [CREATURE_QUESTSTARTER_TABLE]: false,
    [CREATURE_QUESTENDER_TABLE]: false,
    [GAMEOBJECT_QUESTSTARTER_TABLE]: false,
    [GAMEOBJECT_QUESTENDER_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router) {
    super('quest/quest-template', router);
  }
}
