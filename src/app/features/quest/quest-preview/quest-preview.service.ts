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
import { QuestTemplate } from '@keira-shared/types/quest-template.type';
import { CreatureQueststarter } from '@keira-shared/types/creature-queststarter.type';
import { EditorService } from '@keira-shared/abstract/service/editors/editor.service';
import { TableRow } from '@keira-types/general';
import { GameobjectQueststarter } from '@keira-shared/types/gameobject-queststarter.type';
import { CreatureQuestender } from '@keira-shared/types/creature-questender.type';
import { GameobjectQuestender } from '@keira-shared/types/gameobject-questender.type';
import { DifficultyLevel } from './quest-preview.model';

@Injectable()
export class QuestPreviewService {
  showPreview = true;

  constructor(
    private readonly helperService: PreviewHelperService,
    private readonly questHandlerService: QuestHandlerService,
    private readonly questTemplateService: QuestTemplateService,
    private readonly questRequestItemsService: QuestRequestItemsService,
    private readonly questTemplateAddonService: QuestTemplateAddonService,
    private readonly gameobjectQueststarterService: GameobjectQueststarterService,
    private readonly gameobjectQuestenderService: GameobjectQuestenderService,
    private readonly creatureQueststarterService: CreatureQueststarterService,
    private readonly creatureQuestenderService: CreatureQuestenderService,
    public readonly mysqlQueryService: MysqlQueryService,
  ) { }

  // get QuestTemplate values
  get title(): string { return this.questTemplate.LogTitle; }
  get level(): string { return String(this.questTemplate.QuestLevel); }
  get minLevel(): string { return String(this.questTemplate.MinLevel); }
  get side(): string { return this.helperService.getFactionFromRace(this.questTemplate.AllowableRaces); }
  get races(): string { return this.helperService.getRaceString(this.questTemplate.AllowableRaces)?.join(','); }
  get sharable(): string { return this.questTemplate.Flags & QUEST_FLAG_SHARABLE ? 'Sharable' : 'Not sharable'; }

  // get form value
  get questTemplate(): QuestTemplate { return this.questTemplateService.form.getRawValue(); }
  get creatureQueststarter(): CreatureQueststarter[] { return this.creatureQueststarterService.newRows; }
  get creatureQuestender(): CreatureQuestender[] { return this.creatureQuestenderService.newRows; }
  get gameobjectQueststarter(): GameobjectQueststarter[] { return this.gameobjectQueststarterService.newRows; }
  get gameobjectQuestender(): GameobjectQuestender[] { return this.gameobjectQuestenderService.newRows; }

  // Item Quest Starter
  get questGivenByItem(): Promise<string> { return this.mysqlQueryService.getItemByStartQuest(this.questTemplate.ID); }
  get questStarterItem(): Promise<string> { return this.mysqlQueryService.getItemNameByStartQuest(this.questTemplate.ID); }

  public difficulty: DifficultyLevel = {};

  difficultyLevels(): boolean {
    const levels: DifficultyLevel = {};

    if (this.questTemplate.QuestLevel > 0) {

      // red
      if (this.questTemplate.MinLevel && this.questTemplate.MinLevel < this.questTemplate.QuestLevel - 4) {
        levels['red'] = this.questTemplate.MinLevel;
      }

      // orange
      if (!this.questTemplate.MinLevel || this.questTemplate.MinLevel < this.questTemplate.QuestLevel - 2) {
        levels['orange'] = Object.keys(levels).length === 0 && this.questTemplate.MinLevel > this.questTemplate.QuestLevel - 4
          ? this.questTemplate.MinLevel
          : this.questTemplate.QuestLevel - 4;
      }

      // yellow
      levels['yellow'] = Object.keys(levels).length === 0 && this.questTemplate.MinLevel > this.questTemplate.QuestLevel - 2
        ? this.questTemplate.MinLevel
        : this.questTemplate.QuestLevel - 2;

      // green
      levels['green'] = this.questTemplate.QuestLevel + 3;

      // grey (is about +/-1 level off)
      levels['grey'] = this.questTemplate.QuestLevel + 3 + Math.ceil(12 * this.questTemplate.QuestLevel / 80);

      this.difficulty = levels;
      return true;
    }

    this.difficulty = levels;
    return false;
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
