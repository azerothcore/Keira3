import { TestBed, waitForAsync } from '@angular/core/testing';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateTestingModule } from '@keira/test-utils';
import { UnsavedIconComponent } from './unsaved-icon.component';

describe('UnsavedIconComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateTestingModule, TooltipModule],
      declarations: [UnsavedIconComponent],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(UnsavedIconComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
