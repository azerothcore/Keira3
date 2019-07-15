import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBarComponent } from './top-bar.component';
import { MockType } from '../../../../test-utils/mocks';
import { TopBarModule } from './top-bar.module';

describe('TopBarComponent', () => {
  let component: TopBarComponent<MockType>;
  let fixture: ComponentFixture<TopBarComponent<MockType>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TopBarModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
