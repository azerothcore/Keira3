import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { ConditionsHandlerService } from '../conditions-handler.service';
import {
  CONDITION_SOURCE_TYPES,
  CONDITION_SOURCE_TYPES_KEYS,
  CONDITION_TYPES,
  CONDITION_TYPES_KEYS,
  Conditions
} from '@keira-types/conditions.type';
import { ConditionsService } from './conditions.service';
import {
  CONDITION_TARGET_TOOLTIPS,
  CONDITION_VALUE_1_TOOLTIPS, CONDITION_VALUE_2_TOOLTIPS, CONDITION_VALUE_3_TOOLTIPS,
  SOURCE_ENTRY_TOOLTIPS,
  SOURCE_GROUP_TOOLTIPS
} from './conditions-constants';
import { QUEST_STATE } from '@keira-constants/flags/quest-state';

@Component({
  selector: 'keira-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss']
})
export class ConditionsComponent extends SingleRowEditorComponent<Conditions> {

  public readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  public readonly CONDITION_SOURCE_TYPES_KEYS = CONDITION_SOURCE_TYPES_KEYS;
  public readonly CONDITION_TYPES = CONDITION_TYPES;
  public readonly CONDITION_TYPES_KEYS = CONDITION_TYPES_KEYS;

  public readonly SOURCE_GROUP_TOOLTIPS = SOURCE_GROUP_TOOLTIPS;
  public readonly SOURCE_ENTRY_TOOLTIPS = SOURCE_ENTRY_TOOLTIPS;
  public readonly CONDITION_TARGET_TOOLTIPS = CONDITION_TARGET_TOOLTIPS;
  public readonly CONDITION_VALUE_1_TOOLTIPS = CONDITION_VALUE_1_TOOLTIPS;
  public readonly CONDITION_VALUE_2_TOOLTIPS = CONDITION_VALUE_2_TOOLTIPS;
  public readonly CONDITION_VALUE_3_TOOLTIPS = CONDITION_VALUE_3_TOOLTIPS;

  public readonly QUEST_STATE = QUEST_STATE;

  get selectedSourceType(): number {
   return this.editorService.form.controls.SourceTypeOrReferenceId.value;
  }

  get conditionType(): number {
    return this.editorService.form.controls.ConditionTypeOrReference.value;
  }

  get showQuestState(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_QUESTSTATE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ConditionsService,
    public handlerService: ConditionsHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
