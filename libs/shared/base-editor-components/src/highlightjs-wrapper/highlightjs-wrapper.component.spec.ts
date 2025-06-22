import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperComponent } from './highlightjs-wrapper.component';

describe('HighlightjsWrapperComponent', () => {
  let component: HighlightjsWrapperComponent;
  let fixture: ComponentFixture<HighlightjsWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, HighlightjsWrapperComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightjsWrapperComponent);
    fixture.componentRef.setInput('code', 'test code');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
