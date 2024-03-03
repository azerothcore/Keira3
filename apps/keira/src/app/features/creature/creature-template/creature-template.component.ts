import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CREATURE_TYPE_FLAGS } from '@keira/acore-world-model';
import { DYNAMIC_FLAGS } from '@keira/acore-world-model';
import { FLAGS_EXTRA } from '@keira/acore-world-model';
import { MECHANIC_IMMUNE_MASK } from '@keira/acore-world-model';
import { NPC_FLAGS } from '@keira/acore-world-model';
import { SPELL_SCHOOL_MASK } from '@keira/acore-world-model';
import { UNIT_FLAGS } from '@keira/acore-world-model';
import { UNIT_FLAGS_2 } from '@keira/acore-world-model';
import { CREATURE_AI_NAME } from '@keira/acore-world-model';
import { CREATURE_CLASS } from '@keira/acore-world-model';
import { CREATURE_FAMILY } from '@keira/acore-world-model';
import { CREATURE_ICON } from '@keira/acore-world-model';
import { CREATURE_RACE } from '@keira/acore-world-model';
import { CREATURE_TYPE } from '@keira/acore-world-model';
import { DAMAGE_TYPE } from '@keira/acore-world-model';
import { EXPANSION } from '@keira/acore-world-model';
import { MOVEMENT_TYPE } from '@keira/acore-world-model';
import { RANK } from '@keira/acore-world-model';
import { TRAINER_TYPE } from '@keira/acore-world-model';
import { UNIT_CLASS } from '@keira/acore-world-model';
import { CreatureTemplate } from '@keira/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateService } from './creature-template.service';
import { VIEWER_TYPE } from '../../model-3d-viewer/model-3d-viewer.model';

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
