import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperComponent } from './highlightjs-wrapper.component';

describe('HighlightjsWrapperComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, HighlightjsWrapperComponent],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(HighlightjsWrapperComponent);
    fixture.componentRef.setInput('code', 'test code');
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
