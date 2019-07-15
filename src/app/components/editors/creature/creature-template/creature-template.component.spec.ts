import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, reset, when } from 'ts-mockito';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureTemplateComponent } from './creature-template.component';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { MysqlService } from '../../../../services/mysql.service';
import { CreatureTemplateModule } from './creature-template.module';

describe('CreatureTemplateComponent', () => {
  let component: CreatureTemplateComponent;
  let fixture: ComponentFixture<CreatureTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlService.query(anything(), anything())).thenReturn(of());

    fixture = TestBed.createComponent(CreatureTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    reset(MockedMysqlService);
  });
});
