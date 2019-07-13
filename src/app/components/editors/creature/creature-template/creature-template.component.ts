import { Component } from '@angular/core';

import { CreatureTemplateService } from '../../../../services/editors/creature/creature-template.service';
import { CreatureTemplate } from '../../../../types/creature-template.type';
import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { UNIT_FLAGS_2 } from '../../../../constants/flags/unit-flags2';
import { INHABIT_TYPE } from '../../../../constants/flags/inhabit-type';
import { TRAINER_TYPE } from '../../../../constants/options/trainer-type';
import { NPC_FLAGS } from '../../../../constants/flags/npc-flags';
import { CREATURE_FAMILY } from '../../../../constants/options/creature-family';
import { FACTIONS } from '../../../../constants/options/faction';
import { CREATURE_TYPE } from '../../../../constants/options/creature-type';
import { CREATURE_TYPE_FLAGS } from '../../../../constants/flags/creature-type-flags';
import { RANK } from '../../../../constants/options/rank';
import { UNIT_FLAGS } from '../../../../constants/flags/unit-flags';
import { DYNAMIC_FLAGS } from '../../../../constants/flags/dynamic-flags';
import { CREATURE_CLASS } from '../../../../constants/options/creature-class';
import { CREATURE_RACE } from '../../../../constants/options/creature-race';
import { MOVEMENT_TYPE } from '../../../../constants/options/movement-type';
import { FLAGS_EXTRA } from '../../../../constants/flags/flags-extra';
import { MECHANIC_IMMUNE_MASK } from '../../../../constants/flags/mechanic-immune-mask';
import { CREATURE_ICON } from '../../../../constants/options/creature-icon';
import { EXPANSION } from '../../../../constants/options/expansion';
import { UNIT_CLASS } from '../../../../constants/options/unit-class';
import { DAMAGE_TYPE } from '../../../../constants/options/damage-type';
import { CREATURE_AI_NAME } from '../../../../constants/options/creature-ai-name';

@Component({
  selector: 'app-creature-template',
  templateUrl: './creature-template.component.html',
  styleUrls: ['./creature-template.component.scss']
})
export class CreatureTemplateComponent extends SingleRowEditorComponent<CreatureTemplate> {

  public readonly UNIT_FLAGS = UNIT_FLAGS;
  public readonly UNIT_FLAGS_2 = UNIT_FLAGS_2;
  public readonly INHABIT_TYPE = INHABIT_TYPE;
  public readonly TRAINER_TYPE = TRAINER_TYPE;
  public readonly NPC_FLAGS = NPC_FLAGS;
  public readonly CREATURE_FAMILY = CREATURE_FAMILY;
  public readonly FACTIONS = FACTIONS;
  public readonly CREATURE_TYPE = CREATURE_TYPE;
  public readonly CREATURE_TYPE_FLAGS = CREATURE_TYPE_FLAGS;
  public readonly RANK = RANK;
  public readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  public readonly CREATURE_CLASS = CREATURE_CLASS;
  public readonly CREATURE_RACE = CREATURE_RACE;
  public readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  public readonly FLAGS_EXTRA = FLAGS_EXTRA;
  public readonly MECHANIC_IMMUNE_MASK = MECHANIC_IMMUNE_MASK;
  public readonly CREATURE_ICON = CREATURE_ICON;
  public readonly EXPANSION = EXPANSION;
  public readonly UNIT_CLASS = UNIT_CLASS;
  public readonly DAMAGE_TYPE = DAMAGE_TYPE;
  public readonly CREATURE_AI_NAME = CREATURE_AI_NAME;

  public readonly VEHICLE_ID_TOOLTIP = 'Entry of vehicle if creature is/has a vehicle entry. ' +
    'This field determines how the player appears on the vehicle, how the vehicle moves, ' +
    'and whether or not the vehicle action bar is shown. For example, a vehicleID of 292 will make the player invisible, ' +
    'prevent the vehicle from strafing left/right (but will allow forwards/backwards), and will show the vehicle action bar spells ' +
    '(which are defined in spell1-8). An npc_spellclick_spells entry must be made for this creature entry in order for this to work.';

  public readonly MODEL_ID_TOOLTIP = 'A random graphical model that the client applies on this creature. ' +
    'If you specify only one modelid and the rest will be equal to 0, model you have set won’t be chosen randomly. ' +
    'From creature_model_info.modelid';

  public readonly TRAINER_SPELL_TOOLTIP = 'If the NPC is a trainer that teaches professions (trainer_type = 2), ' +
    'then the player must already know the spell ID specified here to be able to talk to this NPC.';

  public readonly SPELLS_TOOLTIP = 'Spell ID that can be used for Mind Control of this creature. ' +
    'For vehicle creatures: the spell on action bar with position X.';

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
