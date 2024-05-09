import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Skill, SKILL_ID } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SkillSearchService } from '../../search/skill-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-skill-selector-modal',
  templateUrl: './skill-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class SkillSelectorModalComponent extends SearchSelectorModalComponent<Skill> {
  protected entityIdField = SKILL_ID;
  protected searchService = inject(SkillSearchService);
}
