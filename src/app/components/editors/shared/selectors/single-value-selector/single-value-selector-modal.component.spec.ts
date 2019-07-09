import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalRef } from 'ngx-bootstrap';

import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';
import { CommonTestModule } from '../../../../../test-utils/common-test.module';

describe('SingleValueSelectorModalComponent', () => {
  let component: SingleValueSelectorModalComponent;
  let fixture: ComponentFixture<SingleValueSelectorModalComponent>;

  const value = 'myValue';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleValueSelectorModalComponent ],
      imports: [
        CommonTestModule,
        NgxDatatableModule,
      ],
      providers: [
        BsModalRef,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should safely create without config', () => {
    expect(component).toBeTruthy();
  });

  it('should properly handle config (if any)', () => {
    component.value = value;
    component.config = {
      options: [
        { name: 'option1', value: 'some value' },
        { name: 'option2', value },
        { name: 'option3', value: 'some other value' },
      ]
    };

    component.ngOnInit();

    expect(component.selected).toEqual([{ name: 'option2', value }]);
  });

  it('onSelect() should properly set the value', () => {
    component.onSelect({ selected: [ { value }]});
    expect(component.value).toEqual(value);
  });
});
