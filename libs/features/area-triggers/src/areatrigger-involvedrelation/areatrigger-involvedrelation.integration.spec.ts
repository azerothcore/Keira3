import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AreatriggerInvolvedrelation } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerInvolvedrelationComponent } from './areatrigger-involvedrelation.component';

class AreatriggerInvolvedrelationPage extends EditorPageObject<AreatriggerInvolvedrelationComponent> {}

describe('AreatriggerInvolvedrelation integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, AreatriggerInvolvedrelationComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        AreaTriggerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (rows: AreatriggerInvolvedrelation[]) => {
    const handlerService = TestBed.inject(AreaTriggerHandlerService);
    handlerService['_selected'] = '77';
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const page = new AreatriggerInvolvedrelationPage(TestBed.createComponent(AreatriggerInvolvedrelationComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, handlerService };
  };

  it('writes the row of a trigger that has none', () => {
    const { page, handlerService } = setup([]);
    expect(page.query('#editor-help')).toBeTruthy();

    page.setInputValueById('f-quest', 5);

    page.expectFullQueryToContain('INSERT INTO `areatrigger_involvedrelation` (`id`, `quest`) VALUES\n(77, 5);');
    expect(handlerService.isAreatriggerInvolvedrelationUnsaved()).toBe(true);
  });

  it('edits the row of a trigger', () => {
    const { page } = setup([Object.assign(new AreatriggerInvolvedrelation(), { id: 77 })]);

    page.setInputValueById('f-quest', 5);

    page.expectDiffQueryToContain('UPDATE `areatrigger_involvedrelation` SET `quest` = 5 WHERE (`id` = 77);');
  });
});
