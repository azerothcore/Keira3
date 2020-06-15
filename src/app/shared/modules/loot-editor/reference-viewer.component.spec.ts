import { async, TestBed } from '@angular/core/testing';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { PageObject } from '@keira-testing/page-object';

class ReferenceViewerComponentPage extends PageObject<ReferenceViewerComponent> {}

fdescribe('ReferenceViewerComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(ReferenceViewerComponent);
    const page = new ReferenceViewerComponentPage(fixture);
    const component = fixture.componentInstance;

    return { page, fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
