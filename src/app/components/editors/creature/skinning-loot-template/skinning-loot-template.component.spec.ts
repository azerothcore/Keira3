import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, when } from 'ts-mockito';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { SkinningLootTemplateComponent } from './skinning-loot-template.component';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { SkinningLootTemplateModule } from './skinning-loot-template.module';

describe('SkinningLootTemplateComponent', () => {
  let component: SkinningLootTemplateComponent;
  let fixture: ComponentFixture<SkinningLootTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SkinningLootTemplateModule,
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

    fixture = TestBed.createComponent(SkinningLootTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
