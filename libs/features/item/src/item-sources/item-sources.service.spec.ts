import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { ItemSourcesService } from './item-sources.service';

describe(ItemSourcesService.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = (answers: Record<string, unknown[] | undefined>) => {
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockImplementation((sql: string) => {
      const answer = Object.entries(answers).find(([key]) => sql.includes(key));
      return of((answer ? answer[1] : []) as never);
    });
    return { service: TestBed.inject(ItemSourcesService), query };
  };

  it('reads the loot, the references using the item, the vendors and the quests', async () => {
    const loot = [
      { lootTable: 'creature_loot_template', Entry: 30, usedBy: '30 Defias Rogue Wizard' },
      { lootTable: 'reference_loot_template', Entry: 35009, usedBy: null },
      { lootTable: 'reference_loot_template', Entry: 35009, usedBy: null },
    ];
    const { service, query } = setup({
      'WHERE `l`.`Item` = 1907': loot,
      'WHERE `Reference` IN (35009)': [{ lootTable: 'creature_loot_template', Entry: 12201, Reference: 35009 }],
      '`npc_vendor`': [{ entry: 1, name: 'Vendor', maxcount: 0, ExtendedCost: 0 }],
      '`quest_template`': undefined,
    });

    const sources = await service.load('1907');

    expect(sources.loot).toEqual(loot);
    expect(sources.referenceUsers).toEqual([{ lootTable: 'creature_loot_template', Entry: 12201, Reference: 35009 }]);
    expect(sources.vendors.length).toBe(1);
    expect(sources.quests).toEqual([]);
    const sql = query.mock.calls.map(([text]) => text).join('\n');
    expect(sql).toContain('`u`.`lootid` = `l`.`Entry`');
    expect(sql).toContain('`u`.`type` IN (3, 25) AND `u`.`Data1` = `l`.`Entry`');
    expect(sql).toContain("'choice' AS `kind` FROM `quest_template` WHERE 1907 IN (`RewardChoiceItemID1`");
    expect(sql).toContain('WHERE 1907 IN (`StartItem`)');
  });

  it('says when the list of what drops the loot was cut', async () => {
    const long = Array.from({ length: 200 }, (_, i) => `${i} Creature`)
      .join(', ')
      .slice(0, 1024);
    const { service } = setup({ 'WHERE `l`.`Item` = 2': [{ lootTable: 'creature_loot_template', Entry: 1, usedBy: long }] });

    const [row] = (await service.load(2)).loot;

    expect(row.usedBy?.endsWith(', …')).toBe(true);
    expect(row.usedBy?.length).toBeLessThan(1024);
  });

  it('does not look for users of references when no reference has the item', async () => {
    const { service, query } = setup({});

    await service.load(5);

    expect(query.mock.calls.some(([text]) => text.includes('`Reference` IN'))).toBe(false);
  });
});
