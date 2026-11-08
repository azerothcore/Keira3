import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionSqlService } from '@keira/shared/common-services';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { of, Subject, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { QuestChainLinksComponent } from './quest-chain-links.component';

class LinksPage extends PageObject<QuestChainLinksComponent> {
  input(field: string): HTMLInputElement {
    return this.query<HTMLInputElement>(`#link-${field}`);
  }
  button(name: string): HTMLButtonElement {
    return this.query<HTMLButtonElement>(`#quest-chain-links-${name}`);
  }
  sql(assert = true): string {
    return this.query<HTMLElement>('#quest-chain-links-query', assert)?.textContent ?? '';
  }
  errorText(): string {
    return this.query<HTMLElement>('#quest-chain-links-error').textContent ?? '';
  }
  async type(field: string, value: string): Promise<void> {
    this.input(field).value = value;
    this.input(field).dispatchEvent(new Event('input'));
    await this.settle();
  }
  async click(name: string): Promise<void> {
    this.button(name).click();
    await this.settle();
  }
  async settle(): Promise<void> {
    await this.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    this.fixture.detectChanges();
  }
}

describe(QuestChainLinksComponent.name, () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [QuestChainLinksComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = async (row?: object) => {
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of(row ? [row] : []) as never);
    const page = new LinksPage(TestBed.createComponent(QuestChainLinksComponent));
    const changed = vi.fn();
    page.fixture.componentInstance.changed.subscribe(changed);
    page.fixture.componentRef.setInput('questId', 5);
    page.fixture.componentRef.setInput('title', 'A quest');
    page.fixture.detectChanges();
    await page.settle();
    return { page, query, changed };
  };

  it("reads the quest's links, writes the changed ones and draws the chain again", async () => {
    const { page, query, changed } = await setup({ PrevQuestID: 4, NextQuestID: 0, ExclusiveGroup: 0, BreadcrumbForQuestId: 0 });

    expect(query).toHaveBeenCalledWith(
      'SELECT `PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `BreadcrumbForQuestId` FROM `quest_template_addon` WHERE `ID` = 5',
    );
    expect(page.input('PrevQuestID').value).toBe('4');
    expect(page.sql(false)).toBe('');
    expect(page.button('execute').disabled).toBe(true);

    await page.type('NextQuestID', '6');
    expect(page.sql()).toContain('(`ID`, `NextQuestID`) VALUES (5, 6)');

    await page.click('execute');
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO `quest_template_addon`'));
    expect(changed).toHaveBeenCalled();
    expect(page.sql(false)).toBe('');
  });

  it('keeps the SQL in the session, or undoes the changes', async () => {
    const { page } = await setup();
    const session = TestBed.inject(SessionSqlService);
    session.clear();

    await page.type('ExclusiveGroup', '');
    expect(page.sql(false)).toBe('');
    await page.type('ExclusiveGroup', '9');
    await page.click('session');
    expect(session.entries()[0].label).toBe('quest_template_addon 5');

    await page.click('reset');
    expect(page.input('ExclusiveGroup').value).toBe('0');
    session.clear();
  });

  it('shows the errors of the database', async () => {
    const { page, query } = await setup();
    query.mockReturnValue(throwError(() => ({ sqlMessage: 'Duplicate' })) as never);
    await page.type('PrevQuestID', '3');
    await page.click('execute');
    expect(page.errorText()).toContain('Duplicate');

    query.mockReturnValue(throwError(() => new Error('down')) as never);
    page.fixture.componentRef.setInput('questId', 6);
    page.fixture.componentInstance.ngOnChanges();
    await page.settle();
    expect(page.errorText()).toContain('down');

    query.mockReturnValue(of(undefined) as never);
    page.fixture.componentInstance.ngOnChanges();
    await page.settle();
    expect(page.input('PrevQuestID').value).toBe('0');

    query.mockReturnValue(throwError(() => 'gone') as never);
    page.fixture.componentInstance.ngOnChanges();
    await page.settle();
    expect(page.errorText()).toContain('gone');
  });

  it('drops the links read for a quest no longer edited', async () => {
    const { page, query } = await setup();
    const answer = new Subject<object[]>();
    query.mockReturnValueOnce(answer as never);
    page.fixture.componentInstance.ngOnChanges();
    page.fixture.componentRef.setInput('questId', 8);
    query.mockReturnValue(of([]) as never);
    page.fixture.componentInstance.ngOnChanges();
    answer.next([{ PrevQuestID: 77 }]);
    answer.complete();
    await page.settle();

    expect(page.input('PrevQuestID').value).toBe('0');
  });
});
