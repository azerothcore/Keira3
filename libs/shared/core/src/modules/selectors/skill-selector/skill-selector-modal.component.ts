import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SkillSearchService } from '../../search/skill-search.service';
import { Skill, SKILL_ID } from '@keira/shared/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '../../highlightjs-wrapper/highlightjs-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-skill-selector-modal',
  templateUrl: './skill-selector-modal.component.html',
  styleUrls: ['./skill-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgIf, NgxDatatableModule, TranslateModule],
})
export class SkillSelectorModalComponent extends SearchSelectorModalComponent<Skill> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: SkillSearchService,
  ) {
    super(SKILL_ID, bsModalRef, searchService);
  }
}
