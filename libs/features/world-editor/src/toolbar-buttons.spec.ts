import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { PageObjectModel } from 'ngx-page-object-model';
import {
  BUTTON_STYLE_KEY,
  ButtonLabelComponent,
  ButtonStyle,
  buttonTitle,
  loadButtonStyle,
  saveButtonStyle,
  ToolbarButtonId,
} from './toolbar-buttons';

describe(ButtonLabelComponent.name, () => {
  class Page extends PageObjectModel<ButtonLabelComponent> {
    icons(): string[] {
      return [...this.fixture.nativeElement.querySelectorAll('i')].map((i: HTMLElement) => i.className);
    }
    text(): string {
      return (this.fixture.nativeElement as HTMLElement).textContent!.trim();
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonLabelComponent, TranslateTestingModule] }).compileComponents();
  });

  const setup = (button: ToolbarButtonId, mode?: ButtonStyle, spin?: boolean) => {
    const page = new Page(TestBed.createComponent(ButtonLabelComponent));
    page.fixture.componentRef.setInput('button', button);
    if (mode) {
      page.fixture.componentRef.setInput('mode', mode);
    }
    if (spin !== undefined) {
      page.fixture.componentRef.setInput('spin', spin);
    }
    page.fixture.detectChanges();
    return { page };
  };

  it('shows the icon, the name or both', () => {
    const both = setup('filters').page;
    expect(both.icons()).toEqual(['fa fa-filter']);
    expect(both.text()).toBe('WORLD_EDITOR.FILTERS');
    const icons = setup('filters', 'icons').page;
    expect(icons.icons()).toHaveLength(1);
    expect(icons.text()).toBe('');
    const text = setup('filters', 'text').page;
    expect(text.icons()).toEqual([]);
    expect(text.text()).toBe('WORLD_EDITOR.FILTERS');
  });

  it('puts some icons after the name, and keeps a spinning one', () => {
    const next = setup('mapNext').page;
    expect((next.fixture.nativeElement as HTMLElement).innerHTML.indexOf('fa-chevron-right')).toBeGreaterThan(
      (next.fixture.nativeElement as HTMLElement).innerHTML.indexOf('MAP_NEXT'),
    );
    expect(setup('refresh', 'text', true).page.icons()[0]).toContain('fa-spin');
  });
});

describe('button style', () => {
  afterEach(() => localStorage.removeItem(BUTTON_STYLE_KEY));

  it('is kept on this computer, both by default', () => {
    expect(loadButtonStyle()).toBe('both');
    saveButtonStyle('icons');
    expect(loadButtonStyle()).toBe('icons');
    localStorage.setItem(BUTTON_STYLE_KEY, 'huge');
    expect(loadButtonStyle()).toBe('both');
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(loadButtonStyle()).toBe('both');
    saveButtonStyle('text');
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('names a button in its tooltip when it has no help', () => {
    expect(buttonTitle('mapNext')).toBe('WORLD_EDITOR.MAP_NEXT');
    expect(buttonTitle('tree')).toBe('WORLD_EDITOR.TREE_HELP');
  });
});
