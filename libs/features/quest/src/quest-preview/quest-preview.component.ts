import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { IconComponent } from '@keira/shared/base-editor-components';
import {
  FactionRequirement,
  ItemObjective,
  NpcOrGoObjective,
  QuestObjectivesComponent,
} from './quest-objectives.component';
import { RacesTextKey, RacesTextValue } from '@keira/shared/constants';
import { PreviewHelperService } from '@keira/shared/preview';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { Quest, QUEST_FACTION_REWARD } from './quest-preview.model';
import { QuestPreviewService } from './quest-preview.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-quest-preview',
  templateUrl: './quest-preview.component.html',
  styleUrls: ['./quest-preview.component.scss'],
  imports: [IconComponent, CollapseModule, AsyncPipe, QuestObjectivesComponent],
})
export class QuestPreviewComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly service: QuestPreviewService = inject(QuestPreviewService);
  protected readonly helper: PreviewHelperService = inject(PreviewHelperService);

  descriptionToggle = true;
  progressToggle = true;
  completionToggle = true;

  protected readonly QUEST_FACTION_REWARD = QUEST_FACTION_REWARD;

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
  }

  getRaceText(raceIndex: RacesTextKey): RacesTextValue | null {
    return this.service.RACES_TEXT[raceIndex];
  }

  hasPrevOrNext(questLists: { prev?: Quest[] | null; next?: Quest[] | null }): boolean {
    return !!(questLists.prev && questLists.prev.length > 0) || !!(questLists.next && questLists.next.length > 0);
  }

  get npcObjectivesData(): NpcOrGoObjective[] {
    const array: NpcOrGoObjective[] = [];
    for (let i = 1; i <= 4; i++) {
      if (this.service.isNpcOrGoObj(i)) {
        const text = this.service.getObjText(i);
        const text$ = text ? Promise.resolve(text) : this.service.getObjective$(i);
        array.push({ text$, count: this.service.getObjectiveCount(i) });
      }
    }
    return array;
  }

  get itemObjectivesData(): ItemObjective[] {
    const array: ItemObjective[] = [];
    for (let i = 1; i <= 6; i++) {
      const reqItem = this.service.questTemplate['RequiredItemId' + i];
      if (reqItem) {
        array.push({
          id: reqItem,
          name$: this.service.mysqlQueryService.getItemNameById(reqItem),
          count: this.service.getObjItemCount(i),
        });
      }
    }
    return array;
  }

  get factionRequirementsData(): FactionRequirement[] {
    const array: FactionRequirement[] = [];
    for (let i = 1; i <= 2; i++) {
      const reqFaction = this.service.questTemplate['RequiredFactionId' + i];
      if (reqFaction) {
        array.push({
          name$: this.service.sqliteQueryService.getFactionNameById(reqFaction),
          value: this.service.getFactionByValue(i),
        });
      }
    }
    return array;
  }
}
