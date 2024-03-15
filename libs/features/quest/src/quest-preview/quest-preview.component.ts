import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { PreviewHelperService } from '@keira/shared/preview';
import { QUEST_FACTION_REWARD } from './quest-preview.model';
import { QuestPreviewService } from './quest-preview.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { IconComponent } from '@keira/shared/base-editor-components';
import { NgClass, NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-quest-preview',
  templateUrl: './quest-preview.component.html',
  styleUrls: ['./quest-preview.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf, NgFor, IconComponent, CollapseModule, AsyncPipe],
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
  get questInfo(): string {
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

  ngOnInit(): void {
    this.service.initializeServices(this.changeDetectorRef);
  }

  getCollapseClass(isCollapsed: boolean): string {
    return isCollapsed ? 'fa-caret-right' : 'fa-caret-down';
  }
}
