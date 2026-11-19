import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira/shared/utils';
import {
  CREATURE_TEXT_LOCALE_ID,
  CREATURE_TEXT_LOCALE_ID_2,
  CREATURE_TEXT_LOCALE_ID_3,
  CREATURE_TEXT_LOCALE_TABLE,
  CreatureTextLocale,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

/** The translations of the selected entry's texts, one row per locale (#144). */
@Service()
export class CreatureTextLocaleService extends MultiRowEditorService<CreatureTextLocale> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureTextLocale;
  protected override readonly _entityTable = CREATURE_TEXT_LOCALE_TABLE;
  protected override readonly _entityIdField = CREATURE_TEXT_LOCALE_ID;
  protected override readonly _entitySecondIdField = CREATURE_TEXT_LOCALE_ID_2;
  protected override readonly _entityExtraIdField = CREATURE_TEXT_LOCALE_ID_3;

  constructor() {
    super();
    this.init();
  }

  /** (a row is one text variant in one locale: GroupID, ID and Locale) */
  protected override getNewRowId(row: CreatureTextLocale): string {
    return `${row.GroupID}_${row.ID}_${row.Locale}`;
  }

  protected override getNewRowIdForm(controls: FormGroup<ModelForm<CreatureTextLocale>>['controls']): string {
    return `${controls.GroupID.value}_${controls.ID.value}_${controls.Locale.value}`;
  }
}
