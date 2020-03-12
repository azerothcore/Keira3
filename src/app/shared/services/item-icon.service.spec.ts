import { TestBed } from '@angular/core/testing';

import { ItemIconService } from './item-icon.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { of } from 'rxjs';

describe('ItemIconService', () => {
  let service: ItemIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemIconService);
  });

  it('addIconLinkToRows() should correctly work', async () => {
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const iconName = 'mock_icon_name';
    spyOn(sqliteQueryService, 'getDisplayIdIcon').and.returnValue(of(iconName).toPromise());
    const rows: Partial<ItemTemplate>[] = [
      { displayid: 123 },
    ];

    await service.addIconLinkToRowsByDisplayId(rows as ItemTemplate[]);

    expect(rows[0].iconLink).toEqual(`https://wow.zamimg.com/images/wow/icons/medium/${iconName}.jpg`);
  });
});
