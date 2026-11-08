import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { PageObject } from '@keira/shared/test-utils';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { instance, mock } from 'ts-mockito';
import { FactionNameComponent } from './faction-name.component';

class FactionNamePage extends PageObject<FactionNameComponent> {
  name(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByTestId('faction-name', assert);
  }
}

describe(FactionNameComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FactionNameComponent],
      providers: [provideZonelessChangeDetection(), { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    });
  });

  const setup = (value: number, template?: boolean) => {
    vi.useFakeTimers();
    const sqlite = TestBed.inject(SqliteQueryService);
    const byTemplate = vi
      .spyOn(sqlite, 'getFactionNameById')
      .mockImplementation((id) => Promise.resolve(id === 11 ? 'Stormwind' : (undefined as unknown as string)));
    const byFaction = vi.spyOn(sqlite, 'getFactionNameByNameId').mockImplementation((id) => Promise.resolve(id === 72 ? 'Stormwind' : ''));
    const control = new FormControl<number>(value, { nonNullable: true });
    const page = new FactionNamePage(TestBed.createComponent(FactionNameComponent));
    page.fixture.componentRef.setInput('control', control);
    if (template !== undefined) {
      page.fixture.componentRef.setInput('template', template);
    }
    const show = async () => {
      await vi.advanceTimersByTimeAsync(200);
      page.fixture.detectChanges();
    };
    page.fixture.detectChanges();
    return { page, control, show, byTemplate, byFaction };
  };

  afterEach(() => vi.useRealTimers());

  it('shows the name of a faction (Faction.dbc)', async () => {
    const { page, show, byTemplate } = setup(72);
    await show();

    expect(page.name().nativeElement.textContent).toContain('Stormwind');
    expect(byTemplate).not.toHaveBeenCalled();
  });

  it('shows the name of a faction template (FactionTemplate.dbc), following the field', async () => {
    const { page, control, show, byFaction } = setup(11, true);
    await show();
    expect(page.name().nativeElement.textContent).toContain('Stormwind');

    control.setValue(0);
    await show();
    expect(page.name(false)).toBeFalsy();

    control.setValue(999);
    await show();
    expect(page.name(false)).toBeFalsy();
    expect(byFaction).not.toHaveBeenCalled();
  });

  it('drops a name found for a value the field no longer has', async () => {
    const { page, control, show, byFaction } = setup(72);
    let answer!: (name: string) => void;
    byFaction.mockImplementation(() => new Promise((resolve) => (answer = resolve)));
    await vi.advanceTimersByTimeAsync(200);

    control.setValue(5, { emitEvent: false });
    answer('Stormwind');
    await show();

    expect(page.name(false)).toBeFalsy();
  });
});
