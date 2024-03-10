import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/core';
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
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateService } from './creature-template.service';
import { VIEWER_TYPE, Model3DViewerComponent } from '@keira/shared/model-3d-viewer';
import { CreatureSelectorBtnComponent } from '@keira/shared/core';
import { SpellSelectorBtnComponent } from '@keira/shared/core';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { FactionSelectorBtnComponent } from '@keira/shared/core';
import { SingleValueSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template',
  templateUrl: './creature-template.component.html',
  styleUrls: ['./creature-template.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    FactionSelectorBtnComponent,
    FlagsSelectorBtnComponent,
    NgFor,
    SpellSelectorBtnComponent,
    CreatureSelectorBtnComponent,
    Model3DViewerComponent,
  ],
})
export class CreatureTemplateComponent extends SingleRowEditorComponent<CreatureTemplate> {
  readonly UNIT_FLAGS = UNIT_FLAGS;
  readonly UNIT_FLAGS_2 = UNIT_FLAGS_2;
  readonly TRAINER_TYPE = TRAINER_TYPE;
  readonly NPC_FLAGS = NPC_FLAGS;
  readonly CREATURE_FAMILY = CREATURE_FAMILY;
  readonly CREATURE_TYPE = CREATURE_TYPE;
  readonly CREATURE_TYPE_FLAGS = CREATURE_TYPE_FLAGS;
  readonly RANK = RANK;
  readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  readonly CREATURE_CLASS = CREATURE_CLASS;
  readonly CREATURE_RACE = CREATURE_RACE;
  readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  readonly FLAGS_EXTRA = FLAGS_EXTRA;
  readonly MECHANIC_IMMUNE_MASK = MECHANIC_IMMUNE_MASK;
  readonly SPELL_SCHOOL_IMMUNE_MASK = SPELL_SCHOOL_MASK;
  readonly CREATURE_ICON = CREATURE_ICON;
  readonly EXPANSION = EXPANSION;
  readonly UNIT_CLASS = UNIT_CLASS;
  readonly DAMAGE_TYPE = DAMAGE_TYPE;
  readonly CREATURE_AI_NAME = CREATURE_AI_NAME;
  readonly NPC_VIEWER_TYPE = VIEWER_TYPE.NPC;

  showItemPreview = true;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
