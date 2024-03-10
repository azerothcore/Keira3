import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getEnumKeys, SingleRowEditorComponent } from '@keira/shared/core';
import {
  CONDITION_DISTANCE_TO_CV3,
  CONDITION_HP_PCT_CV2,
  CONDITION_HP_VAL_CV2,
  CONDITION_INSTANCE_INFO_CV3,
  CONDITION_LEVEL_CV2,
  CONDITION_NEAR_CREATURE_CV3,
  CONDITION_OBJECT_ENTRY_GUID_CV1,
  CONDITION_RELATION_TO_CV2,
  CONDITION_SOURCE_TYPES,
  CONDITION_STAND_STATE_CV1,
  CONDITION_STAND_STATE_CV2,
  CONDITION_TYPES,
  Conditions,
  QUEST_STATE,
  RANKMASK,
  TYPEMASK,
} from '@keira/shared/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';
import {
  CONDITION_TARGET_TOOLTIPS,
  CONDITION_VALUE_1_TOOLTIPS,
  CONDITION_VALUE_2_TOOLTIPS,
  CONDITION_VALUE_3_TOOLTIPS,
  SOURCE_ENTRY_TOOLTIPS,
  SOURCE_GROUP_TOOLTIPS,
} from './conditions-constants';
import { ConditionsService } from './conditions.service';
import { SingleValueSelectorBtnComponent } from '@keira/shared/core';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    TooltipModule,
    FlagsSelectorBtnComponent,
    SingleValueSelectorBtnComponent,
  ],
})
export class ConditionsComponent extends SingleRowEditorComponent<Conditions> {
  readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  readonly CONDITION_SOURCE_TYPES_KEYS = getEnumKeys(CONDITION_SOURCE_TYPES);
  readonly CONDITION_TYPES = CONDITION_TYPES;
  readonly CONDITION_TYPES_KEYS = getEnumKeys(CONDITION_TYPES);

  readonly SOURCE_GROUP_TOOLTIPS = SOURCE_GROUP_TOOLTIPS;
  readonly SOURCE_ENTRY_TOOLTIPS = SOURCE_ENTRY_TOOLTIPS;
  readonly CONDITION_TARGET_TOOLTIPS = CONDITION_TARGET_TOOLTIPS;
  readonly CONDITION_VALUE_1_TOOLTIPS = CONDITION_VALUE_1_TOOLTIPS;
  readonly CONDITION_VALUE_2_TOOLTIPS = CONDITION_VALUE_2_TOOLTIPS;
  readonly CONDITION_VALUE_3_TOOLTIPS = CONDITION_VALUE_3_TOOLTIPS;

  // Flag Select
  readonly QUEST_STATE = QUEST_STATE;
  readonly RANKMASK = RANKMASK;
  readonly TYPEMASK = TYPEMASK;

  // Option Select
  readonly CONDITION_INSTANCE_INFO_CV3 = CONDITION_INSTANCE_INFO_CV3;
  readonly CONDITION_LEVEL_CV2 = CONDITION_LEVEL_CV2;
  readonly CONDITION_NEAR_CREATURE_CV3 = CONDITION_NEAR_CREATURE_CV3;
  readonly CONDITION_OBJECT_ENTRY_GUID_CV1 = CONDITION_OBJECT_ENTRY_GUID_CV1;
  readonly CONDITION_RELATION_TO_CV2 = CONDITION_RELATION_TO_CV2;
  readonly CONDITION_DISTANCE_TO_CV3 = CONDITION_DISTANCE_TO_CV3;
  readonly CONDITION_HP_VAL_CV2 = CONDITION_HP_VAL_CV2;
  readonly CONDITION_HP_PCT_CV2 = CONDITION_HP_PCT_CV2;
  readonly CONDITION_STAND_STATE_CV1 = CONDITION_STAND_STATE_CV1;
  readonly CONDITION_STAND_STATE_CV2 = CONDITION_STAND_STATE_CV2;

  get selectedSourceType(): number {
    return this.editorService.form.controls.SourceTypeOrReferenceId.value;
  }

  get conditionType(): number {
    return this.editorService.form.controls.ConditionTypeOrReference.value;
  }

  get showQuestState(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_QUESTSTATE;
  }

  get showTypeMask(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_TYPE_MASK;
  }

  get showReactionTo(): boolean {
    switch (this.conditionType) {
      case CONDITION_TYPES.CONDITION_REPUTATION_RANK:
      case CONDITION_TYPES.CONDITION_REACTION_TO:
        return true;
      default:
        return false;
    }
  }

  get showInstanceInfo(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_INSTANCE_INFO;
  }

  get showLevel(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_LEVEL;
  }

  get showNearCreature(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_NEAR_CREATURE;
  }

  get showObjectEntryGuid(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_OBJECT_ENTRY_GUID;
  }

  get showRelationTo(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_RELATION_TO;
  }

  get showDistanceTo(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_DISTANCE_TO;
  }

  get showHPVal(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_HP_VAL;
  }

  get showHPPct(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_HP_PCT;
  }

  get showStandState(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_STAND_STATE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ConditionsService,
    public handlerService: ConditionsHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
