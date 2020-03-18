import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlEditorComponent } from './sql-editor.component';
import { SqlEditorModule } from './sql-editor.module';

describe('SqlEditorComponent', () => {
  let component: SqlEditorComponent;
  let fixture: ComponentFixture<SqlEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SqlEditorModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
