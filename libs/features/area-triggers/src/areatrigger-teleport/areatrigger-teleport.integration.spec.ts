import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AreatriggerTeleport } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerTeleportComponent } from './areatrigger-teleport.component';

class AreatriggerTeleportPage extends EditorPageObject<AreatriggerTeleportComponent> {}

describe('AreatriggerTeleport integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, AreatriggerTeleportComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        AreaTriggerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (rows: AreatriggerTeleport[]) => {
    const handlerService = TestBed.inject(AreaTriggerHandlerService);
    handlerService['_selected'] = '77';
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const page = new AreatriggerTeleportPage(TestBed.createComponent(AreatriggerTeleportComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, handlerService };
  };

  it('writes the row of a trigger that has none', () => {
    const { page, handlerService } = setup([]);
    expect(page.query('#editor-help')).toBeTruthy();

    page.setInputValueById('f-name', 'x');

    page.expectFullQueryToContain(
      "INSERT INTO `areatrigger_teleport` (`ID`, `Name`, `target_map`, `target_position_x`, `target_position_y`, `target_position_z`, `target_orientation`) VALUES\n(77, 'x', 0, 0, 0, 0, 0);",
    );
    expect(handlerService.isAreatriggerTeleportUnsaved()).toBe(true);
  });

  it('edits the row of a trigger', () => {
    const { page } = setup([Object.assign(new AreatriggerTeleport(), { ID: 77 })]);

    page.setInputValueById('f-name', 'x');

    page.expectDiffQueryToContain("UPDATE `areatrigger_teleport` SET `Name` = 'x' WHERE (`ID` = 77);");
  });
});
