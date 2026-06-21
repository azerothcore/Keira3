import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapViewerComponent } from './map-viewer.component';
import { MapViewerService } from './map-viewer.service';

describe('MapViewerComponent', () => {
  let component: MapViewerComponent;
  let fixture: ComponentFixture<MapViewerComponent>;
  let mockService: jasmine.SpyObj<MapViewerService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('MapViewerService', ['getMapImageUrl', 'getAllAreas']);
    mockService.getMapImageUrl.and.callFake((mapId: number) => `https://wow.zamimg.com/images/wow/wrath/maps/enus/normal/${mapId}.jpg`);
    mockService.getAllAreas.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [MapViewerComponent],
      providers: [{ provide: MapViewerService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty maps when no points provided', () => {
    fixture.detectChanges();
    expect(component.maps()).toEqual([]);
  });

  it('should not call getAllAreas when points array is empty', () => {
    fixture.detectChanges();
    expect(mockService.getAllAreas).not.toHaveBeenCalled();
  });

  it('should render the container element', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.map-viewer-container')).toBeTruthy();
  });
});
