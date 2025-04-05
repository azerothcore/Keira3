import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComplexKeyComponent } from '@keira/shared/base-abstract-classes';
import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { SaiSearchService } from '@keira/shared/selectors';
import { getEnumKeys } from '@keira/shared/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-search-existing',
  templateUrl: './sai-search-existing.component.html',
  styleUrls: ['./sai-search-existing.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, HighlightjsWrapperComponent, NgxDatatableModule],
})
export class SaiSearchExistingComponent extends SelectComplexKeyComponent<SmartScripts> {
  readonly SAI_SEARCH_TYPES = SAI_TYPES;
  readonly SAI_SEARCH_TYPES_KEYS = getEnumKeys(SAI_TYPES);

  readonly selectService = inject(SaiSearchService);
  protected override readonly handlerService = inject(SaiHandlerService);
}
