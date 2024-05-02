import { TestBed, waitForAsync } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorBroadcastObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { BroadcastText } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { BroadcastTextComponent } from './broadcast-text.component';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

describe('BroadcastText integration tests', () => {
  class Broadcast extends EditorBroadcastObject<BroadcastTextComponent> {}

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `broadcast_text` (`ID`, `Text`, `NextBroadcastID`, `VerifiedBuild`) VALUES\n' +
    "(1234, '', 0, 0);";

  const originalEntity = new BroadcastText();
  originalEntity.ID = id;
  originalEntity.Text = '2';
  originalEntity.NextBroadcastID = 3;
  originalEntity.VerifiedBuild = 4;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), BroadcastTextComponent, TranslateTestingModule],
      providers: [{ provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(BroadcastTextHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(BroadcastTextComponent);
    const component = fixture.componentInstance;
    const broadcast = new Broadcast(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, fixture, component, broadcast };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { broadcast } = setup(true);
      broadcast.expectQuerySwitchToBeHidden();
      broadcast.expectFullQueryToBeShown();
      broadcast.expectFullQueryToContain(expectedFullCreateQuery);
      broadcast.removeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { broadcast, handlerService } = setup(true);
      const field = 'NextBroadcastID';
      expect(handlerService.isUnsaved).toBe(false);
      broadcast.setInputValueById(field, 3);
      expect(handlerService.isUnsaved).toBe(true);
      broadcast.setInputValueById(field, 0);
      expect(handlerService.isUnsaved).toBe(false);
      broadcast.removeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { broadcast, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `broadcast_text` (`ID`, `Text`, `NextBroadcastID`, `VerifiedBuild`) VALUES\n' +
        "(1234, 'Shin', 0, 0);";
      querySpy.calls.reset();

      broadcast.setInputValueById('Text', 'Shin');
      broadcast.expectFullQueryToContain(expectedQuery);

      broadcast.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      broadcast.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { broadcast } = setup(false);
      broadcast.expectDiffQueryToBeShown();
      broadcast.expectDiffQueryToBeEmpty();
      broadcast.expectFullQueryToContain(
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `broadcast_text` (`ID`, `Text`, `NextBroadcastID`, `VerifiedBuild`) VALUES\n' +
          "(1234, '2', 3, 4);",
      );
      broadcast.removeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { broadcast, querySpy } = setup(false);
      const expectedQuery = "UPDATE `broadcast_text` SET `Text` = '0', `NextBroadcastID` = 1 WHERE (`ID` = 1234);";
      querySpy.calls.reset();

      broadcast.changeAllFields(originalEntity, ['VerifiedBuild']);
      broadcast.expectDiffQueryToContain(expectedQuery);

      broadcast.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      broadcast.removeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { broadcast } = setup(false);
      broadcast.setInputValueById('Text', 'Shin');
      broadcast.expectDiffQueryToContain("UPDATE `broadcast_text` SET `Text` = 'Shin' WHERE (`ID` = 1234);");
      broadcast.expectFullQueryToContain(
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `broadcast_text` (`ID`, `Text`, `NextBroadcastID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'Shin', 3, 4);",
      );

      broadcast.setInputValueById('NextBroadcastID', '22');
      broadcast.expectDiffQueryToContain("UPDATE `broadcast_text` SET `Text` = 'Shin', `NextBroadcastID` = 22 WHERE (`ID` = 1234);");
      broadcast.expectFullQueryToContain(
        'DELETE FROM `broadcast_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `broadcast_text` (`ID`, `Text`, `NextBroadcastID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'Shin', 22, 4);",
      );
      broadcast.removeElement();
    });
  });
});
