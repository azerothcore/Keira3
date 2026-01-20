import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_QUESTENDER_TABLE,
  CREATURE_QUESTSTARTER_TABLE,
  GAMEOBJECT_QUESTENDER_TABLE,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  QUEST_OFFER_REWARD_TABLE,
  QUEST_REQUEST_ITEMS_TABLE,
  QUEST_TEMPLATE_ADDON_TABLE,
  QUEST_TEMPLATE_LOCALE_TABLE,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate,
} from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class QuestHandlerService extends HandlerService<QuestTemplate> {
  protected readonly mainEditorRoutePath = 'quest/quest-template';
  protected readonly copyRoutePath = 'quest/copy';

  get isQuestTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[QUEST_TEMPLATE_TABLE].asReadonly();
  }
  get isQuestTemplateAddonUnsaved(): Signal<boolean> {
    return this.statusMap[QUEST_TEMPLATE_ADDON_TABLE].asReadonly();
  }
  get isQuestTemplateLocaleUnsaved(): Signal<boolean> {
    return this.statusMap[QUEST_TEMPLATE_LOCALE_TABLE].asReadonly();
  }
  get isQuestOfferRewardUnsaved(): Signal<boolean> {
    return this.statusMap[QUEST_OFFER_REWARD_TABLE].asReadonly();
  }
  get isQuestRequestItemsUnsaved(): Signal<boolean> {
    return this.statusMap[QUEST_REQUEST_ITEMS_TABLE].asReadonly();
  }
  get isCreatureQueststarterUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_QUESTSTARTER_TABLE].asReadonly();
  }
  get isCreatureQuestenderUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_QUESTENDER_TABLE].asReadonly();
  }
  get isGameobjectQueststarterUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_QUESTSTARTER_TABLE].asReadonly();
  }
  get isGameobjectQuestenderUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_QUESTENDER_TABLE].asReadonly();
  }

  protected _statusMap = {
    [QUEST_TEMPLATE_TABLE]: signal(false),
    [QUEST_TEMPLATE_ADDON_TABLE]: signal(false),
    [QUEST_TEMPLATE_LOCALE_TABLE]: signal(false),
    [QUEST_OFFER_REWARD_TABLE]: signal(false),
    [QUEST_REQUEST_ITEMS_TABLE]: signal(false),
    [CREATURE_QUESTSTARTER_TABLE]: signal(false),
    [CREATURE_QUESTENDER_TABLE]: signal(false),
    [GAMEOBJECT_QUESTSTARTER_TABLE]: signal(false),
    [GAMEOBJECT_QUESTENDER_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<QuestTemplate>, name?: string, navigate = true, sourceId?: string) {
    // If we're creating a new entity from a copy, navigate to copy route
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
