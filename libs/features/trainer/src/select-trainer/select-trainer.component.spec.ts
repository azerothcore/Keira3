import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { TrainerHandlerService } from '../trainer-handler.service';
import { SelectTrainerComponent } from './select-trainer.component';
import { SelectTrainerService } from './select-trainer.service';

describe('SelectTrainerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ToastrModule.forRoot(), SelectTrainerComponent, RouterTestingModule, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), TrainerHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const queryService = TestBed.inject(MysqlQueryService);
    spyOn(queryService, 'query').and.returnValue(of());

    const fixture = TestBed.createComponent(SelectTrainerComponent);
    const component = fixture.componentInstance;
    const selectService = TestBed.inject(SelectTrainerService);
    const handlerService = TestBed.inject(TrainerHandlerService);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    return { fixture, component, queryService, selectService, handlerService, router };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should have correct entity table', () => {
    const { component } = setup();
    expect(component['entityTable']).toBe('trainer');
  });

  it('should have correct entity id field', () => {
    const { component } = setup();
    expect(component['entityIdField']).toBe('Id');
  });

  it('should have customStartingId set to 1000000', () => {
    const { component } = setup();
    expect(component['customStartingId']).toBe(1000000);
  });
});
