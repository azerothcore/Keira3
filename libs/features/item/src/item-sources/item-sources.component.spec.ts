import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemSourcesComponent } from './item-sources.component';
import { ItemSources, ItemSourcesService } from './item-sources.service';

class ItemSourcesPage extends PageObject<ItemSourcesComponent> {
  section(id: string, assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByTestId(id, assert);
  }
  text(id: string): string {
    return this.section(id).nativeElement.textContent ?? '';
  }
  async reload(): Promise<void> {
    this.section('reload-sources').nativeElement.click();
    await this.settle();
  }
  async settle(): Promise<void> {
    await this.whenStable();
    await Promise.resolve();
    this.fixture.detectChanges();
  }
}

describe(ItemSourcesComponent.name, () => {
  const sources: ItemSources = {
    loot: [
      {
        lootTable: 'creature_loot_template',
        Entry: 30,
        Chance: 5,
        QuestRequired: 1,
        GroupId: 0,
        MinCount: 1,
        MaxCount: 1,
        usedBy: '30 Defias Rogue Wizard',
      },
      { lootTable: 'fishing_loot_template', Entry: 40, Chance: 1, QuestRequired: 0, GroupId: 1, MinCount: 1, MaxCount: 3, usedBy: null },
    ],
    referenceUsers: [{ lootTable: 'creature_loot_template', Entry: 12201, Reference: 35009 }],
    vendors: [{ entry: 1, name: null, maxcount: 0, ExtendedCost: 0 }],
    quests: [{ ID: 7, LogTitle: null, kind: 'choice' }],
  };
  const none: ItemSources = { loot: [], referenceUsers: [], vendors: [], quests: [] };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ItemSourcesComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = (answer: () => Promise<ItemSources>) => {
    TestBed.inject(ItemHandlerService).select(false, 1907, 'Sword', false);
    const load = vi.spyOn(TestBed.inject(ItemSourcesService), 'load').mockImplementation(answer);
    const page = new ItemSourcesPage(TestBed.createComponent(ItemSourcesComponent));
    page.fixture.detectChanges();
    return { page, load };
  };

  it('shows where the item comes from', async () => {
    const { page, load } = setup(() => Promise.resolve(sources));
    expect(page.section('sources-loading')).toBeTruthy();
    await page.settle();

    expect(load).toHaveBeenCalledWith('1907');
    expect(page.text('sources-loot')).toContain('30 Defias Rogue Wizard');
    expect(page.text('sources-loot')).toContain('1-3');
    expect(page.text('sources-loot')).toContain('✓');
    expect(page.text('sources-references')).toContain('35009');
    expect(page.text('sources-vendors')).toContain('-');
    expect(page.text('sources-quests')).toContain('ITEM.SOURCES.QUEST_CHOICE');
  });

  it('says when there is nothing, and reads again', async () => {
    const { page, load } = setup(() => Promise.resolve(none));
    await page.settle();

    expect(page.section('sources-no-loot')).toBeTruthy();
    expect(page.section('sources-references', false)).toBeFalsy();
    expect(page.section('sources-no-vendors')).toBeTruthy();
    expect(page.section('sources-no-quests')).toBeTruthy();

    await page.reload();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('shows the error when the sources cannot be read', async () => {
    const { page, load } = setup(() => Promise.reject(new Error('no table')));
    await page.settle();
    expect(page.text('sources-error')).toContain('no table');

    load.mockImplementation(() => Promise.reject('down'));
    await page.reload();
    expect(page.text('sources-error')).toContain('down');
  });
});
