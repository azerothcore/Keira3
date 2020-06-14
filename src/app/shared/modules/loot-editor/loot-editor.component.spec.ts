import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LootEditorComponent } from './loot-editor.component';

describe('LootEditorComponent', () => {
  let component: LootEditorComponent<any>;
  let fixture: ComponentFixture<LootEditorComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LootEditorComponent ]
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
