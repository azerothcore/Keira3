import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectComplexKeyComponent } from '@keira/shared/base-abstract-classes';
import { CONDITION_SOURCE_TYPES, Conditions } from '@keira/shared/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionsSearchService } from '@keira/shared/selectors';
import { getEnumKeys } from '@keira/shared/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TranslateDirective, TranslatePipe, HighlightjsWrapperComponent, NgxDatatableModule],
})
export class SelectConditionsComponent extends SelectComplexKeyComponent<Conditions> implements OnInit {
  readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  readonly CONDITION_SOURCE_TYPES_KEYS = getEnumKeys(CONDITION_SOURCE_TYPES);

  public readonly selectService = inject(ConditionsSearchService);
  protected override readonly handlerService = inject(ConditionsHandlerService);
  private readonly activatedRoute = inject(ActivatedRoute);

  /** Lets other screens deep-link here, e.g. the quest chain linking to a quest's availability conditions. */
  ngOnInit(): void {
    const { sourceType, sourceEntry, sourceGroup, sourceId, create } = this.activatedRoute.snapshot.queryParams;

    if (sourceType === undefined && sourceEntry === undefined && sourceGroup === undefined && sourceId === undefined) {
      return;
    }

    // The search form is an app-lifetime singleton, so a previous link's keys are still in it and
    // patching alone would keep filtering on keys this caller never asked about.
    this.selectService.fields.reset();
    this.selectService.fields.patchValue({
      ...(sourceType !== undefined && { SourceTypeOrReferenceId: Number(sourceType) }),
      ...(sourceEntry !== undefined && { SourceEntry: Number(sourceEntry) }),
      ...(sourceGroup !== undefined && { SourceGroup: Number(sourceGroup) }),
      ...(sourceId !== undefined && { SourceId: Number(sourceId) }),
    });

    // The caller already knows which key it wants, so skip the search and open the new-condition form.
    if (String(create) === 'true') {
      this.onCreateNew();
      return;
    }

    this.onSearch();
  }
}
