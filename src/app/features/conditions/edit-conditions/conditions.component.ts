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
import { QUEST_STATE, RANKMASK } from '@keira-constants/flags/conditions';
import {
  CONDITION_INSTANCE_INFO_CV3,
  CONDITION_LEVEL_CV2,
  CONDITION_NEAR_CREATURE_CV3,
  CONDITION_OBJECT_ENTRY_GUID_CV1,
  CONDITION_RELATION_TO_CV2,
  CONDITION_DISTANCE_TO_CV3,
  CONDITION_HP_VAL_CV2,
  CONDITION_HP_PCT_CV2,
  CONDITION_STAND_STATE_CV1,
  CONDITION_STAND_STATE_CV2,
} from '@keira-constants/options/conditions';

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

  // Flag Select
  public readonly QUEST_STATE = QUEST_STATE;
  public readonly RANKMASK = RANKMASK;

  // Option Select
  public readonly CONDITION_INSTANCE_INFO_CV3 = CONDITION_INSTANCE_INFO_CV3;
  public readonly CONDITION_LEVEL_CV2 = CONDITION_LEVEL_CV2;
  public readonly CONDITION_NEAR_CREATURE_CV3 = CONDITION_NEAR_CREATURE_CV3;
  public readonly CONDITION_OBJECT_ENTRY_GUID_CV1 = CONDITION_OBJECT_ENTRY_GUID_CV1;
  public readonly CONDITION_RELATION_TO_CV2 = CONDITION_RELATION_TO_CV2;
  public readonly CONDITION_DISTANCE_TO_CV3 = CONDITION_DISTANCE_TO_CV3;
  public readonly CONDITION_HP_VAL_CV2 = CONDITION_HP_VAL_CV2;
  public readonly CONDITION_HP_PCT_CV2 = CONDITION_HP_PCT_CV2;
  public readonly CONDITION_STAND_STATE_CV1 = CONDITION_STAND_STATE_CV1;
  public readonly CONDITION_STAND_STATE_CV2 = CONDITION_STAND_STATE_CV2;

  get selectedSourceType(): number {
   return this.editorService.form.controls.SourceTypeOrReferenceId.value;
  }

  get conditionType(): number {
    return this.editorService.form.controls.ConditionTypeOrReference.value;
  }

  get showQuestState(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_QUESTSTATE;
  }

  get showReactionTo(): boolean {
    /* istanbul ignore next */ // TODO
    switch (this.conditionType) {
      case CONDITION_TYPES.CONDITION_REPUTATION_RANK:
      case CONDITION_TYPES.CONDITION_REACTION_TO:
        return true;
      default:
        return false;
    }
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ConditionsService,
    public handlerService: ConditionsHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
