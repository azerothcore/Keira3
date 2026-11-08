import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { QuestTemplate } from '@keira/shared/acore-world-model';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { of, Subject, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { QUEST_CHECKS_DELAY, QuestChecksComponent } from './quest-checks.component';

class QuestChecksPage extends PageObject<QuestChecksComponent> {
  check(key: string, assert = true): HTMLElement {
    return this.query<HTMLElement>(`#quest-check-${key}`, assert);
  }
  block(assert = true): HTMLElement {
    return this.query<HTMLElement>('#quest-checks', assert);
  }
}

describe(QuestChecksComponent.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [QuestChecksComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  afterEach(() => vi.useRealTimers());

  const setup = (fields: Partial<QuestTemplate>) => {
    const form = new FormGroup(
      Object.fromEntries(Object.entries({ ...new QuestTemplate(), ...fields }).map(([key, value]) => [key, new FormControl(value)])),
    ) as unknown as FormGroup<ModelForm<QuestTemplate>>;
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query');
    const page = new QuestChecksPage(TestBed.createComponent(QuestChecksComponent));
    page.fixture.componentRef.setInput('form', form);
    page.fixture.detectChanges();
    const settle = async () => {
      await vi.advanceTimersByTimeAsync(QUEST_CHECKS_DELAY);
      page.fixture.detectChanges();
    };
    return { page, form, query, settle };
  };

  it('shows nothing for a quest without problems, asking the database nothing', async () => {
    const { page, query, settle } = setup({});
    await settle();

    expect(page.block(false)).toBeFalsy();
    expect(query).not.toHaveBeenCalled();
  });

  it('shows the problems of the fields and the ids that do not exist, following the changes', async () => {
    const { page, form, query, settle } = setup({
      RequiredItemId1: 5,
      RequiredItemCount1: 1,
      RequiredNpcOrGo1: 10,
      RequiredNpcOrGoCount1: 1,
    });
    query.mockImplementation(((sql: string) => (sql.includes('item_template') ? of([{ id: 5 }]) : of([]))) as never);
    await settle();

    expect(query).toHaveBeenCalledWith('SELECT `entry` AS id FROM `item_template` WHERE `entry` IN (5)');
    expect(page.check('MISSING_CREATURE').textContent).toContain('10');
    expect(page.check('MISSING_ITEM', false)).toBeFalsy();

    form.controls.RequiredItemCount1.setValue(0);
    form.controls.RequiredNpcOrGo1.setValue(-20);
    form.controls.RewardNextQuest.setValue(300);
    query.mockReturnValue(of(undefined) as never);
    await settle();

    expect(page.check('REQUIRED_ITEM_NO_COUNT').textContent).toContain('RequiredItemId1');
    expect(page.check('MISSING_GAMEOBJECT').textContent).toContain('20');
    expect(page.check('MISSING_QUEST').textContent).toContain('300');
    expect(page.check('MISSING_CREATURE', false)).toBeFalsy();
  });

  it('says nothing of the ids when the database fails, and keeps only the latest check', async () => {
    const { page, form, query, settle } = setup({ RequiredItemId1: 5 });
    const first = new Subject<never[]>();
    query.mockReturnValueOnce(first as never);
    await settle();

    query.mockReturnValue(throwError(() => new Error('down')));
    form.controls.RequiredItemId1.setValue(6);
    await settle();
    first.next([]);
    first.complete();
    await settle();

    expect(page.check('MISSING_ITEM', false)).toBeFalsy();
    expect(page.check('REQUIRED_ITEM_NO_COUNT')).toBeTruthy();
  });
});
