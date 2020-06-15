import { async, TestBed } from '@angular/core/testing';

import { LootEditorComponent } from './loot-editor.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { PageObject } from '@keira-testing/page-object';

class LootEditorComponentPage extends PageObject<LootEditorComponent<any>> {
  get referenceViewers() { return this.queryAll('keira-reference-viewer'); }
}

fdescribe('LootEditorComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(LootEditorComponent);
    const page = new LootEditorComponentPage(fixture);
    const component = fixture.componentInstance;

    return { page, fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
