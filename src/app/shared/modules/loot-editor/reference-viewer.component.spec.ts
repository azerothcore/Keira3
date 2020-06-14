import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

describe('ReferenceViewerComponent', () => {
  let component: ReferenceViewerComponent;
  let fixture: ComponentFixture<ReferenceViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
