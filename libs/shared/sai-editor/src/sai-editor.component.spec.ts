import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ToastrModule } from 'ngx-toastr';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiHandlerService } from './sai-handler.service';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

describe('SaiEditorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  function setup() {
    const selected = { source_type: 1, entryorguid: 100 };
    const handler = TestBed.inject(SaiHandlerService);
    handler['_selected'] = JSON.stringify(selected);

    const fixture = TestBed.createComponent(SaiEditorComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture, handler };
  }

  it('getName() should correctly work', () => {
    const { component } = setup();
    const value = 'testValue';
    const def = 'defaultValue';

    expect(component.getName(def, value)).toEqual(value);
    expect(component.getName(def, undefined)).toEqual(def);
  });
});
