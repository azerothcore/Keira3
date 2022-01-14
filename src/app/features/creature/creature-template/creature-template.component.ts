import { Component } from '@angular/core';

import { CreatureTemplateService } from './creature-template.service';
import { CreatureTemplate } from '@keira-types/creature-template.type';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CreatureHandlerService } from '../creature-handler.service';
import { UNIT_FLAGS_2 } from '@keira-constants/flags/unit-flags2';
import { TRAINER_TYPE } from '@keira-constants/options/trainer-type';
import { NPC_FLAGS } from '@keira-constants/flags/npc-flags';
import { CREATURE_FAMILY } from '@keira-constants/options/creature-family';
import { CREATURE_TYPE } from '@keira-constants/options/creature-type';
import { CREATURE_TYPE_FLAGS } from '@keira-constants/flags/creature-type-flags';
import { RANK } from '@keira-constants/options/rank';
import { UNIT_FLAGS } from '@keira-constants/flags/unit-flags';
import { DYNAMIC_FLAGS } from '@keira-constants/flags/dynamic-flags';
import { CREATURE_CLASS } from '@keira-constants/options/creature-class';
import { CREATURE_RACE } from '@keira-constants/options/creature-race';
import { MOVEMENT_TYPE } from '@keira-constants/options/movement-type';
import { FLAGS_EXTRA } from '@keira-constants/flags/flags-extra';
import { MECHANIC_IMMUNE_MASK } from '@keira-constants/flags/mechanic-immune-mask';
import { SPELL_SCHOOL_MASK } from '@keira-constants/flags/spell-school-mask';
import { CREATURE_ICON } from '@keira-constants/options/creature-icon';
import { EXPANSION } from '@keira-constants/options/expansion';
import { UNIT_CLASS } from '@keira-constants/options/unit-class';
import { DAMAGE_TYPE } from '@keira-constants/options/damage-type';
import { CREATURE_AI_NAME } from '@keira-constants/options/creature-ai-name';

@Component({
  selector: 'keira-creature-template',
  templateUrl: './creature-template.component.html',
  styleUrls: ['./creature-template.component.scss'],
})
export class CreatureTemplateComponent extends SingleRowEditorComponent<CreatureTemplate> {
  public readonly UNIT_FLAGS = UNIT_FLAGS;
  public readonly UNIT_FLAGS_2 = UNIT_FLAGS_2;
  public readonly TRAINER_TYPE = TRAINER_TYPE;
  public readonly NPC_FLAGS = NPC_FLAGS;
  public readonly CREATURE_FAMILY = CREATURE_FAMILY;
  public readonly CREATURE_TYPE = CREATURE_TYPE;
  public readonly CREATURE_TYPE_FLAGS = CREATURE_TYPE_FLAGS;
  public readonly RANK = RANK;
  public readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  public readonly CREATURE_CLASS = CREATURE_CLASS;
  public readonly CREATURE_RACE = CREATURE_RACE;
  public readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  public readonly FLAGS_EXTRA = FLAGS_EXTRA;
  public readonly MECHANIC_IMMUNE_MASK = MECHANIC_IMMUNE_MASK;
  public readonly SPELL_SCHOOL_IMMUNE_MASK = SPELL_SCHOOL_MASK;
  public readonly CREATURE_ICON = CREATURE_ICON;
  public readonly EXPANSION = EXPANSION;
  public readonly UNIT_CLASS = UNIT_CLASS;
  public readonly DAMAGE_TYPE = DAMAGE_TYPE;
  public readonly CREATURE_AI_NAME = CREATURE_AI_NAME;

  public readonly VEHICLE_ID_TOOLTIP =
    'Entry of vehicle if creature is/has a vehicle entry. ' +
    'This field determines how the player appears on the vehicle, how the vehicle moves, ' +
    'and whether or not the vehicle action bar is shown. For example, a vehicleID of 292 will make the player invisible, ' +
    'prevent the vehicle from strafing left/right (but will allow forwards/backwards), and will show the vehicle action bar spells ' +
    '(which are defined in spell1-8). An npc_spellclick_spells entry must be made for this creature entry in order for this to work.';

  public readonly MODEL_ID_TOOLTIP =
    'A random graphical model that the client applies on this creature. ' +
    'If you specify only one modelid and the rest will be equal to 0, model you have set won’t be chosen randomly. ' +
    'From creature_model_info.modelid';

  public readonly TRAINER_SPELL_TOOLTIP =
    'If the NPC is a trainer that teaches professions (trainer_type = 2), ' +
    'then the player must already know the spell ID specified here to be able to talk to this NPC.';

  public readonly SPELLS_TOOLTIP =
    'Spell ID that can be used for Mind Control of this creature. ' + 'For vehicle creatures: the spell on action bar with position X.';

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureTemplateService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
