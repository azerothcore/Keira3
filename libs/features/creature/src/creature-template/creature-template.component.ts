import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CREATURE_AI_NAME,
  CREATURE_CLASS,
  CREATURE_FAMILY,
  CREATURE_ICON,
  CREATURE_RACE,
  CREATURE_TYPE,
  CREATURE_TYPE_FLAGS,
  CreatureTemplate,
  DAMAGE_TYPE,
  DYNAMIC_FLAGS,
  EXPANSION,
  FLAGS_EXTRA,
  MECHANIC_IMMUNE_MASK,
  MOVEMENT_TYPE,
  NPC_FLAGS,
  RANK,
  SPELL_SCHOOL_MASK,
  TRAINER_TYPE,
  UNIT_CLASS,
  UNIT_FLAGS,
  UNIT_FLAGS_2,
} from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import {
  BooleanOptionSelectorComponent,
  CreatureSelectorBtnComponent,
  FactionSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  GenericOptionSelectorComponent,
  IconSelectorComponent,
  SingleValueSelectorBtnComponent,
  SpellSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateService } from './creature-template.service';
import { RouterLink } from '@angular/router';
import { InputValidationDirective } from '@keira/shared/directives';
import { ValidationService } from '@keira/shared/common-services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template',
  templateUrl: './creature-template.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    FactionSelectorBtnComponent,
    FlagsSelectorBtnComponent,
    SpellSelectorBtnComponent,
    CreatureSelectorBtnComponent,
    GenericOptionSelectorComponent,
    BooleanOptionSelectorComponent,
    IconSelectorComponent,
    RouterLink,
    InputValidationDirective,
  ],
  providers: [ValidationService],
})
export class CreatureTemplateComponent extends SingleRowEditorComponent<CreatureTemplate> {
  protected readonly UNIT_FLAGS = UNIT_FLAGS;
  protected readonly UNIT_FLAGS_2 = UNIT_FLAGS_2;
  protected readonly TRAINER_TYPE = TRAINER_TYPE;
  protected readonly NPC_FLAGS = NPC_FLAGS;
  protected readonly CREATURE_FAMILY = CREATURE_FAMILY;
  protected readonly CREATURE_TYPE = CREATURE_TYPE;
  protected readonly CREATURE_TYPE_FLAGS = CREATURE_TYPE_FLAGS;
  protected readonly RANK = RANK;
  protected readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  protected readonly CREATURE_CLASS = CREATURE_CLASS;
  protected readonly CREATURE_RACE = CREATURE_RACE;
  protected readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  protected readonly FLAGS_EXTRA = FLAGS_EXTRA;
  protected readonly MECHANIC_IMMUNE_MASK = MECHANIC_IMMUNE_MASK;
  protected readonly SPELL_SCHOOL_IMMUNE_MASK = SPELL_SCHOOL_MASK;
  protected readonly CREATURE_ICON = CREATURE_ICON;
  protected readonly EXPANSION = EXPANSION;
  protected readonly UNIT_CLASS = UNIT_CLASS;
  protected readonly DAMAGE_TYPE = DAMAGE_TYPE;
  protected readonly CREATURE_AI_NAME = CREATURE_AI_NAME;

  protected RACE_ICON_GENDER = true;
  protected showCreaturePreview = false;

  protected override readonly editorService = inject(CreatureTemplateService);
  readonly handlerService = inject(CreatureHandlerService);
}
