import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SaiEditorComponent } from '@keira/shared/sai-editor';
import { PageObject } from '@keira/shared/test-utils';
import { SaiFullEditorComponent } from './sai-full-editor.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-editor',
  template: '',
})
class StubSaiEditorComponent {}

class SaiFullEditorComponentPage extends PageObject<SaiFullEditorComponent> {
  get saiEditor(): HTMLElement {
    return this.query<HTMLElement>('keira-sai-editor', false);
  }
}

describe('SaiFullEditorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SaiFullEditorComponent],
      providers: [provideZonelessChangeDetection()],
    })
      .overrideComponent(SaiFullEditorComponent, {
        remove: { imports: [SaiEditorComponent] },
        add: { imports: [StubSaiEditorComponent] },
      })
      .compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(SaiFullEditorComponent);
    const page = new SaiFullEditorComponentPage(fixture);
    fixture.detectChanges();

    return { fixture, page };
  }

  it('renders the SAI editor element', () => {
    const { page } = setup();
    expect(page.saiEditor).toBeTruthy();
  });
});
