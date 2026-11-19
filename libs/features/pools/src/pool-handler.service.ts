import { Service, signal, Signal } from '@angular/core';
import {
  GAME_EVENT_POOL_TABLE,
  POOL_CREATURE_TABLE,
  POOL_GAMEOBJECT_TABLE,
  POOL_POOL_TABLE,
  POOL_QUEST_TABLE,
  POOL_TEMPLATE_TABLE,
  PoolTemplate,
} from '@keira/shared/acore-world-model';
import { HandlerService } from '@keira/shared/base-abstract-classes';

/** The pool (`pool_template.entry`) being edited, and which of its tables have unsaved changes. */
@Service()
export class PoolHandlerService extends HandlerService<PoolTemplate> {
  protected readonly mainEditorRoutePath = 'pools/pool-template';

  get isPoolTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[POOL_TEMPLATE_TABLE].asReadonly();
  }
  get isPoolCreatureUnsaved(): Signal<boolean> {
    return this.statusMap[POOL_CREATURE_TABLE].asReadonly();
  }
  get isPoolGameobjectUnsaved(): Signal<boolean> {
    return this.statusMap[POOL_GAMEOBJECT_TABLE].asReadonly();
  }
  get isPoolPoolUnsaved(): Signal<boolean> {
    return this.statusMap[POOL_POOL_TABLE].asReadonly();
  }
  get isPoolQuestUnsaved(): Signal<boolean> {
    return this.statusMap[POOL_QUEST_TABLE].asReadonly();
  }
  get isGameEventPoolUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_EVENT_POOL_TABLE].asReadonly();
  }

  protected _statusMap = {
    [POOL_TEMPLATE_TABLE]: signal(false),
    [POOL_CREATURE_TABLE]: signal(false),
    [POOL_GAMEOBJECT_TABLE]: signal(false),
    [POOL_POOL_TABLE]: signal(false),
    [POOL_QUEST_TABLE]: signal(false),
    [GAME_EVENT_POOL_TABLE]: signal(false),
  };
}
