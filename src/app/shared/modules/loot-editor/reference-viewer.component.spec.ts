import { async, TestBed } from '@angular/core/testing';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

fdescribe('ReferenceViewerComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(ReferenceViewerComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
