import { SearchService } from '../../../modules/search/search.service';
import { ComplexKeyHandlerService } from '../../service/handlers/complex-key.handler.service';
import { TableRow } from '@keira-types/general';
import { DTCFG } from '@keira-config/datatable.config';
import { WIKI_BASE_URL } from '@keira-constants/general';

export abstract class SelectComplexKeyComponent<T extends TableRow> {
  readonly DTCFG = DTCFG;
  readonly WIKI_BASE_URL = WIKI_BASE_URL;

  constructor(public selectService: SearchService<T>, protected handlerService: ComplexKeyHandlerService<T>) {}

  onSelect(event) {
    this.handlerService.select(false, event.selected[0]);
  }

  onCreateNew() {
    this.handlerService.select(true, this.selectService.fields.getRawValue());
  }
}
