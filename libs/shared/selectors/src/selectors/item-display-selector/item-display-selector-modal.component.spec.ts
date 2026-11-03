import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService, MysqlService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { ItemDisplaySearchService } from '../../search/item-display-search.service';
import { ItemDisplaySelectorModalComponent } from './item-display-selector-modal.component';

class ItemDisplaySelectorPage extends PageObject<ItemDisplaySelectorModalComponent> {
  get sqlText(): string {
    return this.getDebugElementByCss('keira-highlightjs-wrapper').nativeElement.textContent ?? '';
  }
  rowsText(): string[] {
    return Array.from(this.fixture.nativeElement.querySelectorAll('datatable-body-row')).map(
      (row) => (row as HTMLElement).textContent ?? '',
    );
  }
}

describe(ItemDisplaySelectorModalComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ItemDisplaySelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = async () => {
    vi.spyOn(TestBed.inject(SqliteQueryService), 'getIconByItemDisplayId').mockReturnValue(of('inv_sword_04'));
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(
      of([
        { displayid: 7, items: 3, name: 'Sword', InventoryType: 13 },
        { displayid: 8, items: 1, name: 'Odd', InventoryType: 99 },
      ]) as never,
    );
    const page = new ItemDisplaySelectorPage(TestBed.createComponent(ItemDisplaySelectorModalComponent));
    page.fixture.detectChanges();
    await page.whenStable();
    return { page, query };
  };

  it('lists the displays the items use, one row each, with their slot', async () => {
    const { page, query } = await setup();
    expect(page.sqlText).toContain('GROUP BY displayid');
    expect(TestBed.inject(ItemDisplaySearchService)).toBeTruthy();

    const slot = page.query<HTMLSelectElement>('#InventoryType');
    slot.selectedIndex = Array.from(slot.options).findIndex((option) => option.textContent?.trim() === '13 - WEAPON');
    slot.dispatchEvent(new Event('change'));
    page.clickElement(page.query<HTMLButtonElement>('#search-btn'));
    await page.whenStable();
    page.fixture.detectChanges();

    expect(query.mock.calls.at(-1)?.[0]).toContain('`InventoryType` LIKE');
    const rows = page.rowsText();
    expect(rows[0]).toContain('7');
    expect(rows[0]).toContain('Sword');
    expect(rows[0]).toContain('WEAPON');
    expect(rows[1]).toContain('99');
  });
});
