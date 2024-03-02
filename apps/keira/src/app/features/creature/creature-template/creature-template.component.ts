import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CREATURE_TYPE_FLAGS } from '@keira-constants/flags/creature-type-flags';
import { DYNAMIC_FLAGS } from '@keira-constants/flags/dynamic-flags';
import { FLAGS_EXTRA } from '@keira-constants/flags/flags-extra';
import { MECHANIC_IMMUNE_MASK } from '@keira-constants/flags/mechanic-immune-mask';
import { NPC_FLAGS } from '@keira-constants/flags/npc-flags';
import { SPELL_SCHOOL_MASK } from '@keira-constants/flags/spell-school-mask';
import { UNIT_FLAGS } from '@keira-constants/flags/unit-flags';
import { UNIT_FLAGS_2 } from '@keira-constants/flags/unit-flags2';
import { CREATURE_AI_NAME } from '@keira-constants/options/creature-ai-name';
import { CREATURE_CLASS } from '@keira-constants/options/creature-class';
import { CREATURE_FAMILY } from '@keira-constants/options/creature-family';
import { CREATURE_ICON } from '@keira-constants/options/creature-icon';
import { CREATURE_RACE } from '@keira-constants/options/creature-race';
import { CREATURE_TYPE } from '@keira-constants/options/creature-type';
import { DAMAGE_TYPE } from '@keira-constants/options/damage-type';
import { EXPANSION } from '@keira-constants/options/expansion';
import { MOVEMENT_TYPE } from '@keira-constants/options/movement-type';
import { RANK } from '@keira-constants/options/rank';
import { TRAINER_TYPE } from '@keira-constants/options/trainer-type';
import { UNIT_CLASS } from '@keira-constants/options/unit-class';
import { CreatureTemplate } from '@keira/acore-world-model';
import { VIEWER_TYPE } from 'app/features/model-3d-viewer/model-3d-viewer.model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateService } from './creature-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template',
  templateUrl: './creature-template.component.html',
  styleUrls: ['./creature-template.component.scss'],
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
