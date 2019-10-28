import { SearchService } from '../../../services/search/search.service';
import { ComplexKeyHandlerService } from '../../../services/handlers/complex-key.handler.service';
import { TableRow } from '../../../types/general';
import { DTCFG } from '../../../config/datatable.config';
import { WIKI_BASE_URL } from '../../../constants/general';

export class SelectComplexKeyComponent<T extends TableRow> {
  public readonly DTCFG = DTCFG;
  public readonly WIKI_BASE_URL = WIKI_BASE_URL;

  constructor(
    public selectService: SearchService<T>,
    protected handlerService: ComplexKeyHandlerService<T>,
  ) {}

  onSelect(event) {
    this.handlerService.select(false, event.selected[0]);
  }

  onCreateNew() {
    this.handlerService.select(true, this.selectService.fields.getRawValue());
  }
}
