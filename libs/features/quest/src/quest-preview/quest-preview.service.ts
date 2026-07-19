import { ChangeDetectorRef, Service, inject } from '@angular/core';
import {
  CREATURE_QUESTENDER_TABLE,
  CREATURE_QUESTSTARTER_TABLE,
  CreatureQuestender,
  CreatureQueststarter,
  GAMEOBJECT_QUESTENDER_TABLE,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GameobjectQuestender,
  GameobjectQueststarter,
  QUEST_FLAG_SHARABLE,
  QUEST_INFO,
  QuestOfferReward,
  QuestRequestItems,
  QuestTemplate,
  QuestTemplateAddon,
} from '@keira/shared/acore-world-model';
import { EditorService } from '@keira/shared/base-abstract-classes';
import {
  CLASSES_TEXT,
  ICON_SKILLS,
  QUEST_FLAG_DAILY,
  QUEST_FLAG_REPEATABLE,
  QUEST_FLAG_SPECIAL_MONTHLY,
  QUEST_FLAG_SPECIAL_REPEATABLE,
  QUEST_FLAG_WEEKLY,
  QUEST_PERIOD,
  QuestReputationReward,
  RACES_TEXT,
  RacesTextKey,
  TableRow,
} from '@keira/shared/constants';
import { MysqlQueryService, SqliteQueryService } from '@keira/shared/db-layer';
import { MapPoint } from '@keira/shared/map-viewer';
import { PreviewHelperService } from '@keira/shared/preview';
import { CreatureQuestenderService } from '../creature-questender/creature-questender.service';
import { CreatureQueststarterService } from '../creature-queststarter/creature-queststarter.service';
import { GameobjectQuestenderService } from '../gameobject-questender/gameobject-questender.service';
import { GameobjectQueststarterService } from '../gameobject-queststarter/gameobject-queststarter.service';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestOfferRewardService } from '../quest-offer-reward/quest-offer-reward.service';
import { QuestRequestItemsService } from '../quest-request-items/quest-request-items.service';
import { QuestTemplateAddonService } from '../quest-template-addon/quest-template-addon.service';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { DifficultyLevel, Quest, QUEST_FACTION_REWARD, QuestFactionRewardKey } from './quest-preview.model';
import { compareObjFn, UNDEFINED_PROMISE } from '@keira/shared/utils';
import { combineLatest, debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';

@Service()
export class QuestPreviewService {
  private readonly helperService = inject(PreviewHelperService);
  readonly mysqlQueryService = inject(MysqlQueryService);
  readonly sqliteQueryService = inject(SqliteQueryService);
  private readonly questHandlerService = inject(QuestHandlerService);
  readonly questTemplateService = inject(QuestTemplateService);
  private readonly questRequestItemsService = inject(QuestRequestItemsService);
  private readonly questTemplateAddonService = inject(QuestTemplateAddonService);
  private readonly questOfferRewardService = inject(QuestOfferRewardService);
  private readonly gameobjectQueststarterService = inject(GameobjectQueststarterService);
  private readonly gameobjectQuestenderService = inject(GameobjectQuestenderService);
  private readonly creatureQueststarterService = inject(CreatureQueststarterService);
  private readonly creatureQuestenderService = inject(CreatureQuestenderService);

  showPreview = true;

  private prevSerieCache: Promise<Quest[]>[] = [];
  private nextSerieCache: Promise<Quest[]>[] = [];
  private nextSerieUsingPrevCache: Promise<Quest[]>[] = [];

  readonly RACES_TEXT = RACES_TEXT;
  readonly CLASSES_TEXT = CLASSES_TEXT;
  readonly QUEST_INFO = QUEST_INFO;
  readonly ICON_SKILLS = ICON_SKILLS;

  // get form value
  get questTemplate(): QuestTemplate {
    return this.questTemplateService.form.getRawValue();
  }
  get questTemplateAddon(): QuestTemplateAddon {
    return this.questTemplateAddonService.form.getRawValue();
  }
  get questOfferReward(): QuestOfferReward {
    return this.questOfferRewardService.form.getRawValue();
  }
  get questRequestItems(): QuestRequestItems {
    return this.questRequestItemsService.form.getRawValue();
  }
  get creatureQueststarterList(): CreatureQueststarter[] {
    return this.creatureQueststarterService.newRows;
  }
  get creatureQuestenderList(): CreatureQuestender[] {
    return this.creatureQuestenderService.newRows;
  }
  get gameobjectQueststarterList(): GameobjectQueststarter[] {
    return this.gameobjectQueststarterService.newRows;
  }
  get gameobjectQuestenderList(): GameobjectQuestender[] {
    return this.gameobjectQuestenderService.newRows;
  }

  // get QuestTemplate values
  get id(): number {
    return this.questTemplate.ID;
  }
  get title(): string {
    return this.questTemplate.LogTitle;
  }
  get level(): string {
    return String(this.questTemplate.QuestLevel);
  }
  get minLevel(): string {
    return String(this.questTemplate.MinLevel);
  }
  get side(): string {
    return this.helperService.getFactionFromRace(this.questTemplate.AllowableRaces) as string;
  }
  get races(): RacesTextKey[] {
    return this.helperService.getRaceString(this.questTemplate.AllowableRaces) as RacesTextKey[];
  }
  get sharable(): string {
    return this.questTemplate.Flags & QUEST_FLAG_SHARABLE ? 'Sharable' : 'Not sharable';
  }
  get startItem(): number {
    return this.questTemplate.StartItem;
  }
  get startItemName$(): Promise<string> {
    return this.mysqlQueryService.getItemNameById(this.startItem);
  }
  get objectiveText(): string {
    return this.questTemplate.LogDescription?.replace(/\$B/g, '\n') ?? '';
  }
  get descriptionText(): string {
    return this.questTemplate.QuestDescription?.replace(/\$B/g, '\n') ?? '';
  }
  get completionText(): string {
    return this.questRequestItems.CompletionText?.replace(/\$B/g, '\n') ?? '';
  }
  get rewardText(): string {
    return this.questOfferReward.RewardText?.replace(/\$B/g, '\n') ?? '';
  }

  get rewardMoney(): number {
    return this.questTemplate.RewardMoney;
  }

  // get QuestTemplateAddon values
  get maxLevel(): string {
    return String(this.questTemplateAddon.MaxLevel);
  }
  get classes(): number[] {
    return this.helperService.getRequiredClass(this.questTemplateAddon.AllowableClasses) as number[];
  }

  // Item Quest Starter
  get questGivenByItem$(): Promise<string> {
    return this.mysqlQueryService.getItemByStartQuest(this.questTemplate.ID);
  }
  get questStarterItem$(): Promise<string> {
    return this.mysqlQueryService.getItemNameByStartQuest(this.questTemplate.ID);
  }

  // Quest Serie & relations
  get prevQuestList$(): Promise<Quest[]> {
    return this.getPrevQuestListCached();
  }
  get nextQuestList$(): Promise<Quest[]> {
    return this.getNextQuestListCached();
  }
  get enabledByQuestId(): number {
    return this.getEnabledByQuestId();
  }
  get enabledByQuestTitle$(): Promise<string> {
    return this.getEnabledByQuestName();
  }

  get difficultyLevels(): DifficultyLevel {
    return this.getDifficultyLevels() as DifficultyLevel;
  }

  initializeServices(changeDetectorRef: ChangeDetectorRef) {
    this.initService(changeDetectorRef, this.questTemplateService);
    this.initService(changeDetectorRef, this.questRequestItemsService);
    this.initService(changeDetectorRef, this.questOfferRewardService);
    this.initService(changeDetectorRef, this.questTemplateAddonService);
    this.initService(changeDetectorRef, this.gameobjectQueststarterService);
    this.initService(changeDetectorRef, this.gameobjectQuestenderService);
    this.initService(changeDetectorRef, this.creatureQueststarterService);
    this.initService(changeDetectorRef, this.creatureQuestenderService);
  }

  valueChanges$(delay: number): Observable<void> {
    /* istanbul ignore next */ // TODO: fix coverage
    return combineLatest([
      this.questTemplateService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.questRequestItemsService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.questOfferRewardService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.questTemplateAddonService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.gameobjectQueststarterService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.gameobjectQuestenderService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.creatureQueststarterService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
      this.creatureQuestenderService.form.valueChanges.pipe(debounceTime(delay), distinctUntilChanged(compareObjFn)),
    ]).pipe(map(() => {}));
  }

  private initService<T extends TableRow>(changeDetectorRef: ChangeDetectorRef, service: EditorService<T>) {
    if (!!this.questHandlerService.selected && service.loadedEntityId !== this.questHandlerService.selected) {
      service.reload(changeDetectorRef, this.questHandlerService.selected);
    }
  }

  private getDifficultyLevels(): DifficultyLevel | null {
    if (this.questTemplate.QuestLevel > 0) {
      const levels: DifficultyLevel = {};

      // red
      if (this.questTemplate.MinLevel && this.questTemplate.MinLevel < this.questTemplate.QuestLevel - 4) {
        levels.red = this.questTemplate.MinLevel;
      }

      // orange
      if (!this.questTemplate.MinLevel || this.questTemplate.MinLevel < this.questTemplate.QuestLevel - 2) {
        levels.orange =
          Object.keys(levels).length === 0 && this.questTemplate.MinLevel > this.questTemplate.QuestLevel - 4
            ? this.questTemplate.MinLevel
            : this.questTemplate.QuestLevel - 4;
      }

      // yellow
      levels.yellow =
        Object.keys(levels).length === 0 && this.questTemplate.MinLevel > this.questTemplate.QuestLevel - 2
          ? this.questTemplate.MinLevel
          : this.questTemplate.QuestLevel - 2;

      // green
      levels.green = this.questTemplate.QuestLevel + 3;

      // grey (is about +/-1 level off)
      levels.grey = this.questTemplate.QuestLevel + 3 + Math.ceil((12 * this.questTemplate.QuestLevel) / 80);

      return levels;
    }

    return null;
  }

  get periodicQuest(): string {
    return this.getPeriodicQuest() as string;
  }

  private getPeriodicQuest(): QUEST_PERIOD | null {
    const flags = this.questTemplate.Flags;
    const specialFlags = this.questTemplateAddon.SpecialFlags;

    if (flags & QUEST_FLAG_DAILY) {
      return QUEST_PERIOD.DAILY;
    }

    if (flags & QUEST_FLAG_WEEKLY) {
      return QUEST_PERIOD.WEEKLY;
    }

    if (specialFlags & QUEST_FLAG_SPECIAL_MONTHLY) {
      return QUEST_PERIOD.MONTHLY;
    }

    return null;
  }

  private async getPrevQuestList(prev: number): Promise<Quest[]> {
    const array: Quest[] = [];

    while (!!prev && prev > 0) {
      // when < 0 it's "enabled by"
      array.push({
        id: prev,
        title: await this.mysqlQueryService.getQuestTitleById(prev),
      });

      prev = Number(await this.mysqlQueryService.getPrevQuestById(prev));
    }

    return array.reverse();
  }

  private getPrevQuestListCached(): Promise<Quest[]> {
    const id = this.questTemplateAddon.PrevQuestID;

    if (!this.prevSerieCache[id]) {
      this.prevSerieCache[id] = this.getPrevQuestList(id);
    }

    return this.prevSerieCache[id];
  }

  private async getNextQuestListUsingNext(next: number): Promise<Quest[]> {
    const array: Quest[] = [];

    while (!!next) {
      array.push({
        id: next,
        title: await this.mysqlQueryService.getQuestTitleById(next),
      });

      next = Number(await this.mysqlQueryService.getNextQuestById(next));
    }

    return array;
  }

  private async getNextQuestListUsingPrev(current: number): Promise<Quest[]> {
    const array: Quest[] = [];

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

  private getNextQuestListCached(): Promise<Quest[]> {
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

  private getEnabledByQuestId(): number {
    return this.questTemplateAddon.PrevQuestID < 0 ? -this.questTemplateAddon.PrevQuestID : 0;
  }

  private getEnabledByQuestName(): Promise<string> {
    return this.mysqlQueryService.getQuestTitleById(this.getEnabledByQuestId());
  }

  public isUnavailable(): boolean {
    const UNAVAILABLE = 0x04000;
    return (this.questTemplate.Flags & UNAVAILABLE) === UNAVAILABLE;
  }

  public isRepeatable(): boolean {
    return !!(this.questTemplate.Flags & QUEST_FLAG_REPEATABLE || this.questTemplateAddon.SpecialFlags & QUEST_FLAG_SPECIAL_REPEATABLE);
  }

  get requiredSkill$(): Promise<string> {
    return this.sqliteQueryService.getSkillNameById(Number(this.questTemplateAddon.RequiredSkillID));
  }

  get rewardXP$(): Promise<string> {
    return this.sqliteQueryService.getRewardXP(this.questTemplate.RewardXPDifficulty, this.questTemplate.QuestLevel);
  }

  getRepReward$(field: number | string): Promise<QuestReputationReward[]> {
    return this.mysqlQueryService.getReputationRewardByFaction(this.questTemplate[`RewardFactionID${field}`]);
  }

  getRewardReputation(field: string | number, reputationReward: QuestReputationReward[] | null): number | null {
    const rewardFactionOverride = this.questTemplate[`RewardFactionOverride${field}`];
    if (!!rewardFactionOverride) {
      return Number(rewardFactionOverride) / 100;
    }

    const faction = this.questTemplate[`RewardFactionID${field}`];
    const value = this.questTemplate[`RewardFactionValue${field}`];

    if (!faction || !value) {
      return null;
    }

    let rep = Number(value);

    if (!!reputationReward && !!reputationReward[0]) {
      const dailyType = this.getPeriodicQuest();

      if (!!dailyType) {
        if (dailyType === QUEST_PERIOD.DAILY && reputationReward[0].quest_daily_rate !== 1) {
          rep *= reputationReward[0].quest_daily_rate - 1;
          return QUEST_FACTION_REWARD[rep as QuestFactionRewardKey];
        }

        if (dailyType === QUEST_PERIOD.WEEKLY && reputationReward[0].quest_weekly_rate !== 1) {
          rep *= reputationReward[0].quest_weekly_rate - 1;
          return QUEST_FACTION_REWARD[rep as QuestFactionRewardKey];
        }

        if (dailyType === QUEST_PERIOD.MONTHLY && reputationReward[0].quest_monthly_rate !== 1) {
          rep *= reputationReward[0].quest_monthly_rate - 1;
          return QUEST_FACTION_REWARD[rep as QuestFactionRewardKey];
        }
      }

      if (this.isRepeatable() && reputationReward[0].quest_repeatable_rate !== 1) {
        rep *= reputationReward[0].quest_repeatable_rate - 1;
        return QUEST_FACTION_REWARD[rep as QuestFactionRewardKey];
      }

      if (reputationReward[0].quest_rate !== 1) {
        rep *= reputationReward[0].quest_rate - 1;
        return QUEST_FACTION_REWARD[rep as QuestFactionRewardKey];
      }
    }

    return QUEST_FACTION_REWARD[rep as QuestFactionRewardKey];
  }

  getObjText(field: string | number) {
    return this.questTemplate[`ObjectiveText${field}`];
  }

  getObjective$(field: string | number): Promise<string | undefined> {
    const RequiredNpcOrGo = Number(this.questTemplate[`RequiredNpcOrGo${field}`]);
    if (!!RequiredNpcOrGo) {
      if (RequiredNpcOrGo > 0) {
        return this.mysqlQueryService.getCreatureNameById(RequiredNpcOrGo);
      }

      return this.mysqlQueryService.getGameObjectNameById(Math.abs(RequiredNpcOrGo));
    }
    return UNDEFINED_PROMISE;
  }

  getObjectiveCount(field: string | number): string {
    const reqNpcOrGo = this.questTemplate[`RequiredNpcOrGoCount${field}`];
    return !!reqNpcOrGo && +reqNpcOrGo > 1 ? `(${reqNpcOrGo})` : '';
  }

  isNpcOrGoObj(field: string | number): boolean {
    return !!this.questTemplate[`RequiredNpcOrGoCount${field}`];
    // return !!this.questTemplate[`ObjectiveText${field}`] || !!this.questTemplate[`RequiredNpcOrGo${field}`];
  }

  getObjItemCount(field: string | number) {
    const reqItemCount = this.questTemplate[`RequiredItemCount${field}`];
    return !!reqItemCount && +reqItemCount > 1 ? `(${reqItemCount})` : '';
  }

  getFactionByValue(field: string | number) {
    switch (Number(this.questTemplate[`RequiredFactionValue${field}`])) {
      case 900:
      case 2100:
        return '(Neutral)';
      case 3000:
        return '(Friendly)';
      case 9000:
        return '(Honored)';
      case 21000:
        return '(Revered)';
      case 42000:
        return '(Exalted)';
      default:
        return '';
    }
  }

  isFieldAvailable(field: string, fieldAmount: string, idx: string | number): boolean {
    return !!this.questTemplate[`${field}${idx}`] && +this.questTemplate[`${fieldAmount}${idx}`] > 0;
  }

  isRewardReputation(): boolean {
    return (
      this.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 1) ||
      this.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 2) ||
      this.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 3) ||
      this.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 4) ||
      this.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 5)
    );
  }

  isGains(): boolean {
    return !!this.questTemplate.RewardXPDifficulty || !!this.questTemplate.RewardTalents || this.isRewardReputation();
  }

  isRewardItems(): boolean {
    return (
      this.isFieldAvailable('RewardItem', 'RewardAmount', 1) ||
      this.isFieldAvailable('RewardItem', 'RewardAmount', 2) ||
      this.isFieldAvailable('RewardItem', 'RewardAmount', 3) ||
      this.isFieldAvailable('RewardItem', 'RewardAmount', 4)
    );
  }

  isRewardChoiceItems(): boolean {
    return (
      this.isFieldAvailable('RewardChoiceItemID', 'RewardChoiceItemQuantity', 1) ||
      this.isFieldAvailable('RewardChoiceItemID', 'RewardChoiceItemQuantity', 2) ||
      this.isFieldAvailable('RewardChoiceItemID', 'RewardChoiceItemQuantity', 3) ||
      this.isFieldAvailable('RewardChoiceItemID', 'RewardChoiceItemQuantity', 4)
    );
  }

  isRewardMoney(): boolean {
    return this.rewardMoney > 0;
  }

  isReward(): boolean {
    return this.isRewardItems() || this.isRewardChoiceItems() || !!this.rewardSpell() || this.isRewardMoney();
  }

  rewardSpell(): number | null {
    if (!!this.questTemplate.RewardDisplaySpell) {
      return this.questTemplate.RewardDisplaySpell;
    }

    if (!!this.questTemplate.RewardSpell) {
      return this.questTemplate.RewardSpell;
    }

    return null;
  }

  async getMapData(): Promise<{
    startEnd: MapPoint[];
    objectives: { index: number; points: MapPoint[] }[];
    items: { index: number; itemId: number; dropperId: number; dropperName: string; isGameobject: boolean; points: MapPoint[] }[];
  }> {
    const startEnd: MapPoint[] = [];
    const objectives: { index: number; points: MapPoint[] }[] = [];
    const items: { index: number; itemId: number; dropperId: number; dropperName: string; isGameobject: boolean; points: MapPoint[] }[] =
      [];
    const questId = this.id;

    if (!questId) {
      return { startEnd, objectives, items };
    }

    // Read starters/enders straight from the DB by quest id rather than the editor services' newRows:
    // those reload asynchronously and independently, so a snapshot taken here can still hold the
    // previously selected quest's rows. Querying by the freshly loaded quest id is always current.
    // Each source is isolated so a single failing/absent table can't blank the rest of the map.
    // The four queries are independent, so run them concurrently; each writes to its own array so the
    // final order stays deterministic (all starters before enders) for the start-left/end-right pin offset.
    const creatureStart: MapPoint[] = [];
    const creatureEnd: MapPoint[] = [];
    const gameobjectStart: MapPoint[] = [];
    const gameobjectEnd: MapPoint[] = [];
    await Promise.all([
      this.safelyAdd(async () =>
        this.addCreaturePoints(
          creatureStart,
          await this.mysqlQueryService.getQuestRelationEntries(CREATURE_QUESTSTARTER_TABLE, questId),
          'quest/quest_start.gif',
        ),
      ),
      this.safelyAdd(async () =>
        this.addCreaturePoints(
          creatureEnd,
          await this.mysqlQueryService.getQuestRelationEntries(CREATURE_QUESTENDER_TABLE, questId),
          'quest/quest_end.gif',
        ),
      ),
      this.safelyAdd(async () =>
        this.addGameobjectPoints(
          gameobjectStart,
          await this.mysqlQueryService.getQuestRelationEntries(GAMEOBJECT_QUESTSTARTER_TABLE, questId),
          'quest/quest_start.gif',
        ),
      ),
      this.safelyAdd(async () =>
        this.addGameobjectPoints(
          gameobjectEnd,
          await this.mysqlQueryService.getQuestRelationEntries(GAMEOBJECT_QUESTENDER_TABLE, questId),
          'quest/quest_end.gif',
        ),
      ),
    ]);
    startEnd.push(...creatureStart, ...creatureEnd, ...gameobjectStart, ...gameobjectEnd);

    // One map per objective so each Req.NpcOrGo can sit next to its own 3D model.
    for (let i = 1; i <= 4; i++) {
      const points: MapPoint[] = [];
      await this.safelyAdd(() => this.addObjectivePoint(points, i));
      if (points.length) {
        objectives.push({ index: i, points });
      }
    }

    // For each required item, locate the first creature/gameobject that drops it and map all its spawns.
    for (let i = 1; i <= 6; i++) {
      const itemId = Number(this.questTemplate[`RequiredItemId${i}`]);
      if (!itemId) continue;

      await this.safelyAdd(async () => {
        const drop = await this.getRequiredItemDrop(itemId);
        if (drop) {
          items.push({ index: i, itemId, ...drop });
        }
      });
    }

    return { startEnd, objectives, items };
  }

  private async getRequiredItemDrop(
    itemId: number,
  ): Promise<{ dropperId: number; dropperName: string; isGameobject: boolean; points: MapPoint[] } | null> {
    const creatures = await this.mysqlQueryService.getCreaturesDroppingItem(itemId);
    const gameobjects = await this.mysqlQueryService.getGameObjectsDroppingItem(itemId);

    // Only show the dropper when it is unambiguous: exactly one creature/gameobject drops the item.
    if (creatures.length + gameobjects.length !== 1) {
      return null;
    }

    if (creatures.length === 1) {
      const entry = creatures[0].entry;
      const name = await this.mysqlQueryService.getCreatureNameById(entry);
      const spawns = await this.mysqlQueryService.getCreatureSpawnsByEntry(entry);
      return { dropperId: entry, dropperName: name, isGameobject: false, points: this.spawnsToPoints(spawns, name) };
    }

    const entry = gameobjects[0].entry;
    const name = await this.mysqlQueryService.getGameObjectNameById(entry);
    const spawns = await this.mysqlQueryService.getGameObjectSpawnsByEntry(entry);
    return { dropperId: entry, dropperName: name, isGameobject: true, points: this.spawnsToPoints(spawns, name) };
  }

  private spawnsToPoints(spawns: { mapId: number; x: number; y: number; orientation: number }[], name: string): MapPoint[] {
    return spawns.map((spawn) => ({
      mapId: spawn.mapId,
      x: spawn.x,
      y: spawn.y,
      orientation: spawn.orientation,
      name,
      icon: 'map/pin-yellow.png',
    }));
  }

  private async safelyAdd(load: () => Promise<void>): Promise<void> {
    try {
      await load();
    } catch (err: unknown) {
      console.warn('[QuestPreview] failed to load some map data:', err);
    }
  }

  private async addCreaturePoints(points: MapPoint[], list: { id: number }[], icon: string): Promise<void> {
    for (const entry of list) {
      const pos = await this.mysqlQueryService.getCreaturePositionByEntry(entry.id);
      if (pos?.length) {
        const name = await this.mysqlQueryService.getCreatureNameById(entry.id);
        points.push({
          mapId: pos[0].mapId,
          x: pos[0].x,
          y: pos[0].y,
          orientation: pos[0].orientation,
          name,
          icon,
        });
      }
    }
  }

  private async addGameobjectPoints(points: MapPoint[], list: { id: number }[], icon: string): Promise<void> {
    for (const entry of list) {
      const pos = await this.mysqlQueryService.getGameObjectPositionByEntry(entry.id);
      if (pos?.length) {
        const name = await this.mysqlQueryService.getGameObjectNameById(entry.id);
        points.push({
          mapId: pos[0].mapId,
          x: pos[0].x,
          y: pos[0].y,
          orientation: pos[0].orientation,
          name,
          icon,
        });
      }
    }
  }

  private async addObjectivePoint(points: MapPoint[], index: number): Promise<void> {
    const requiredNpcOrGo = Number(this.questTemplate[`RequiredNpcOrGo${index}`]);
    if (!requiredNpcOrGo) return;

    const objText = String(this.questTemplate[`ObjectiveText${index}`] ?? '');

    if (requiredNpcOrGo > 0) {
      const spawns = await this.mysqlQueryService.getCreatureSpawnsByEntry(requiredNpcOrGo);
      if (!spawns.length) return;
      const name = await this.mysqlQueryService.getCreatureNameById(requiredNpcOrGo);
      points.push(...this.spawnsToPoints(spawns, objText || name));
    } else {
      const goId = Math.abs(requiredNpcOrGo);
      const spawns = await this.mysqlQueryService.getGameObjectSpawnsByEntry(goId);
      if (!spawns.length) return;
      const name = await this.mysqlQueryService.getGameObjectNameById(goId);
      points.push(...this.spawnsToPoints(spawns, objText || name));
    }
  }
}
