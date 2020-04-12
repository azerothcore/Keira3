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
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { EditorService } from '@keira-shared/abstract/service/editors/editor.service';
import { TableRow } from '@keira-types/general';

@Injectable()
export class QuestPreviewService {
  showPreview = true;

  constructor(
    private readonly helperService: PreviewHelperService,
    private readonly mysqlQueryService: MysqlQueryService,
    private readonly questHandlerService: QuestHandlerService,
    private readonly questTemplateService: QuestTemplateService,
    private readonly questRequestItemsService: QuestRequestItemsService,
    private readonly questTemplateAddonService: QuestTemplateAddonService,
    private readonly gameobjectQueststarterService: GameobjectQueststarterService,
    private readonly gameobjectQuestenderService: GameobjectQuestenderService,
    private readonly creatureQueststarterService: CreatureQueststarterService,
    private readonly creatureQuestenderService: CreatureQuestenderService,
  ) { }

  private questTemplateForm = this.questTemplateService.form.controls;

  get title(): string { return this.questTemplateForm.LogTitle.value; }
  get level(): string { return String(this.questTemplateForm.QuestLevel.value); }
  get minLevel(): string { return String(this.questTemplateForm.MinLevel.value); }
  get side(): string { return this.helperService.getFactionFromRace(this.questTemplateForm.AllowableRaces.value); }
  get races(): string { return this.helperService.getRaceString(this.questTemplateForm.AllowableRaces.value)?.join(','); }
  get sharable(): string { return this.questTemplateForm.Flags.value & QUEST_FLAG_SHARABLE ? 'Sharable' : 'Not sharable'; }

  private async getPrevQuestList(id: number): Promise<number[]> {
    const array: number[] = [];
    let current = id;

    while (!!current) {
      const prev = await Number(this.mysqlQueryService.getPrevQuestById(current));

      if (!!prev) {
        array.push(prev);
      }

      current = prev;
    }

    return array;
  }

  initializeServices() {
    this.initService(this.questTemplateService);
    this.initService(this.questRequestItemsService);
    this.initService(this.questTemplateAddonService);
    this.initService(this.gameobjectQueststarterService);
    this.initService(this.gameobjectQuestenderService);
    this.initService(this.creatureQueststarterService);
    this.initService(this.creatureQuestenderService);
  }

  private initService<T extends TableRow>(service: EditorService<T>) {
    if (!!this.questHandlerService.selected && service.loadedEntityId !== this.questHandlerService.selected) {
      service.reload(this.questHandlerService.selected);
    }
  }
}
