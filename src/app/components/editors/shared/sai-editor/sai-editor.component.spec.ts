import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiEditorComponent } from './sai-editor.component';
import { SaiEditorModule } from './sai-editor.module';
import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';

describe('SaiEditorComponent', () => {
  let component: SaiEditorComponent;
  let fixture: ComponentFixture<SaiEditorComponent>;
  let handler: SaiHandlerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SaiEditorModule,
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const selected = { source_type: 1, entryorguid: 100 };
    handler = TestBed.get(SaiHandlerService);
    handler['_selected'] = JSON.stringify(selected);

    fixture = TestBed.createComponent(SaiEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('getName() should correctly work', () => {
    const value = 'testValue';
    const def = 'defaultValue';

    expect(component.getName(def, value)).toEqual(value);
    expect(component.getName(def, undefined)).toEqual(def);
  });
});
