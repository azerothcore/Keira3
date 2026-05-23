import { vi } from 'vitest';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { ModalModule } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { Model3DViewerComponent } from './model-3d-viewer.component';
import { CONTENT_WOTLK, Gender, InventoryType, MODEL_TYPE, Race, VIEWER_TYPE } from './model-3d-viewer.model';

describe('Model3DViewerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ReactiveFormsModule, GenericOptionSelectorComponent, Model3DViewerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  const mockDisplayId = 1;

  function setup(
    { displayId, viewerType, itemClass, itemInventoryType } = {
      displayId: 2,
      viewerType: VIEWER_TYPE.ITEM,
      itemClass: 10,
      itemInventoryType: InventoryType.HEAD,
    },
  ) {
    const fixture = TestBed.createComponent(Model3DViewerComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('displayId', displayId);
    fixture.componentRef.setInput('viewerType', viewerType);
    fixture.componentRef.setInput('itemClass', itemClass);
    fixture.componentRef.setInput('itemInventoryType', itemInventoryType);

    const queryService = TestBed.inject(MysqlQueryService);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const setupViewer3DSpy = vi.spyOn<any>(component, 'setupViewer3D').mockImplementation(() => {});

    setupViewer3DSpy.mockClear();

    return { fixture, component, queryService, httpTestingController };
  }

  it('ngOnInit', () => {
    const { component } = setup();
    vi.spyOn<any>(component, 'resetModel3dElement').mockImplementation(() => undefined);
    vi.spyOn<any>(component, 'viewerDynamic').mockImplementation(() => undefined);

    component.ngOnInit();

    expect(component['resetModel3dElement']).toHaveBeenCalledTimes(1);
    expect(component['viewerDynamic']).toHaveBeenCalledTimes(1);
    expect(component['setupViewer3D']).toHaveBeenCalledTimes(1);
  });

  describe('ngOnChanges', () => {
    it('does not run due to missing jQuery', () => {
      const { component, fixture } = setup();
      (component as any).windowRef.jQuery = undefined;
      fixture.componentRef.setInput('displayId', 2);
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.NPC);

      const resetModel3dElementSpy = vi.spyOn<any>(component, 'resetModel3dElement').mockImplementation(() => undefined);
      const show3DmodelSpy = vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => undefined);

      component.ngOnChanges({ displayId: { currentValue: 1, previousValue: 0 } as any });

      expect(resetModel3dElementSpy).toHaveBeenCalledTimes(0);
      expect(show3DmodelSpy).toHaveBeenCalledTimes(0);
    });

    it('should call show3Dmodel if jQuery is present and displayId changed', (done) => {
      const { component, fixture } = setup();
      (component as any).windowRef.jQuery = () => {};
      fixture.componentRef.setInput('displayId', 2);
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.NPC);

      vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => {
        expect(true).toBe(true);
        done();
      });
      component.ngOnChanges({ displayId: { currentValue: 2, previousValue: 1 } as any });
    });
  });

  it('ngOnDestroy', () => {
    const { component } = setup();
    const unsubscribeSpy = vi.spyOn<any>(component['subscriptions'], 'unsubscribe').mockImplementation(() => undefined);
    vi.spyOn<any>(component, 'resetModel3dElement').mockImplementation(() => undefined);

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    expect(component['resetModel3dElement']).toHaveBeenCalledTimes(1);
  });

  describe('viewerDynamic', () => {
    it('should call show3Dmodel when loadedViewer$ emits true', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('itemInventoryType', 1);
      fixture.componentRef.setInput('itemClass', 2);
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.ITEM);
      vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => undefined);
      component['loadedViewer$'].next(true);

      component['viewerDynamic']();

      // Emit again to trigger subscription
      component['loadedViewer$'].next(true);
      expect(component['show3Dmodel']).toHaveBeenCalled();
    });
  });

  describe('show3Dmodel', () => {
    it('generate3Dmodel for non-item', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.NPC);
      vi.spyOn<any>(component, 'generate3Dmodel').mockImplementation(() => undefined);

      component['show3Dmodel']();

      expect(component['generate3Dmodel']).toHaveBeenCalledTimes(1);
    });

    it('handles the item 3D model', (done) => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.ITEM);
      const subscriptionAddSpy = vi.spyOn<any>(component['subscriptions'], 'add').mockImplementation(() => undefined);
      const mockItemData$ = of([{ entry: 123 }]);
      vi.spyOn<any>(component, 'getItemData$').mockReturnValue(mockItemData$);
      vi.spyOn<any>(component, 'verifyModelAndLoad').mockImplementation(() => undefined);

      component['show3Dmodel']();

      mockItemData$.subscribe(() => {
        expect(subscriptionAddSpy).toHaveBeenCalledTimes(1);
        expect(component['verifyModelAndLoad']).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('getContentPathUrl', () => {
    it('returns armor URL', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('displayId', mockDisplayId);

      expect(component['getContentPathUrl'](3)).toBe(`${CONTENT_WOTLK}meta/armor/3/${mockDisplayId}.json`);
      expect(component['getContentPathUrl'](4)).toBe(`${CONTENT_WOTLK}meta/armor/4/${mockDisplayId}.json`);
    });

    it('returns item URL', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('displayId', mockDisplayId);

      expect(component['getContentPathUrl'](1)).toBe(`${CONTENT_WOTLK}meta/item/${mockDisplayId}.json`);
    });
  });

  describe('getModelType', () => {
    it('uses default params', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('itemInventoryType', 15);
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.ITEM);

      expect(component['getModelType']()).toBe(MODEL_TYPE.WEAPON);
    });

    it('uses custom params', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('itemInventoryType', 1);
      fixture.componentRef.setInput('itemClass', 2);
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.ITEM);

      expect(component['getModelType'](InventoryType.HEAD)).toBe(MODEL_TYPE.HELMET);
      expect(component['getModelType'](InventoryType.SHOULDERS)).toBe(MODEL_TYPE.SHOULDER);
    });

    it('returns object', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.OBJECT);
      expect(component['getModelType']()).toBe(MODEL_TYPE.OBJECT);
    });

    it('returns NPC', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.NPC);
      expect(component['getModelType']()).toBe(MODEL_TYPE.NPC);
    });

    it('returns CHARACTER', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.ITEM);
      expect(component['getModelType'](InventoryType.FEET)).toBe(MODEL_TYPE.CHARACTER);
    });

    it('returns -1', () => {
      const { component, fixture } = setup();
      fixture.componentRef.setInput('viewerType', VIEWER_TYPE.ITEM);
      expect(component['getModelType'](InventoryType.NECK)).toBe(-1);
    });
  });

  it('getItemData$', () => {
    const { component, queryService, fixture } = setup();
    const mockObj = of({} as any);
    vi.spyOn(queryService, 'query').mockReturnValue(mockObj);
    fixture.componentRef.setInput('displayId', mockDisplayId);

    expect(component['getItemData$']()).toBe(mockObj);
    expect(queryService.query).toHaveBeenCalledExactlyOnceWith(
      `SELECT entry, class AS _class, inventoryType FROM item_template WHERE displayid=${mockDisplayId} LIMIT 1`,
    );
  });

  describe('verifyModelAndLoad', () => {
    it('succeed', () => {
      const { component, httpTestingController, fixture } = setup();
      const mockUrl = 'www.mock.com';
      const mockModelType = 2;
      fixture.componentRef.setInput('displayId', mockDisplayId);
      vi.spyOn<any>(component, 'getContentPathUrl').mockReturnValue(mockUrl);
      vi.spyOn<any>(component, 'generate3Dmodel').mockImplementation(() => undefined);
      vi.spyOn<any>(component, 'getModelType').mockReturnValue(mockModelType);

      component['verifyModelAndLoad']({ entry: 1, inventoryType: 2 });

      const req = httpTestingController.expectOne(mockUrl);
      expect(req.request.method).toEqual('GET');
      req.flush({ tag_name: 'some newer version' });

      httpTestingController.verify();

      expect(component['generate3Dmodel']).toHaveBeenCalledExactlyOnceWith(mockModelType, mockDisplayId);
      expect(component['getModelType']).toHaveBeenCalledExactlyOnceWith(2);
    });
  });

  it('clean3DModels', () => {
    const { component } = setup();
    component['models3D'].push({ destroy: vi.fn() });

    component['clean3DModels']();

    expect(component['models3D'][0].destroy).toHaveBeenCalledTimes(1);
  });

  describe('resetModel3dElement', () => {
    it('should clean models and clear element innerHTML', () => {
      const { component } = setup();
      component['models3D'].push({ destroy: vi.fn() });

      component['resetModel3dElement']();

      expect(component['models3D'][0].destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('initRaceGenderControls', () => {
    const charConf = {
      displayId: 2,
      viewerType: VIEWER_TYPE.ITEM,
      itemClass: 10,
      itemInventoryType: InventoryType.HANDS,
    };
    it('should update CREATURE_GENDER and call show3Dmodel when raceControl changes and model type is CHARACTER', () => {
      const { component, fixture } = setup(charConf);
      vi.spyOn<any>(component, 'getModelType').mockReturnValue(MODEL_TYPE.CHARACTER);
      vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => undefined);
      const setSpy = vi.spyOn<any>(component['CREATURE_GENDER'], 'set').mockImplementation(() => undefined);

      fixture.detectChanges();
      component['raceControl'].setValue(Race.ORC);

      expect(setSpy).toHaveBeenCalledExactlyOnceWith([
        { value: 0, name: 'Male', icon: `race/${Race.ORC}-0.gif` },
        { value: 1, name: 'Female', icon: `race/${Race.ORC}-1.gif` },
      ]);
      expect(component['show3Dmodel']).toHaveBeenCalledTimes(1);
    });

    it('should update CREATURE_RACE and call show3Dmodel when genderControl changes and model type is CHARACTER', () => {
      const { component, fixture } = setup(charConf);
      vi.spyOn<any>(component, 'getModelType').mockReturnValue(MODEL_TYPE.CHARACTER);
      vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => undefined);
      const setSpy = vi.spyOn<any>(component['CREATURE_RACE'], 'set').mockImplementation(() => undefined);

      fixture.detectChanges();
      component['genderControl'].setValue(Gender.FEMALE);

      expect(setSpy).toHaveBeenCalled();
      expect(component['show3Dmodel']).toHaveBeenCalled();
    });

    it('should not update CREATURE_GENDER or call show3Dmodel if getModelType is not CHARACTER (raceControl)', () => {
      const { component } = setup(charConf);
      vi.spyOn<any>(component, 'getModelType').mockReturnValue(MODEL_TYPE.NPC);
      vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => undefined);
      const setSpy = vi.spyOn<any>(component['CREATURE_GENDER'], 'set').mockImplementation(() => undefined);

      component['initRaceGenderControls']();
      component['raceControl'].setValue(Race.ORC);

      expect(setSpy).not.toHaveBeenCalled();
      expect(component['show3Dmodel']).not.toHaveBeenCalled();
    });

    it('should not update CREATURE_RACE or call show3Dmodel if getModelType is not CHARACTER (genderControl)', () => {
      const { component } = setup(charConf);
      vi.spyOn<any>(component, 'getModelType').mockReturnValue(MODEL_TYPE.NPC);
      vi.spyOn<any>(component, 'show3Dmodel').mockImplementation(() => undefined);
      const setSpy = vi.spyOn<any>(component['CREATURE_RACE'], 'set').mockImplementation(() => undefined);

      component['initRaceGenderControls']();
      component['genderControl'].setValue(Gender.FEMALE);

      expect(setSpy).not.toHaveBeenCalled();
      expect(component['show3Dmodel']).not.toHaveBeenCalled();
    });
  });
});
