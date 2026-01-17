import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TrainerComponent } from './trainer.component';
import { TrainerService } from './trainer.service';

describe('TrainerComponent', () => {
  @Component({
    template: '<keira-trainer />',
    imports: [TrainerComponent],
  })
  class TestHostComponent {
    readonly child = viewChild.required(TrainerComponent);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TestHostComponent,
        TrainerComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), TrainerHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const queryService = TestBed.inject(MysqlQueryService);
    spyOn(queryService, 'query').and.returnValue(of());

    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child();
    const trainerService = TestBed.inject(TrainerService);
    fixture.detectChanges();

    return { fixture, host, component, queryService, trainerService };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should have editorService injected', () => {
    const { component, trainerService } = setup();
    expect(component['editorService']).toBeTruthy();
    expect(component['editorService']).toEqual(trainerService);
  });

  it('should have TRAINER_TYPE constant available', () => {
    const { component } = setup();
    expect(component['TRAINER_TYPE']).toBeDefined();
  });
});
