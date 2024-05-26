import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { IconComponent } from '@keira/shared/base-editor-components';
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
  standalone: true,
  imports: [IconComponent, CollapseModule, AsyncPipe],
})
export class QuestPreviewComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly service: QuestPreviewService = inject(QuestPreviewService);
  readonly helper: PreviewHelperService = inject(PreviewHelperService);

  descriptionToggle = true;
  progressToggle = true;
  completionToggle = true;

  readonly QUEST_FACTION_REWARD = QUEST_FACTION_REWARD;

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

  getRaceText(r: number): string | null {
    const index = r as '-2' | '-1' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
    return this.service.RACES_TEXT[index];
  }

  getQuestFactionReward(repReward: number) {
    // @ts-ignore // TODO: fix typing and remove @ts-ignore
    return this.QUEST_FACTION_REWARD[repReward];
  }

  hasPrevOrNext(questLists: { prev?: Quest[] | null; next?: Quest[] | null }): boolean {
    return !!(questLists.prev && questLists.prev.length > 0) || !!(questLists.next && questLists.next.length > 0);
  }
}
