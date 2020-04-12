import { Injectable } from '@angular/core';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { QuestRequestItemsService } from '../quest-request-items/quest-request-items.service';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestTemplateAddonService } from '../quest-template-addon/quest-template-addon.service';
import { GameobjectQueststarterService } from '../gameobject-queststarter/gameobject-queststarter.service';
import { GameobjectQuestenderService } from '../gameobject-questender/gameobject-questender.service';
import { CreatureQueststarterService } from '../creature-queststarter/creature-queststarter.service';
import { CreatureQuestenderService } from '../creature-questender/creature-questender.service';
import { PreviewHelperService } from '@keira-shared/services/preview-helper.service';
import { QUEST_FLAG_SHARABLE } from '@keira-shared/constants/flags/quest-flags';
import { EditorService } from '@keira-shared/abstract/service/editors/editor.service';

@Injectable()
export class QuestPreviewService {
  showPreview = true;

  constructor(
    private readonly helperService: PreviewHelperService,
    private readonly questHandler: QuestHandlerService,
    private readonly questTemplate: QuestTemplateService,
    private readonly questRequestItem: QuestRequestItemsService,
    private readonly questTemplateAddon: QuestTemplateAddonService,
    private readonly gameObjectQueststarter: GameobjectQueststarterService,
    private readonly gameObjectQuestender: GameobjectQuestenderService,
    private readonly creatureQueststarter: CreatureQueststarterService,
    private readonly creatureQuestender: CreatureQuestenderService,
  ) { }

  private questTemplateForm = this.questTemplate.form.controls;

  get title(): string { return this.questTemplateForm.LogTitle.value; }
  get level(): string { return String(this.questTemplateForm.QuestLevel.value); }
  get minLevel(): string { return String(this.questTemplateForm.MinLevel.value); }
  get side(): string { return this.helperService.getFactionFromRace(this.questTemplateForm.AllowableRaces.value); }
  get races(): string { return this.helperService.getRaceString(this.questTemplateForm.AllowableRaces.value)?.join(','); }
  get sharable(): string { return this.questTemplateForm.Flags.value & QUEST_FLAG_SHARABLE ? 'Sharable' : 'Not sharable'; }

  initializeServices() {
    this.initService(this.questTemplate);
    this.initService(this.questRequestItem);
    this.initService(this.questTemplateAddon);
    this.initService(this.gameObjectQueststarter);
    this.initService(this.gameObjectQuestender);
    this.initService(this.creatureQueststarter);
    this.initService(this.creatureQuestender);
  }

  private initService(service: EditorService<any>) {
    if (!!this.questHandler.selected && service.loadedEntityId !== this.questHandler.selected) {
      service.reload(this.questHandler.selected);
    }
  }
}
