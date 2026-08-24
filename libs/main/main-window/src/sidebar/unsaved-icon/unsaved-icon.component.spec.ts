import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { UnsavedIconComponent } from './unsaved-icon.component';

describe('UnsavedIconComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateTestingModule, TooltipDirective, UnsavedIconComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

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
