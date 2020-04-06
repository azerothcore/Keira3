import { Injectable, OnInit } from '@angular/core';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { QuestRequestItemsService } from '../quest-request-items/quest-request-items.service';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestTemplateAddonService } from '../quest-template-addon/quest-template-addon.service';
import { GameobjectQueststarterService } from '../gameobject-queststarter/gameobject-queststarter.service';
import { GameobjectQuestenderService } from '../gameobject-questender/gameobject-questender.service';
import { CreatureQueststarterService } from '../creature-queststarter/creature-queststarter.service';
import { CreatureQuestenderService } from '../creature-questender/creature-questender.service';
import { PreviewService } from '@keira-shared/abstract/service/editors/preview.service';

@Injectable()
export class QuestPreviewService {
  showPreview = true;

  constructor(
    private readonly questTemplate: QuestTemplateService,
    private readonly questRequestItem: QuestRequestItemsService,
    private readonly questHandler: QuestHandlerService,
    private readonly questTemplateAddon: QuestTemplateAddonService,
    private readonly gameObjectQueststarter: GameobjectQueststarterService,
    private readonly gameObjectQuestender: GameobjectQuestenderService,
    private readonly creatureQueststarter: CreatureQueststarterService,
    private readonly creatureQuestender: CreatureQuestenderService,
    private readonly previewService: PreviewService,
  ) { }

  get title(): string { return this.questTemplate.form.controls.LogTitle.value; }
  get level(): string | number { return this.questTemplate.form.controls.QuestLevel.value; }
  get minLevel(): number | string { return this.questTemplate.form.controls.MinLevel.value; }
  get side(): string { return this.previewService.getFactionFromRace(this.questTemplate.form.controls.AllowableRaces.value); }
  get races(): string { return this.previewService.getRaceString(this.questTemplate.form.controls.AllowableRaces.value).join(','); }
}
