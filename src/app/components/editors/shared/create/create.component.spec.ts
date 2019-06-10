import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CreateComponent } from './create.component';
import { MockType } from '../../../../test-utils/mocks';

describe('CreateComponent', () => {
  let component: CreateComponent<MockType>;
  let fixture: ComponentFixture<CreateComponent<MockType>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreateComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
