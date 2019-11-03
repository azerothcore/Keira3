import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaiEditorComponent } from './sai-editor.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SaiEditorComponent', () => {
  let component: SaiEditorComponent;
  let fixture: ComponentFixture<SaiEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaiEditorComponent ],
      imports: [
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaiEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
