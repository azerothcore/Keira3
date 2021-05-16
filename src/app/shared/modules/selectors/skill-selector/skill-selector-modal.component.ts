import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SkillSearchService } from '../../search/skill-search.service';
import { SKILL_ID } from '@keira-types/skill.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  selector: 'keira-skill-selector-modal',
  templateUrl: './skill-selector-modal.component.html',
  styleUrls: ['./skill-selector-modal.component.scss'],
})
export class SkillSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: SkillSearchService) {
    super(SKILL_ID, bsModalRef);
  }
}
