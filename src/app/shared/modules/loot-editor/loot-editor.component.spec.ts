import { async, TestBed } from '@angular/core/testing';

import { LootEditorComponent } from './loot-editor.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

fdescribe('LootEditorComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(LootEditorComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
