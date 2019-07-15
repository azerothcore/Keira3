import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

import { CreatureLootTemplateComponent } from './creature-loot-template.component';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { CreatureLootTemplateModule } from './creature-loot-template.module';

describe('CreatureLootTemplateComponent', () => {
  let component: CreatureLootTemplateComponent;
  let fixture: ComponentFixture<CreatureLootTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureLootTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlService.query(anything(), anything())).thenReturn(of());

    fixture = TestBed.createComponent(CreatureLootTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
