import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComplexKeyComponent } from '@keira-abstract/components/editors/select-complex-key.component';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { SaiSearchService } from '@keira-shared/modules/search/sai-search.service';
import { SAI_TYPES, SAI_TYPES_KEYS, SmartScripts } from '@keira-types/smart-scripts.type';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-sai-search-existing',
  templateUrl: './sai-search-existing.component.html',
  styleUrls: ['./sai-search-existing.component.scss'],
})
export class SaiSearchExistingComponent extends SelectComplexKeyComponent<SmartScripts> {
  readonly SAI_SEARCH_TYPES = SAI_TYPES;
  readonly SAI_SEARCH_TYPES_KEYS = SAI_TYPES_KEYS;

  constructor(public selectService: SaiSearchService, protected handlerService: SaiHandlerService) {
    super(selectService, handlerService);
  }
}
