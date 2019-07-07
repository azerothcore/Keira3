import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { CommonTestModule } from '../../../../../test-utils/common-test.module';

describe('FlagsSelectorModalComponent', () => {
  let component: FlagsSelectorModalComponent;
  let fixture: ComponentFixture<FlagsSelectorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlagsSelectorModalComponent ],
      imports: [
        CommonTestModule,
        UiSwitchModule,
      ],
      providers: [
        BsModalRef,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagsSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
