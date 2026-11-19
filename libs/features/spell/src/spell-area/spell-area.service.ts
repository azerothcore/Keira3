import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira/shared/utils';
import { SPELL_AREA_ID, SPELL_AREA_ID_2, SPELL_AREA_ID_3, SPELL_AREA_TABLE, SpellArea } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { SpellHandlerService } from '../spell-handler.service';

@Service()
export class SpellAreaService extends MultiRowEditorService<SpellArea> {
  protected override readonly handlerService = inject(SpellHandlerService);
  protected override readonly _entityClass = SpellArea;
  protected override readonly _entityTable = SPELL_AREA_TABLE;
  protected override readonly _entityIdField = SPELL_AREA_ID;
  protected override readonly _entitySecondIdField = SPELL_AREA_ID_2;
  protected override readonly _entityExtraIdField = SPELL_AREA_ID_3;

  constructor() {
    super();
    this.init();
  }

  /** (a row is told apart by area, quest_start, aura_spell, racemask, gender) */
  protected override getNewRowId(row: SpellArea): string {
    return `${row.area}_${row.quest_start}_${row.aura_spell}_${row.racemask}_${row.gender}`;
  }

  protected override getNewRowIdForm(controls: FormGroup<ModelForm<SpellArea>>['controls']): string {
    return `${controls.area.value}_${controls.quest_start.value}_${controls.aura_spell.value}_${controls.racemask.value}_${controls.gender.value}`;
  }
}
