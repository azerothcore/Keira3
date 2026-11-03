import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  SPELL_SCRIPTS_ID,
  SPELL_SCRIPTS_ID_2,
  SPELL_SCRIPTS_ID_3,
  SPELL_SCRIPTS_TABLE,
  SpellScripts,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { ModelForm } from '@keira/shared/utils';
import { SpellScriptsHandlerService } from '../spell-scripts-handler.service';

/** The steps of one spell script; a step is told apart by effIndex, delay, command, datalong, datalong2, dataint (the table has no key). */
@Service()
export class SpellScriptsService extends MultiRowEditorService<SpellScripts> {
  protected override readonly handlerService = inject(SpellScriptsHandlerService);
  protected override readonly _entityClass = SpellScripts;
  protected override readonly _entityTable = SPELL_SCRIPTS_TABLE;
  protected override readonly _entityIdField = SPELL_SCRIPTS_ID;
  protected override readonly _entitySecondIdField = SPELL_SCRIPTS_ID_2;
  protected override readonly _entityExtraIdField = SPELL_SCRIPTS_ID_3;

  constructor() {
    super();
    this.init();
  }

  protected override getNewRowId(row: SpellScripts): string {
    return `${row.effIndex}_${row.delay}_${row.command}_${row.datalong}_${row.datalong2}_${row.dataint}`;
  }

  protected override getNewRowIdForm(controls: FormGroup<ModelForm<SpellScripts>>['controls']): string {
    return `${controls.effIndex.value}_${controls.delay.value}_${controls.command.value}_${controls.datalong.value}_${controls.datalong2.value}_${controls.dataint.value}`;
  }
}
