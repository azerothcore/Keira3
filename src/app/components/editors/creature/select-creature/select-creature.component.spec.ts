import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, reset, when } from 'ts-mockito';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { SelectCreatureComponent } from './select-creature.component';
import { MockedQueryService } from '../../../../test-utils/mocks';
import { QueryService } from '../../../../services/query.service';
import { CreatureSelectService } from '../../../../services/select/creature-select.service';
import { SelectCreatureModule } from './select-creature.module';

describe('SelectCreatureComponent', () => {
  let component: SelectCreatureComponent;
  let fixture: ComponentFixture<SelectCreatureComponent>;
  let selectService: CreatureSelectService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectCreatureModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedQueryService.selectAll(anything(), anything(), anything())).thenReturn(of({ results: []}));
    when(MockedQueryService.getMaxId(anything(), anything())).thenReturn(of({ results: [{ max: 123 }]}));

    selectService = TestBed.get(CreatureSelectService);
    selectService.query = '--mock query';

    fixture = TestBed.createComponent(SelectCreatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    reset(MockedQueryService);
    fixture.debugElement.nativeElement.remove();
  });
});
