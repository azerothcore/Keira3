import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { QuestTemplateAddon } from '@keira-types/quest-template-addon.type';
import { QuestTemplateAddonService } from './quest-template-addon.service';
import { QuestHandlerService } from '../quest-handler.service';
import { ALLOWABLE_CLASSES } from '@keira-constants/flags/allowable-classes';
import { SPECIAL_FLAGS } from '@keira-constants/flags/special-flags';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';

@Component({
  selector: 'keira-quest-template-addon',
  templateUrl: './quest-template-addon.component.html',
  styleUrls: ['./quest-template-addon.component.scss'],
})
export class QuestTemplateAddonComponent extends SingleRowEditorComponent<QuestTemplateAddon> {
  public readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  public readonly SPECIAL_FLAGS = SPECIAL_FLAGS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateAddonService,
    public handlerService: QuestHandlerService,
    public readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
