import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BroadcastText } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BroadcastTextBrowserComponent } from './broadcast-text-browser.component';
import { BroadcastTextRow } from './broadcast-text-browser.model';

describe(`${BroadcastTextBrowserComponent.name} integration tests`, () => {
  @Component({
    template: `<keira-broadcast-text-browser [targetRowSelected]="targetRowSelected()" (copyToRow)="copied = $event" />`,
    imports: [BroadcastTextBrowserComponent],
  })
  class TestHostComponent {
    readonly targetRowSelected = signal(false);
    copied: BroadcastTextRow | undefined;
  }

  class Page extends PageObject<TestHostComponent> {
    get searchInput(): HTMLInputElement {
      return this.getInputById('broadcast-text-search');
    }
    get limitInput(): HTMLInputElement {
      return this.getInputById('broadcast-text-limit');
    }
    get searchBtn(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('#broadcast-text-search-btn');
    }
    get copyBtn(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('#copy-to-creature-text-btn');
    }
    getActiveRowsCount(): number {
      return this.query<HTMLElement>('#broadcast-text-table').querySelectorAll('.datatable-body-row.active').length;
    }
    getRowsCount(): number {
      return this.query<HTMLElement>('#broadcast-text-table').querySelectorAll('datatable-row-wrapper').length;
    }
    /** Indexes of the rows carrying the "this is what you searched for" marker. */
    getMatchedRowIndexes(): number[] {
      const markers = Array.from(this.query<HTMLElement>('#broadcast-text-table').querySelectorAll('.fa-crosshairs'));
      return markers.flatMap((marker, index) => (this.isHidden(marker as HTMLElement) ? [] : [index]));
    }
  }

  const broadcastText = (ID: number, MaleText = `text ${ID}`, FemaleText = '', LanguageID = 0): BroadcastText =>
    ({ ...new BroadcastText(), ID, MaleText, FemaleText, LanguageID }) as BroadcastText;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { fixture, host, page, querySpy };
  }

  it('should search both texts at once and list the results as a single text column', () => {
    const { page, querySpy } = setup();
    querySpy.mockReturnValue(of([broadcastText(10), broadcastText(11, '', 'she says hi')]));

    page.setInputValue(page.searchInput, 'hi');
    page.clickElement(page.searchBtn);

    expect(querySpy).toHaveBeenCalledWith(
      "SELECT * FROM `broadcast_text` WHERE (`MaleText` LIKE '%hi%' OR `FemaleText` LIKE '%hi%') LIMIT 50",
    );
    expect(page.getRowsCount()).toBe(2);
    expect(page.getDatatableRow(1).innerText).toContain('she says hi');
    expect(page.getMatchedRowIndexes()).toEqual([]);
  });

  it('should show the SQL it is about to run', () => {
    const { page } = setup();

    page.setInputValue(page.searchInput, 'hi');
    page.setInputValue(page.limitInput, '10');

    expect(page.queryWrapper.innerText).toContain(
      "SELECT * FROM `broadcast_text` WHERE (`MaleText` LIKE '%hi%' OR `FemaleText` LIKE '%hi%') LIMIT 10",
    );
  });

  it('should pull in the adjacent rows when the search hits a single one', () => {
    const { page, querySpy } = setup();
    querySpy
      .mockReturnValueOnce(of([broadcastText(25)]))
      .mockReturnValueOnce(of([broadcastText(24), broadcastText(25), broadcastText(26)]));

    page.clickElement(page.searchBtn);

    expect(querySpy).toHaveBeenLastCalledWith('SELECT * FROM `broadcast_text` WHERE (`ID` BETWEEN 20 AND 30) ORDER BY ID ASC');
    expect(page.getRowsCount()).toBe(3);
    // Only the row the search actually hit is flagged; its neighbours are just context.
    expect(page.getMatchedRowIndexes()).toEqual([1]);
  });

  describe('the copy button', () => {
    it('should stay disabled until a row is picked on both sides', () => {
      const { host, page, querySpy } = setup();
      querySpy.mockReturnValue(of([broadcastText(10), broadcastText(11)]));
      expect(page.copyBtn.disabled).toBe(true);

      page.clickElement(page.searchBtn);
      page.clickRowOfDatatable(0);
      expect(page.copyBtn.disabled).toBe(true);

      host.targetRowSelected.set(true);
      page.detectChanges();

      expect(page.copyBtn.disabled).toBe(false);
    });

    it('should emit the picked row', () => {
      const { host, page, querySpy } = setup();
      querySpy.mockReturnValue(of([broadcastText(10), broadcastText(11, '', 'she says hi', 7)]));
      host.targetRowSelected.set(true);

      page.clickElement(page.searchBtn);
      page.clickRowOfDatatable(1);
      page.clickElement(page.copyBtn);

      expect(host.copied).toEqual(expect.objectContaining({ ID: 11, LanguageID: 7, Text: 'she says hi' }));
    });

    // The browser service outlives the component, so a selection made before leaving the tab is still
    // live when the user comes back. It must stay visible, or the button would act on an unseen row.
    it('should still show the row it would copy after the component is re-created', () => {
      const { fixture, page, querySpy } = setup();
      querySpy.mockReturnValue(of([broadcastText(10), broadcastText(11)]));
      page.clickElement(page.searchBtn);
      page.clickRowOfDatatable(1);
      expect(page.getActiveRowsCount()).toBe(1);
      fixture.destroy();

      const { host: newHost, page: newPage } = setup();
      newHost.targetRowSelected.set(true);
      newPage.detectChanges();

      expect(newPage.copyBtn.disabled).toBe(false);
      expect(newPage.getActiveRowsCount()).toBe(1);
    });
  });
});
