import { provideZonelessChangeDetection, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { PoolHandlerService } from './pool-handler.service';

/** The answers of the database to the queries matching each pattern (an Error: the query fails). */
export type Answers = [RegExp, unknown][];

export function configurePoolTest(component: Type<unknown>): void {
  TestBed.configureTestingModule({
    imports: [ToastrModule.forRoot(), ModalDirective, component, TranslateTestingModule],
    providers: [
      provideRouter([]),
      provideZonelessChangeDetection(),
      provideNoopAnimations(),
      { provide: SqliteService, useValue: instance(mock(SqliteService)) },
    ],
  }).compileComponents();
}

/** Creates the editor of pool `id`, with its rows and the database answering `answers`. */
export function setupPoolEditor<C>(component: Type<C>, id: number, rows: TableRow[], answers: Answers = [], isNew = false) {
  const handlerService = TestBed.inject(PoolHandlerService);
  handlerService['_selected'] = `${id}`;
  handlerService.isNew = isNew;
  const queryService = TestBed.inject(MysqlQueryService);
  const querySpy = vi.spyOn(queryService, 'query').mockImplementation(((sql: string) => {
    const answer = answers.find(([pattern]) => pattern.test(sql))?.[1] ?? [];
    return answer instanceof Error ? throwError(() => answer) : of(answer);
  }) as never);
  vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(component);
  const page = new (class extends MultiRowEditorPageObject<C> {})(fixture);
  fixture.autoDetectChanges(true);
  fixture.detectChanges();
  return { page, fixture, querySpy, navigate, navigateByUrl, handlerService };
}

/** The ids of the problems shown. */
export function problemIds(page: MultiRowEditorPageObject<unknown>): string[] {
  return [...page.queryAll<HTMLElement>('[id^="problem-"]')].map((element) => element.id.replace('problem-', ''));
}
