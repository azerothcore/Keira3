import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { ALLOWABLE_CLASSES } from '@keira-constants/flags/allowable-classes';
import { SPECIAL_FLAGS } from '@keira-constants/flags/special-flags';
import { QuestTemplateAddon } from '@keira/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateAddonService } from './quest-template-addon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template-addon',
  templateUrl: './quest-template-addon.component.html',
  styleUrls: ['./quest-template-addon.component.scss'],
})
export class QuestTemplateAddonComponent extends SingleRowEditorComponent<QuestTemplateAddon> {
  readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  readonly SPECIAL_FLAGS = SPECIAL_FLAGS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateAddonService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
