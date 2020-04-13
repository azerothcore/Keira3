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
import { QuestSerie } from './quest-preview.model';
import { QuestTemplate } from '@keira-shared/types/quest-template.type';
import { CreatureQueststarter } from '@keira-shared/types/creature-queststarter.type';
import { GameobjectQueststarter } from '@keira-shared/types/gameobject-queststarter.type';
import { CreatureQuestender } from '@keira-shared/types/creature-questender.type';
import { GameobjectQuestender } from '@keira-shared/types/gameobject-questender.type';
import { QuestTemplateAddon } from '@keira-types/quest-template-addon.type';


@Injectable()
export class QuestPreviewService {
  showPreview = true;

  private prevSerieCache: Promise<QuestSerie>[] = [];
  private nextSerieCache: Promise<QuestSerie>[] = [];
  private nextSerieUsingPrevCache: Promise<QuestSerie>[] = [];

  constructor(
    private readonly helperService: PreviewHelperService,
    public readonly mysqlQueryService: MysqlQueryService,
    private readonly questHandlerService: QuestHandlerService,
    private readonly questTemplateService: QuestTemplateService,
    private readonly questRequestItemsService: QuestRequestItemsService,
    private readonly questTemplateAddonService: QuestTemplateAddonService,
    private readonly gameobjectQueststarterService: GameobjectQueststarterService,
    private readonly gameobjectQuestenderService: GameobjectQuestenderService,
    private readonly creatureQueststarterService: CreatureQueststarterService,
    private readonly creatureQuestenderService: CreatureQuestenderService,
  ) { }

  // get QuestTemplate values
  get id(): number { return this.questTemplate.ID; }
  get title(): string { return this.questTemplate.LogTitle; }
  get level(): string { return String(this.questTemplate.QuestLevel); }
  get minLevel(): string { return String(this.questTemplate.MinLevel); }
  get side(): string { return this.helperService.getFactionFromRace(this.questTemplate.AllowableRaces); }
  get races(): string { return this.helperService.getRaceString(this.questTemplate.AllowableRaces)?.join(','); }
  get sharable(): string { return this.questTemplate.Flags & QUEST_FLAG_SHARABLE ? 'Sharable' : 'Not sharable'; }

  // get form value
  get questTemplate(): QuestTemplate { return this.questTemplateService.form.getRawValue(); }
  get questTemplateAddon(): QuestTemplateAddon { return this.questTemplateAddonService.form.getRawValue(); }
  get creatureQueststarterList(): CreatureQueststarter[] { return this.creatureQueststarterService.newRows; }
  get creatureQuestenderList(): CreatureQuestender[] { return this.creatureQuestenderService.newRows; }
  get gameobjectQueststarterList(): GameobjectQueststarter[] { return this.gameobjectQueststarterService.newRows; }
  get gameobjectQuestenderList(): GameobjectQuestender[] { return this.gameobjectQuestenderService.newRows; }

  // Item Quest Starter
  get questGivenByItem(): Promise<string> { return this.mysqlQueryService.getItemByStartQuest(this.questTemplate.ID); }
  get questStarterItem(): Promise<string> { return this.mysqlQueryService.getItemNameByStartQuest(this.questTemplate.ID); }

  // Quest Serie
  get prevQuestList(): Promise<QuestSerie> { return this.getPrevQuestListCached(); }
  get nextQuestList(): Promise<QuestSerie> { return this.getNextQuestListCached(); }
  // get enabledBy() // TODO

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

  private async getPrevQuestList(prev: number): Promise<QuestSerie> {
    const array: QuestSerie = [];

    while (!!prev && prev > 0) { // when < 0 it's "enabled by"
      array.push({
        id: prev,
        title: await this.mysqlQueryService.getQuestTitleById(prev),
      });

      prev = Number(await this.mysqlQueryService.getPrevQuestById(prev));
    }

    return array.reverse();
  }

  private getPrevQuestListCached(): Promise<QuestSerie> {
    const id = this.questTemplateAddon.PrevQuestID;

    if (!this.prevSerieCache[id]) {
      this.prevSerieCache[id] = this.getPrevQuestList(id);
    }

    return this.prevSerieCache[id];
  }

  private async getNextQuestListUsingNext(next: number): Promise<QuestSerie> {
    const array: QuestSerie = [];

    while (!!next) {
      array.push({
        id: next,
        title: await this.mysqlQueryService.getQuestTitleById(next),
      });

      next = Number(await this.mysqlQueryService.getNextQuestById(next));
    }

    return array;
  }

  private async getNextQuestListUsingPrev(current: number): Promise<QuestSerie> {
    const array: QuestSerie = [];

    while (!!current) {
      const next = Number(await this.mysqlQueryService.getNextQuestById(current, true));

      if (!!next) {
        array.push({
          id: next,
          title: await this.mysqlQueryService.getQuestTitleById(next),
        });
      }

      current = next;
    }

    return array;
  }

  private getNextQuestListCached(): Promise<QuestSerie> {
    const next = this.questTemplateAddon.NextQuestID;

    if (!!next) {
      // if a NextQuestID is specified, we calculate the chain using that

      if (!this.nextSerieCache[next]) {
        this.nextSerieCache[next] = this.getNextQuestListUsingNext(next);
      }

      return this.nextSerieCache[next];
    }

    // otherwise, we calculate the chain using the PrevQuestID of the next
    const id = this.id;
    if (!this.nextSerieUsingPrevCache[id]) {
      this.nextSerieUsingPrevCache[id] = this.getNextQuestListUsingPrev(id);
    }

    return this.nextSerieUsingPrevCache[id];
  }
}
