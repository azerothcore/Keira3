import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_NPC_VENDOR_ID,
  GAME_EVENT_NPC_VENDOR_ID_2,
  GAME_EVENT_NPC_VENDOR_ID_3,
  GAME_EVENT_NPC_VENDOR_TABLE,
  GameEventNpcVendor,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Vendor items by the event (game_event_npc_vendor). */
@Service()
export class GameEventNpcVendorService extends MultiRowEditorService<GameEventNpcVendor> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventNpcVendor;
  protected override readonly _entityTable = GAME_EVENT_NPC_VENDOR_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_NPC_VENDOR_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_NPC_VENDOR_ID_2;
  protected override readonly _entityExtraIdField = GAME_EVENT_NPC_VENDOR_ID_3;

  constructor() {
    super();
    this.init();
  }
}
