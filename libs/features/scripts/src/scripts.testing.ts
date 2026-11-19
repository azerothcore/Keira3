import { provideZonelessChangeDetection, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { WowClientService, WowDataSettingsService } from '@keira/shared/wow-data';
import { PageObjectModel } from 'ngx-page-object-model';
import { of, throwError } from 'rxjs';

/** Creates a page reading the source folder, with the client and the database answering. */
export function setupSourcePage<C>(
  component: Type<C>,
  client: Partial<Record<keyof WowClientService, unknown>>,
  answers: [RegExp, unknown][] = [],
  opts: { source?: string; links?: boolean } = {},
) {
  localStorage.clear();
  const links = { openCreature: vi.fn(), openGameObject: vi.fn() };
  TestBed.configureTestingModule({
    imports: [component, TranslateTestingModule],
    providers: [
      provideRouter([]),
      provideZonelessChangeDetection(),
      { provide: WowClientService, useValue: client },
      ...(opts.links === false ? [] : [{ provide: WORLD_EDITOR_LINKS, useValue: links }]),
    ],
  });
  TestBed.inject(WowDataSettingsService).save({ clientPath: '', serverDataPath: '', sourcePath: opts.source ?? '/ac' });
  const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockImplementation(((sql: string) => {
    const found = answers.find(([pattern]) => pattern.test(sql));
    const answer = found ? found[1] : [];
    return answer instanceof Error ? throwError(() => answer) : of(answer);
  }) as never);
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  const fixture = TestBed.createComponent(component);
  const page = new (class extends PageObjectModel<C> {})(fixture);
  fixture.autoDetectChanges(true);
  return { fixture, page, querySpy, navigate, links };
}

/** Types into an input or picks an option, firing its event. */
export function setValue(page: PageObjectModel<unknown>, selector: string, value: string): void {
  const element = page.query<HTMLInputElement>(selector);
  element.value = value;
  element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input'));
  page.fixture.detectChanges();
}

export function click(page: PageObjectModel<unknown>, selector: string): void {
  page.query<HTMLElement>(selector).click();
  page.fixture.detectChanges();
}

/** Lets the promises resolve and the page update. */
export async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  fixture.detectChanges();
  await fixture.whenStable();
}
