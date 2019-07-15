import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

import { SpawnsAddonComponent } from './spawns-addon.component';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { SpawnsAddonModule } from './spawns-addon.module';

describe('SpawnsAddonComponent', () => {
  let component: SpawnsAddonComponent;
  let fixture: ComponentFixture<SpawnsAddonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SpawnsAddonModule,
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

    fixture = TestBed.createComponent(SpawnsAddonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
