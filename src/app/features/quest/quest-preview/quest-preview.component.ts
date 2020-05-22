import { Component, OnInit } from '@angular/core';
import { QuestPreviewService } from './quest-preview.service';
import { PreviewHelperService } from '@keira-shared/services/preview-helper.service';

@Component({
  selector: 'keira-quest-preview',
  templateUrl: './quest-preview.component.html',
  styleUrls: ['./quest-preview.component.scss']
})
export class QuestPreviewComponent implements OnInit {

  constructor(
    public readonly service: QuestPreviewService,
    public readonly helper: PreviewHelperService,
  ) { }

  descriptionToggle = true;
  progressToggle = true;
  completionToggle = true;

  get showMaxLevel(): boolean { return !!this.service.maxLevel && this.service.maxLevel !== '0'; }
  get showRaces(): boolean { return !this.service.side && this.service.races && this.service.races.length > 0; }
  get showClasses(): boolean { return !!this.service.classes && this.service.classes.length > 0; }
  get type(): boolean { return !!this.questInfo || !!this.service.periodicQuest; }
  get questInfo(): string {
    return this.service.questTemplate.QuestInfoID > 0 && !!this.service.QUEST_INFO[this.service.questTemplate.QuestInfoID]
      ? this.service.QUEST_INFO[this.service.questTemplate.QuestInfoID]
      : null;
  }

  get questStartIcon(): string {
    return this.service.periodicQuest
    /* istanbul ignore next */ // TODO: test this properly using page object
    ? 'quest_start_daily.gif'
    : 'quest_start.gif';
  }
  get questEndIcon(): string {
    return this.service.periodicQuest
    /* istanbul ignore next */ // TODO: test this properly using page object
    ? 'quest_end_daily.gif'
    : 'quest_end.gif';
  }

  get reqSkillPoint() {
    return !!this.service.questTemplateAddon.RequiredSkillPoints && this.service.questTemplateAddon.RequiredSkillPoints > 1
    ? `(${this.service.questTemplateAddon.RequiredSkillPoints})`
    : '';
  }

  ngOnInit() {
    this.service.initializeServices();
  }

  getCollapseClass(isCollapsed: boolean): string {
    return isCollapsed ? 'fa-caret-right' : 'fa-caret-down';
  }
}
