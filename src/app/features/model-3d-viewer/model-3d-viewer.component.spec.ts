import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { Model3DViewerComponent } from './model-3d-viewer.component';
import { CONTENT_WOTLK, MODEL_TYPE, VIEWER_TYPE } from './model-3d-viewer.model';

describe('Model3DViewerComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Model3DViewerComponent],
      imports: [ModalModule.forRoot(), HttpClientTestingModule],
    }).compileComponents();
  }));

  const mockDisplayId = 1;

  function setup() {
    const fixture = TestBed.createComponent(Model3DViewerComponent);
    const component = fixture.componentInstance;
    const queryService = TestBed.inject(MysqlQueryService);
    const httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    return { fixture, component, queryService, httpTestingController };
  }

  it('ngOnInit', () => {
    const { component } = setup();
    spyOn<any>(component, 'resetModel3dElement');
    spyOn<any>(component, 'viewerDynamic');

    component.ngOnInit();

    expect(component['resetModel3dElement']).toHaveBeenCalledTimes(1);
    expect(component['viewerDynamic']).toHaveBeenCalledTimes(1);
  });

  it('ngOnChanges', () => {
    const { component } = setup();
    const resetModel3dElementSpy = spyOn<any>(component, 'resetModel3dElement');
    const show3DmodelSpy = spyOn(component, 'show3Dmodel');
    component.displayId = 2;
    component.viewerType = VIEWER_TYPE.NPC;

    component.ngOnChanges({ displayId: { currentValue: 1, previousValue: 0 } as any });

    expect(resetModel3dElementSpy).toHaveBeenCalledTimes(1);
    expect(show3DmodelSpy).toHaveBeenCalledTimes(1);
  });

  it('ngOnDestroy', () => {
    const { component } = setup();
    const unsubscribeSpy = spyOn<any>(component['subscriptions'], 'unsubscribe');
    spyOn<any>(component, 'resetModel3dElement');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    expect(component['resetModel3dElement']).toHaveBeenCalledTimes(1);
  });

  it('generate3Dmodel', () => {
    const { component } = setup();
    spyOn<any>(component, 'resetModel3dElement');

    component['generate3Dmodel']();

    expect(component['resetModel3dElement']).toHaveBeenCalledTimes(1);
  });

  describe('show3Dmodel', () => {
    it('generate3Dmodel for non-item', () => {
      const { component } = setup();
      component.viewerType = VIEWER_TYPE.NPC;
      spyOn<any>(component, 'generate3Dmodel');

      component.show3Dmodel();

      expect(component['generate3Dmodel']).toHaveBeenCalledTimes(1);
    });

    it('handles the item 3D model', (done) => {
      const { component } = setup();
      component.viewerType = VIEWER_TYPE.ITEM;
      const subscriptionAddSpy = spyOn<any>(component['subscriptions'], 'add');
      const mockItemData$ = of([{ entry: 123 }]);
      spyOn<any>(component, 'getItemData$').and.returnValue(mockItemData$);
      spyOn<any>(component, 'verifyModelAndLoad');

      component.show3Dmodel();

      mockItemData$.subscribe(() => {
        expect(subscriptionAddSpy).toHaveBeenCalledTimes(1);
        expect(component['verifyModelAndLoad']).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('getContentPathUrl', () => {
    it('returns armor URL', () => {
      const { component } = setup();
      component.displayId = mockDisplayId;

      expect(component['getContentPathUrl'](3)).toBe(`${CONTENT_WOTLK}meta/armor/3/${mockDisplayId}.json`);
      expect(component['getContentPathUrl'](4)).toBe(`${CONTENT_WOTLK}meta/armor/4/${mockDisplayId}.json`);
    });

    it('returns item URL', () => {
      const { component } = setup();
      component.displayId = mockDisplayId;

      expect(component['getContentPathUrl'](1)).toBe(`${CONTENT_WOTLK}meta/item/${mockDisplayId}.json`);
    });
  });

  describe('getModelType', () => {
    it('uses default params', () => {
      const { component } = setup();
      component.itemInventoryType = 1;
      component.itemClass = 2;
      component.viewerType = VIEWER_TYPE.ITEM;

      expect(component['getModelType']()).toBe(MODEL_TYPE.WEAPON);
    });

    it('uses custom params', () => {
      const { component } = setup();
      component.itemInventoryType = 1;
      component.itemClass = 2;
      component.viewerType = VIEWER_TYPE.ITEM;

      expect(component['getModelType'](3, 1)).toBe(MODEL_TYPE.HELMET);
      expect(component['getModelType'](3, 3)).toBe(MODEL_TYPE.SHOULDER);
    });

    it('returns object', () => {
      const { component } = setup();
      component.viewerType = VIEWER_TYPE.OBJECT;
      expect(component['getModelType']()).toBe(MODEL_TYPE.OBJECT);
    });

    it('returns NPC', () => {
      const { component } = setup();
      component.viewerType = VIEWER_TYPE.NPC;
      expect(component['getModelType']()).toBe(MODEL_TYPE.NPC);
    });

    it('returns null', () => {
      const { component } = setup();
      component.viewerType = VIEWER_TYPE.ITEM;
      expect(component['getModelType'](4, 2)).toBeNull();
    });
  });

  it('getItemData$', () => {
    const { component, queryService } = setup();
    const mockObj = of({} as any);
    spyOn(queryService, 'query').and.returnValue(mockObj);
    component.displayId = mockDisplayId;

    expect(component['getItemData$']()).toBe(mockObj);
    expect(queryService.query).toHaveBeenCalledOnceWith(
      `SELECT entry, class AS _class, inventoryType FROM item_template WHERE displayid=${mockDisplayId} LIMIT 1`,
    );
  });

  describe('verifyModelAndLoad', () => {
    it('succeed', () => {
      const { component, httpTestingController } = setup();
      const mockUrl = 'www.mock.com';
      const mockModelType = 2;
      component.displayId = mockDisplayId;
      spyOn<any>(component, 'getContentPathUrl').and.returnValue(mockUrl);
      spyOn<any>(component, 'generate3Dmodel');
      spyOn<any>(component, 'getModelType').and.returnValue(mockModelType);

      component['verifyModelAndLoad']({ entry: 1, inventoryType: 2, _class: 2 });

      const req = httpTestingController.expectOne(mockUrl);
      expect(req.request.method).toEqual('GET');
      req.flush({ tag_name: 'some newer version' });

      httpTestingController.verify();

      expect(component['generate3Dmodel']).toHaveBeenCalledOnceWith(mockModelType, mockDisplayId);
      expect(component['getModelType']).toHaveBeenCalledOnceWith(2, 2);
    });
  });

  it('clean3DModels', () => {
    const { component } = setup();
    component['models3D'].push({ destroy: jasmine.createSpy('destroy') });

    component['clean3DModels']();

    expect(component['models3D'][0].destroy).toHaveBeenCalledTimes(1);
  });
});
