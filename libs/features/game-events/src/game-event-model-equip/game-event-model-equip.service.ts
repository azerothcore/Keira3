import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_MODEL_EQUIP_ID,
  GAME_EVENT_MODEL_EQUIP_ID_2,
  GAME_EVENT_MODEL_EQUIP_TABLE,
  GameEventModelEquip,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Models and equipment by the event (game_event_model_equip). */
@Service()
export class GameEventModelEquipService extends MultiRowEditorService<GameEventModelEquip> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventModelEquip;
  protected override readonly _entityTable = GAME_EVENT_MODEL_EQUIP_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_MODEL_EQUIP_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_MODEL_EQUIP_ID_2;

  constructor() {
    super();
    this.init();
  }
}
