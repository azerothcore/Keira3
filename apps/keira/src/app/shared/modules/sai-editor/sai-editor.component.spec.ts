import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira/test-utils';
import { ToastrModule } from 'ngx-toastr';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiEditorModule } from './sai-editor.module';
import { SaiHandlerService } from './sai-handler.service';

describe('SaiEditorComponent', () => {
  let component: SaiEditorComponent;
  let fixture: ComponentFixture<SaiEditorComponent>;
  let handler: SaiHandlerService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), SaiEditorModule, RouterTestingModule, TranslateTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    const selected = { source_type: 1, entryorguid: 100 };
    handler = TestBed.inject(SaiHandlerService);
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
