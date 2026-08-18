import { Service, inject } from '@angular/core';
import { CREATURE_ID, CREATURE_TEXT_TABLE, CreatureText, EXTRA_ID, TEXT_ID } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';
import { BroadcastTextRow } from './broadcast-text-browser/broadcast-text-browser.model';

@Service()
export class CreatureTextService extends MultiRowEditorService<CreatureText> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureText;
  protected override readonly _entityTable = CREATURE_TEXT_TABLE;
  protected override readonly _entityIdField = CREATURE_ID;
  protected override readonly _entitySecondIdField = TEXT_ID;
  protected override readonly _entityExtraIdField = EXTRA_ID;

  constructor() {
    super();
    this.init();
  }

  /**
   * A creature_text GroupID is one "line" the creature can say, and the IDs inside it are the
   * interchangeable variants of that line. Duplicating therefore adds another variant to the same
   * group, while adding a brand new row (see `assignNewRowIds`) starts a new group instead.
   */
  protected override assignDuplicatedRowIds(newRow: CreatureText): void {
    newRow.ID = this.getNextIdOfGroup(newRow.GroupID);
  }

  /**
   * Fills the selected row from a broadcast_text: both rows describe the same spoken line, so its
   * id, its language and its wording belong together and are always copied as one.
   */
  applyBroadcastText({ ID, LanguageID, Text }: BroadcastTextRow): void {
    if (!this.hasSelectedRow()) {
      return;
    }

    this._form.markAsDirty();
    this._form.patchValue({ BroadcastTextId: ID, Language: LanguageID, Text });
  }

  private getNextIdOfGroup(groupId: number): number {
    let maxId = -1;

    for (const row of this._newRows) {
      if (Number(row.GroupID) === Number(groupId)) {
        maxId = Math.max(maxId, Number(row.ID));
      }
    }

    return maxId + 1;
  }
}
