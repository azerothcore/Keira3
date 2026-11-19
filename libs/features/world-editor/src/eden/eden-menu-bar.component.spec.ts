import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { EdenMenuBarComponent } from './eden-menu-bar.component';
import { EdenAction, edenItemEnabled } from './eden-menu';

class MenuPage extends PageObject<EdenMenuBarComponent> {
  item(action: string, assert = true): HTMLButtonElement {
    return this.query<HTMLButtonElement>(`[data-testid="eden-item-${action}"]`, assert);
  }
  title(index: number): HTMLButtonElement {
    return this.query<HTMLButtonElement>(`[data-testid="eden-menu-${index}"]`);
  }
}

describe(EdenMenuBarComponent.name, () => {
  const setup = (pending = 0, canUndo = false) => {
    TestBed.configureTestingModule({
      imports: [EdenMenuBarComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection()],
    });
    const page = new MenuPage(TestBed.createComponent(EdenMenuBarComponent));
    page.fixture.componentRef.setInput('pending', pending);
    page.fixture.componentRef.setInput('canUndo', canUndo);
    const actions: EdenAction[] = [];
    page.fixture.componentInstance.action.subscribe((action) => actions.push(action));
    page.fixture.detectChanges();
    return { page, actions };
  };

  it('opens a menu, runs an item and closes; the items that cannot be used now are greyed', () => {
    const { page, actions } = setup(2);
    expect(page.item('execute', false)).toBeFalsy();

    page.title(0).click();
    page.fixture.detectChanges();
    expect(page.item('execute').disabled).toBe(false);
    page.item('execute').click();
    page.fixture.detectChanges();
    expect(actions).toEqual(['execute']);
    expect(page.item('execute', false)).toBeFalsy();

    page.title(1).click();
    page.fixture.detectChanges();
    expect(page.item('undo').disabled).toBe(true);
    expect(page.item('undo').textContent).toContain('Ctrl+Z');
    // another menu, by pointing at it while one is open
    page.title(2).dispatchEvent(new Event('mouseenter'));
    page.fixture.detectChanges();
    expect(page.item('assets')).toBeTruthy();
    page.title(2).click();
    page.fixture.detectChanges();
    expect(page.item('assets', false)).toBeFalsy();
    // pointing at a menu while none is open does nothing
    page.title(3).dispatchEvent(new Event('mouseenter'));
    page.fixture.detectChanges();
    expect(page.item('controls', false)).toBeFalsy();

    page.title(3).click();
    page.fixture.detectChanges();
    document.dispatchEvent(new Event('click'));
    page.fixture.detectChanges();
    expect(page.item('controls', false)).toBeFalsy();
  });

  it('tells which items can be used', () => {
    const state = { pending: 0, canUndo: true, canRedo: false };
    expect(['execute', 'copySql', 'discard', 'undo', 'redo', 'tree'].map((a) => edenItemEnabled(a as EdenAction, state))).toEqual([
      false,
      false,
      false,
      true,
      false,
      true,
    ]);
  });
});
