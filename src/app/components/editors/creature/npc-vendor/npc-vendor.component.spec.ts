import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, reset, when } from 'ts-mockito';
import { of } from 'rxjs';

import { NpcVendorComponent } from './npc-vendor.component';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { MysqlService } from '../../../../services/mysql.service';
import { NpcVendorModule } from './npc-vendor.module';

describe('NpcVendorComponent', () => {
  let component: NpcVendorComponent;
  let fixture: ComponentFixture<NpcVendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NpcVendorModule,
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

    fixture = TestBed.createComponent(NpcVendorComponent);
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
