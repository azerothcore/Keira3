import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getEnumKeys, SaiHandlerService, SaiSearchService, SelectComplexKeyComponent } from '@keira/shared/core';
import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-search-existing',
  templateUrl: './sai-search-existing.component.html',
  styleUrls: ['./sai-search-existing.component.scss'],
})
export class SaiSearchExistingComponent extends SelectComplexKeyComponent<SmartScripts> {
  readonly SAI_SEARCH_TYPES = SAI_TYPES;
  readonly SAI_SEARCH_TYPES_KEYS = getEnumKeys(SAI_TYPES);

  constructor(
    public selectService: SaiSearchService,
    protected handlerService: SaiHandlerService,
  ) {
    super(selectService, handlerService);
  }
}
