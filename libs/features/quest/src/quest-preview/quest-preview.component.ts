import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from '@keira/shared/base-editor-components';
import { QuestObjectivesComponent } from './quest-objectives.component';
import { FactionRequirement, ItemObjective, NpcOrGoObjective } from './quest-objectives.model';
import { RacesTextKey, RacesTextValue } from '@keira/shared/constants';
import { MapPoint, MapViewerComponent } from '@keira/shared/map-viewer';
import { Model3DViewerComponent, VIEWER_TYPE } from '@keira/shared/model-3d-viewer';
import { PreviewHelperService } from '@keira/shared/preview';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { Quest } from './quest-preview.model';
import { QuestPreviewService } from './quest-preview.service';
import { from, Observable, of } from 'rxjs';

export const QUEST_PREVIEW_DEBOUNCE_TIME = 300;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-preview',
  templateUrl: './quest-preview.component.html',
  imports: [IconComponent, CollapseModule, AsyncPipe, QuestObjectivesComponent, Model3DViewerComponent, MapViewerComponent],
})
export class QuestPreviewComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly service: QuestPreviewService = inject(QuestPreviewService);
  protected readonly helper: PreviewHelperService = inject(PreviewHelperService);

  readonly objectiveToggle = signal(true);
  readonly descriptionToggle = signal(true);
  readonly progressToggle = signal(true);
  readonly completionToggle = signal(true);

  protected readonly startEndMapPoints = signal<MapPoint[]>([]);
  protected readonly objectiveMapPoints = signal<{ index: number; points: MapPoint[] }[]>([]);
  protected readonly itemMapData = signal<
    { index: number; itemId: number; dropperId: number; dropperName: string; isGameobject: boolean; points: MapPoint[] }[]
  >([]);

  protected readonly npcStartToggles: { [key: number]: boolean } = {};
  protected readonly npcEndToggles: { [key: number]: boolean } = {};
  protected readonly gameobjectStartToggles: { [key: number]: boolean } = {};
  protected readonly gameobjectEndToggles: { [key: number]: boolean } = {};
  protected readonly objectiveToggles: { [key: number]: boolean } = {};
  protected readonly itemToggles: { [key: number]: boolean } = {};
  protected readonly NPC_VIEWER_TYPE = VIEWER_TYPE.NPC;
  protected readonly OBJECT_VIEWER_TYPE = VIEWER_TYPE.OBJECT;

  get showMaxLevel(): boolean {
    return !!this.service.maxLevel && this.service.maxLevel !== '0';
  }

  get showRaces(): boolean {
    return !this.service.side && this.service.races && this.service.races.length > 0;
  }
  get showClasses(): boolean {
    return !!this.service.classes && this.service.classes.length > 0;
  }
  get type(): boolean {
    return !!this.questInfo || !!this.service.periodicQuest;
  }
  get questInfo(): string | boolean | undefined {
    const qInfo = this.service.QUEST_INFO.find((q) => q.value === this.service.questTemplate.QuestInfoID);
    return this.service.questTemplate.QuestInfoID > 0 && qInfo?.name;
  }

  get questStartIcon(): string {
    return this.service.periodicQuest ? 'quest_start_daily.gif' : 'quest_start.gif';
  }

  get questEndIcon(): string {
    return this.service.periodicQuest ? 'quest_end_daily.gif' : 'quest_end.gif';
  }

  // RequiredNpcOrGo objectives: positive = NPC (creature), negative = gameobject; 0 = unused.
  get reqNpcOrGoObjectives(): { index: number; id: number; isGameobject: boolean }[] {
    const objectives: { index: number; id: number; isGameobject: boolean }[] = [];
    for (let i = 1; i <= 4; i++) {
      const req = Number(this.service.questTemplate[`RequiredNpcOrGo${i}`]);
      if (req !== 0) {
        objectives.push({ index: i, id: Math.abs(req), isGameobject: req < 0 });
      }
    }
    return objectives;
  }

  get reqSkillPoint() {
    return !!this.service.questTemplateAddon.RequiredSkillPoints && this.service.questTemplateAddon.RequiredSkillPoints > 1
      ? `(${this.service.questTemplateAddon.RequiredSkillPoints})`
      : '';
  }

  get hasIconSkills(): boolean {
    // @ts-ignore // TODO: fix typing and remove @ts-ignore
    return this.service.ICON_SKILLS[this.service.questTemplateAddon.RequiredSkillID];
  }

  ngOnInit(): void {
    this.service.initializeServices(this.changeDetectorRef);

    this.service
      .valueChanges$(QUEST_PREVIEW_DEBOUNCE_TIME)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.invalidateObjectivesCache();
        this.changeDetectorRef.markForCheck();
        void this.loadMapData();
      });

    void this.loadMapData();
  }

  private mapDataRequestId = 0;

  private async loadMapData(): Promise<void> {
    const requestId = ++this.mapDataRequestId;
    const { startEnd, objectives, items } = await this.service.getMapData();
    // Discard results from a superseded load (e.g. quick quest switching) so the latest selection wins.
    if (requestId === this.mapDataRequestId) {
      this.startEndMapPoints.set(startEnd);
      this.objectiveMapPoints.set(objectives);
      this.itemMapData.set(items);
    }
  }

  get hasStartEndModels(): boolean {
    return (
      this.service.creatureQueststarterList.length > 0 ||
      this.service.gameobjectQueststarterList.length > 0 ||
      this.service.creatureQuestenderList.length > 0 ||
      this.service.gameobjectQuestenderList.length > 0
    );
  }

  objectivePointsFor(index: number): MapPoint[] {
    return this.objectiveMapPoints().find((o) => o.index === index)?.points ?? [];
  }

  getRaceText(raceIndex: RacesTextKey): RacesTextValue | null {
    return this.service.RACES_TEXT[raceIndex];
  }

  hasPrevOrNext(questLists: { prev?: Quest[] | null; next?: Quest[] | null }): boolean {
    return !!(questLists.prev && questLists.prev.length > 0) || !!(questLists.next && questLists.next.length > 0);
  }

  private _npcObjectivesData: NpcOrGoObjective[] | null = null;
  private _itemObjectivesData: ItemObjective[] | null = null;
  private _factionRequirementsData: FactionRequirement[] | null = null;

  invalidateObjectivesCache(): void {
    this._npcObjectivesData = null;
    this._itemObjectivesData = null;
    this._factionRequirementsData = null;
  }

  get npcObjectivesData(): NpcOrGoObjective[] {
    if (this._npcObjectivesData) {
      return this._npcObjectivesData;
    }

    const npcObjectives: NpcOrGoObjective[] = [];
    for (let i = 1; i <= 4; i++) {
      if (this.service.isNpcOrGoObj(i)) {
        const text = this.service.getObjText(i);
        const text$: Observable<string | number | undefined> = text ? of(text) : from(this.service.getObjective$(i));
        npcObjectives.push({ text$, count: this.service.getObjectiveCount(i) });
      }
    }

    this._npcObjectivesData = npcObjectives;
    return this._npcObjectivesData;
  }

  get itemObjectivesData(): ItemObjective[] {
    if (this._itemObjectivesData) {
      return this._itemObjectivesData;
    }

    const itemObjectives: ItemObjective[] = [];
    for (let i = 1; i <= 6; i++) {
      const reqItem = this.service.questTemplate['RequiredItemId' + i];
      if (reqItem) {
        itemObjectives.push({
          id: reqItem,
          name$: from(this.service.mysqlQueryService.getItemNameById(reqItem)),
          count: this.service.getObjItemCount(i),
        });
      }
    }

    this._itemObjectivesData = itemObjectives;
    return this._itemObjectivesData;
  }

  get factionRequirementsData(): FactionRequirement[] {
    if (this._factionRequirementsData) {
      return this._factionRequirementsData;
    }

    const factionRequirements: FactionRequirement[] = [];
    for (let i = 1; i <= 2; i++) {
      const reqFaction = this.service.questTemplate['RequiredFactionId' + i];
      if (reqFaction) {
        factionRequirements.push({
          name$: from(this.service.sqliteQueryService.getFactionNameById(reqFaction)),
          value: this.service.getFactionByValue(i),
        });
      }
    }

    this._factionRequirementsData = factionRequirements;
    return this._factionRequirementsData;
  }
}
