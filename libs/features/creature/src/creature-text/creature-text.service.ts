import { Service, inject } from '@angular/core';
import { CREATURE_ID, CREATURE_TEXT_TABLE, CreatureText, EXTRA_ID, TEXT_ID } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';
import { firstValueFrom } from 'rxjs';
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

  /**
   * Fills the selected row's Text (and Language) from the broadcast_text its BroadcastTextId names: the MaleText, or the
   * FemaleText when there's none (#3568). Says why when it can't.
   */
  async textFromBroadcastText(): Promise<string> {
    const id = Number(this._form.controls.BroadcastTextId.value);
    if (!this.hasSelectedRow() || !(id > 0)) {
      return 'CREATURE.TEXT.NO_BROADCAST_TEXT_ID';
    }
    let rows: { MaleText: string; FemaleText: string; LanguageID: number }[] | undefined;
    try {
      rows = await firstValueFrom(
        this.queryService.query<{ MaleText: string; FemaleText: string; LanguageID: number }>(
          `SELECT \`MaleText\`, \`FemaleText\`, \`LanguageID\` FROM \`broadcast_text\` WHERE \`ID\` = ${id}`,
        ),
      );
    } catch (error) {
      console.error(error);
      return 'CREATURE.TEXT.BROADCAST_TEXT_UNREADABLE';
    }
    const row = rows?.[0];
    const text = row?.MaleText || row?.FemaleText;
    if (!row || !text) {
      return 'CREATURE.TEXT.BROADCAST_TEXT_NOT_FOUND';
    }
    this._form.markAsDirty();
    this._form.patchValue({ Text: text, Language: row.LanguageID });
    return '';
  }

  /** The selected row's comment: the creature's name (#3568), read from its template when it wasn't picked by name. */
  async commentFromCreature(): Promise<void> {
    if (!this.hasSelectedRow()) {
      return;
    }
    const name = this.handlerService.selectedName || (await this.queryService.getCreatureNameById(this.handlerService.selected));
    if (name) {
      this._form.markAsDirty();
      this._form.patchValue({ comment: name });
    }
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
