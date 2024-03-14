import { ComplexKeyHandlerService } from '../../service/handlers/complex-key.handler.service';
import { TableRow, WIKI_BASE_URL } from '@keira/shared/constants';
import { DTCFG } from '@keira/shared/config';
import { ChangeDetectorRef, inject } from '@angular/core';
import { SearchService } from '@keira/shared/selectors';

/* istanbul ignore next */ // TODO: fix coverage
export abstract class SelectComplexKeyComponent<T extends TableRow> {
  readonly DTCFG = DTCFG;
  readonly WIKI_BASE_URL = WIKI_BASE_URL;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor(
    public selectService: SearchService<T>,
    protected handlerService: ComplexKeyHandlerService<T>,
  ) {}

  onSelect(event) {
    this.handlerService.select(false, event.selected[0]);
  }

  onCreateNew(): void {
    this.handlerService.select(true, this.selectService.fields.getRawValue() as T);
  }

  onSearch(): void {
    this.selectService.onSearch(this.changeDetectorRef);
  }
}
