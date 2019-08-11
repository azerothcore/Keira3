import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { QuestTemplateAddon } from '../../../../types/quest-template-addon.type';
import { QuestTemplateAddonService } from '../../../../services/editors/quest/quest-template-addon.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { ALLOWABLE_CLASSES } from '../../../../constants/flags/allowable-classes';
import { FACTIONS } from '../../../../constants/options/faction';
import { SPECIAL_FLAGS } from '../../../../constants/flags/special-flags';

@Component({
  selector: 'app-quest-template-addon',
  templateUrl: './quest-template-addon.component.html',
  styleUrls: ['./quest-template-addon.component.scss']
})
export class QuestTemplateAddonComponent extends SingleRowEditorComponent<QuestTemplateAddon> {

  public readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  public readonly FACTIONS = FACTIONS;
  public readonly SPECIAL_FLAGS = SPECIAL_FLAGS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateAddonService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
