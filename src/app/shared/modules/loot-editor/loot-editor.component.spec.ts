import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LootEditorComponent } from './loot-editor.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

describe('LootEditorComponent', () => {
  let component: LootEditorComponent<any>;
  let fixture: ComponentFixture<LootEditorComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LootEditorModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LootEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
