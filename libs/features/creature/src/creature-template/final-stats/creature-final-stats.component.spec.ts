import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureFinalStatsComponent } from './creature-final-stats.component';

class FinalStatsPage extends PageObject<CreatureFinalStatsComponent> {
  rows(): string[] {
    return Array.from(this.fixture.nativeElement.querySelectorAll('#final-stats-table tbody tr')).map(
      (row) => (row as HTMLElement).textContent ?? '',
    );
  }
}

describe(CreatureFinalStatsComponent.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [CreatureFinalStatsComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });
  afterEach(() => vi.useRealTimers());

  const template = {
    exp: 0,
    unit_class: 1,
    minlevel: 60,
    maxlevel: 63,
    HealthModifier: 2,
    ManaModifier: 1,
    ArmorModifier: 1,
    DamageModifier: 1,
    ExperienceModifier: 3,
    BaseAttackTime: 2000,
    BaseVariance: 1,
  };
  const setup = () => {
    const form = new FormGroup(Object.fromEntries(Object.entries(template).map(([key, value]) => [key, new FormControl(value)])));
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(
      of([
        { level: 60, basehp0: 100, basemana: 0, basearmor: 10, attackpower: 14, damage_base: 1 },
        { level: 63, basehp0: 200, basemana: 0, basearmor: 20, attackpower: 14, damage_base: 2 },
      ]) as never,
    );
    const page = new FinalStatsPage(TestBed.createComponent(CreatureFinalStatsComponent));
    page.fixture.componentRef.setInput('form', form);
    page.fixture.detectChanges();
    const settle = async () => {
      await vi.advanceTimersByTimeAsync(400);
      page.fixture.detectChanges();
    };
    return { page, form, query, settle };
  };

  it('shows the stats at the lowest and highest level, following the modifiers', async () => {
    const { page, form, query, settle } = setup();
    await settle();

    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE `class` = 1 AND `level` IN (60, 63)'));
    expect(page.rows()[0]).toContain('200');
    expect(page.rows()[1]).toContain('400');
    expect(page.query('#final-stats-help').textContent).toContain('CREATURE.TEMPLATE.FINAL_STATS_HELP');

    form.patchValue({ HealthModifier: 3, maxlevel: 60, unit_class: 0 });
    await settle();
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('WHERE `class` = 1 AND `level` IN (60)'));
    expect(page.rows()[0]).toContain('300');
  });

  it('says when its class and levels have no stats, or they cannot be read', async () => {
    const { page, query, settle, form } = setup();
    query.mockReturnValue(of(undefined as never));
    await settle();
    expect(page.query('#final-stats-none')).toBeTruthy();

    query.mockReturnValue(throwError(() => new Error('no table')));
    form.patchValue({ minlevel: 0 });
    await settle();
    expect(page.query('#final-stats-none')).toBeTruthy();
  });

  it('drops the stats read for values changed meanwhile', async () => {
    const { page, query, settle, form } = setup();
    // (the first read never answers: the next one's stats are shown)
    query.mockImplementationOnce(() => ({ subscribe: () => undefined }) as never);
    query.mockImplementation((() => of([{ level: 5, basehp0: 9, basemana: 0, basearmor: 1, attackpower: 0, damage_base: 0 }])) as never);
    await settle();
    form.patchValue({ minlevel: 5, maxlevel: 5 });
    await settle();
    expect(page.rows()[0]).toContain('18');
  });
});
