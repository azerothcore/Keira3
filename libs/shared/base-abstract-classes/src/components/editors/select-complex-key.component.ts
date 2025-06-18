import { ComplexKeyHandlerService } from '../../service/handlers/complex-key.handler.service';
import { DataTablePageEvent, TableRow, WIKI_BASE_URL } from '@keira/shared/constants';
import { DTCFG } from '@keira/shared/config';
import { ChangeDetectorRef, inject } from '@angular/core';
import { SearchService } from '../../service/select/search.service';

/* istanbul ignore next */ // TODO: fix coverage
export abstract class SelectComplexKeyComponent<T extends TableRow> {
  readonly DTCFG = DTCFG;
  readonly WIKI_BASE_URL = WIKI_BASE_URL;

  public abstract readonly selectService: SearchService<T>;
  protected abstract readonly handlerService: ComplexKeyHandlerService<T>;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  onSelect(event: { selected: Array<Partial<T>> }) {
    this.handlerService.select(false, event.selected[0]);
  }

  onCreateNew(): void {
    this.handlerService.select(true, this.selectService.fields.getRawValue() as T);
  }

  onSearch(): void {
    this.selectService.onSearch(this.changeDetectorRef);
  }

  onPage(event: DataTablePageEvent): void {
    this.selectService.pageOffset = event.offset;
  }
}
