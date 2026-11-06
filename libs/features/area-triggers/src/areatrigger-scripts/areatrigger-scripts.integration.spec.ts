import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AreatriggerScripts } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerScriptsComponent } from './areatrigger-scripts.component';

class AreatriggerScriptsPage extends EditorPageObject<AreatriggerScriptsComponent> {}

describe('AreatriggerScripts integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, AreatriggerScriptsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        AreaTriggerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (rows: AreatriggerScripts[]) => {
    const handlerService = TestBed.inject(AreaTriggerHandlerService);
    handlerService['_selected'] = '77';
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const page = new AreatriggerScriptsPage(TestBed.createComponent(AreatriggerScriptsComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, handlerService };
  };

  it('writes the row of a trigger that has none', () => {
    const { page, handlerService } = setup([]);
    expect(page.query('#editor-help')).toBeTruthy();

    page.setInputValueById('f-script-name', 'x');

    page.expectFullQueryToContain("INSERT INTO `areatrigger_scripts` (`entry`, `ScriptName`) VALUES\n(77, 'x');");
    expect(handlerService.isAreatriggerScriptsUnsaved()).toBe(true);
  });

  it('edits the row of a trigger', () => {
    const { page } = setup([Object.assign(new AreatriggerScripts(), { entry: 77 })]);

    page.setInputValueById('f-script-name', 'x');

    page.expectDiffQueryToContain("UPDATE `areatrigger_scripts` SET `ScriptName` = 'x' WHERE (`entry` = 77);");
  });
});
