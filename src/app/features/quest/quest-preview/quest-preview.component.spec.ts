import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import Spy = jasmine.Spy;

import { QuestPreviewComponent } from './quest-preview.component';
import { QuestModule } from '../quest.module';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { QuestPreviewService } from './quest-preview.service';

describe('QuestPreviewComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestPreviewComponent ],
      imports: [
        RouterTestingModule,
        QuestModule,
      ],
    })
    .compileComponents();
  }));

  function setup() {
    const service = TestBed.inject(QuestPreviewService);
    const fixture: ComponentFixture<QuestPreviewComponent> = TestBed.createComponent(QuestPreviewComponent);
    const component: QuestPreviewComponent = fixture.componentInstance;

    return { fixture, component, service };
  }

  it('ngOnInit', async() => {
    const { fixture, service } = setup();
    const initializeServicesSpy: Spy = spyOn(service, 'initializeServices');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(initializeServicesSpy).toHaveBeenCalledTimes(1);
  });
});
