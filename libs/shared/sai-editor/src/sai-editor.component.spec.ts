import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { vi } from 'vitest';
import { ToastrModule } from 'ngx-toastr';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiHandlerService } from './sai-handler.service';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

describe('SaiEditorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  // source_type 1 is a gameobject script; 0 would be a creature one.
  function setup(conditionRows: { SourceGroup: number; conditionCount: number }[] = [], sourceType = 1) {
    const selected = { source_type: sourceType, entryorguid: 100 };
    const handler = TestBed.inject(SaiHandlerService);
    handler['_selected'] = JSON.stringify(selected);

    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    const countsSpy = vi.spyOn(mysqlQueryService, 'getSmartEventConditionCounts').mockResolvedValue(conditionRows);

    const fixture = TestBed.createComponent(SaiEditorComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture, handler, countsSpy };
  }

  it('getName() should correctly work', () => {
    const { component } = setup();
    const value = 'testValue';
    const def = 'defaultValue';

    expect(component.getName(def, value)).toEqual(value);
    expect(component.getName(def, undefined)).toEqual(def);
  });

  describe('condition markers', () => {
    it('should load the counts for the selected script', async () => {
      const { fixture, countsSpy } = setup();
      await fixture.whenStable();

      expect(countsSpy).toHaveBeenCalledWith(100, 1);
    });

    it('should shift SourceGroup back onto the smart_scripts id', async () => {
      // conditions.SourceGroup 4 belongs to smart_scripts.id 3.
      const { component, fixture } = setup([{ SourceGroup: 4, conditionCount: 2 }]);
      await fixture.whenStable();

      expect(component.conditionCountFor({ id: 3 } as never)).toBe(2);
      expect(component.conditionCountFor({ id: 4 } as never)).toBe(0);
    });

    it('should report zero when the script has no conditions', async () => {
      const { component, fixture } = setup();
      await fixture.whenStable();

      expect(component.conditionCountFor({ id: 0 } as never)).toBe(0);
    });

    it('should keep working when the conditions lookup fails', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { component, fixture } = setup();
      vi.spyOn(TestBed.inject(MysqlQueryService), 'getSmartEventConditionCounts').mockRejectedValue(new Error('no such table'));

      await component['loadConditionCounts']();
      await fixture.whenStable();

      expect(component.conditionCountFor({ id: 0 } as never)).toBe(0);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should open the Conditions search with the shifted group and not select the row', async () => {
      const { component, fixture } = setup([{ SourceGroup: 4, conditionCount: 2 }]);
      await fixture.whenStable();

      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      const event = new MouseEvent('click');
      const stopSpy = vi.spyOn(event, 'stopPropagation');

      component.openConditions({ id: 3 } as never, event);

      expect(navigateSpy).toHaveBeenCalledWith(['conditions/select'], {
        queryParams: { sourceType: 22, sourceEntry: 100, sourceGroup: 4, sourceId: 1 },
      });
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should open the Conditions editor in create mode for the selected event', async () => {
      const { component, fixture } = setup();
      await fixture.whenStable();

      component['editorService']['_selectedRowId'] = 3;
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      component.createConditionForSelectedRow();

      // Same key as the badge, plus the flag that skips the search and opens the new-condition form.
      expect(navigateSpy).toHaveBeenCalledWith(['conditions/select'], {
        queryParams: { sourceType: 22, sourceEntry: 100, sourceGroup: 4, sourceId: 1, create: true },
      });
    });

    it('should still carry source_type 0 rather than dropping it as falsy', async () => {
      const { component, fixture } = setup([], 0);
      await fixture.whenStable();

      component['editorService']['_selectedRowId'] = 3;
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      component.createConditionForSelectedRow();

      expect(navigateSpy).toHaveBeenCalledWith(['conditions/select'], {
        queryParams: { sourceType: 22, sourceEntry: 100, sourceGroup: 4, sourceId: 0, create: true },
      });
    });
  });
});
