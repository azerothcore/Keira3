import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnChanges, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CONDITION_DISTANCE_TO_CV3,
  CONDITION_HP_PCT_CV2,
  CONDITION_HP_VAL_CV2,
  CONDITION_INSTANCE_INFO_CV3,
  CONDITION_LEVEL_CV2,
  CONDITION_NEAR_CREATURE_CV3,
  CONDITION_OBJECT_ENTRY_GUID_CV1,
  CONDITION_RELATION_TO_CV2,
  CONDITION_STAND_STATE_CV1,
  CONDITION_STAND_STATE_CV2,
  CONDITION_TYPES,
  Conditions,
  QUEST_STATE,
  RANKMASK,
  TYPEMASK,
} from '@keira/shared/acore-world-model';
import { FlagsSelectorBtnComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { getEnumKeys, ModelForm } from '@keira/shared/utils';
import { startWith, Subscription } from 'rxjs';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import {
  CONDITION_TARGET_TOOLTIPS,
  CONDITION_VALUE_1_TOOLTIPS,
  CONDITION_VALUE_2_TOOLTIPS,
  CONDITION_VALUE_3_TOOLTIPS,
} from '../edit-conditions/conditions-constants';
import { conditionComment } from '../edit-conditions/condition-comment';

/**
 * What a condition checks (ElseGroup, target, type, values and the rest), with the pickers of its type: the same in the
 * editor of one condition and in the one of all the conditions of a source (#3154).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-condition-fields',
  templateUrl: './condition-fields.component.html',
  imports: [
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    TooltipDirective,
    FlagsSelectorBtnComponent,
    SingleValueSelectorBtnComponent,
  ],
})
export class ConditionFieldsComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  /** The condition type as the form has it (followed: a row selected in the editor of a source sets it, #3154). */
  private readonly type = signal(0);
  private typeChanges?: Subscription;

  constructor() {
    this.destroyRef.onDestroy(() => this.typeChanges?.unsubscribe());
  }

  readonly form = input.required<FormGroup<ModelForm<Conditions>>>();
  /** The source type, for the tooltip of ConditionTarget. */
  readonly sourceType = input.required<number>();

  readonly CONDITION_TYPES = CONDITION_TYPES;
  readonly CONDITION_TYPES_KEYS = getEnumKeys(CONDITION_TYPES);
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

  ngOnChanges(): void {
    this.typeChanges?.unsubscribe();
    const control = this.form().controls.ConditionTypeOrReference;
    this.typeChanges = control.valueChanges.pipe(startWith(control.value)).subscribe((value) => this.type.set(value));
  }

  get conditionType(): number {
    return this.type();
  }

  get showQuestState(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_QUESTSTATE;
  }

  get showTypeMask(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_TYPE_MASK;
  }

  get showReactionTo(): boolean {
    return this.conditionType === CONDITION_TYPES.CONDITION_REPUTATION_RANK || this.conditionType === CONDITION_TYPES.CONDITION_REACTION_TO;
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

  /** Fills the comment from the condition's fields (#3153). */
  generateComment(): void {
    const form = this.form();
    form.controls.Comment.setValue(conditionComment(form.getRawValue() as Conditions));
    form.controls.Comment.markAsDirty();
  }
}
