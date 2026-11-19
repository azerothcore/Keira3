import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MailLootCopyComponent } from './mail-loot-copy.component';
import { MailLootHandlerService } from './mail-loot-handler.service';

class Page extends PageObject<MailLootCopyComponent> {
  copiedTables(): string[] {
    return Array.from(this.fixture.nativeElement.querySelectorAll('keira-copy-output tbody tr .fw-semibold')).map((cell) =>
      ((cell as HTMLElement).firstChild?.textContent ?? '').trim(),
    );
  }
}

describe(MailLootCopyComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MailLootCopyComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
      ],
    });
  });

  const setup = async (copying: boolean) => {
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'getRowsCount').mockReturnValue(of(1));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of([]));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    if (copying) {
      TestBed.inject(MailLootHandlerService).select(true, 2, undefined, false, '1');
    }
    const page = new Page(TestBed.createComponent(MailLootCopyComponent));
    page.fixture.detectChanges();
    await page.whenStable();
    page.fixture.detectChanges();
    return { page, navigate };
  };

  it('lists the tables copying the chosen entry', async () => {
    const { page, navigate } = await setup(true);

    expect(page.copiedTables().length).toBeGreaterThan(0);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('goes back to the search when no entry was chosen', async () => {
    const { page, navigate } = await setup(false);

    expect(page.copiedTables()).toEqual([]);
    expect(navigate).toHaveBeenCalledWith(['other-loots/select-mail']);
  });
});
