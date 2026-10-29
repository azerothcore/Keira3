import { TestBed } from '@angular/core/testing';
import { DEFAULT_WORLD_STYLE, WorldStyleService } from '@keira/shared/world-viewer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { DebugHtmlElement, PageObjectModel } from 'ngx-page-object-model';
import { StylePanelComponent } from './style-panel.component';

describe(StylePanelComponent.name, () => {
  class Page extends PageObjectModel<StylePanelComponent> {
    el(id: string, assert = true): DebugHtmlElement<HTMLInputElement> {
      return this.getDebugElementByTestId(id, assert);
    }
    /** Types a value in an input (or picks it in a select), as the user does. */
    set(id: string, value: string, event = 'input'): void {
      const element = this.el(id).nativeElement;
      element.value = value;
      element.dispatchEvent(new Event(event));
      this.fixture.detectChanges();
    }
    click(id: string): void {
      this.el(id).nativeElement.click();
      this.fixture.detectChanges();
    }
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [StylePanelComponent, TranslateTestingModule] }).compileComponents();
  });

  const setup = () => {
    const page = new Page(TestBed.createComponent(StylePanelComponent));
    page.fixture.detectChanges();
    return { page, styles: TestBed.inject(WorldStyleService) };
  };

  it('changes colours, how solid they are and the pins’ shapes, each back to its default on its own', () => {
    const { page, styles } = setup();
    // nothing changed: nothing to put back
    expect(page.el('style-reset-creature').nativeElement.classList).toContain('invisible');
    page.set('style-color-creature', '#112233');
    page.set('style-opacity-creature', '40');
    expect(styles.style().creature).toEqual({ color: '#112233', opacity: 0.4 });
    expect(page.el('style-creature').nativeElement.textContent).toContain('40%');
    page.set('style-shape-creature', 'diamond', 'change');
    expect(styles.style().creatureShape).toBe('diamond');
    expect(page.el('style-reset-creature').nativeElement.classList).not.toContain('invisible');
    page.click('style-reset-creature');
    expect(styles.style().creature).toEqual(DEFAULT_WORLD_STYLE.creature);
    expect(styles.style().creatureShape).toBe(DEFAULT_WORLD_STYLE.creatureShape);
    // a colour without a shape
    page.set('style-color-aggro', '#ff0000');
    expect(page.el('style-shape-aggro', false)).toBeFalsy();
    expect(page.el('style-reset-aggro').nativeElement.classList).not.toContain('invisible');
    page.click('style-reset-aggro');
    expect(styles.style().aggro).toEqual(DEFAULT_WORLD_STYLE.aggro);
    // only the shape changed: still something to put back
    page.set('style-shape-gameobject', 'sphere', 'change');
    expect(page.el('style-reset-gameobject').nativeElement.classList).not.toContain('invisible');
  });

  it('changes the waypoints: their shape, size, the path colours and how solid the lines are; and resets everything', () => {
    const { page, styles } = setup();
    page.set('style-shape-waypoint', 'sphere', 'change');
    page.set('style-waypoint-size', '150');
    page.set('style-path-color-2', '#abcdef');
    page.set('style-path-opacity', '50');
    expect(styles.style()).toEqual(expect.objectContaining({ waypointShape: 'sphere', waypointSize: 1.5, pathOpacity: 0.5 }));
    expect(styles.style().pathColors[2]).toBe('#abcdef');
    page.click('style-reset-waypoints');
    expect(styles.style().waypointShape).toBe(DEFAULT_WORLD_STYLE.waypointShape);
    expect(styles.style().pathColors).toEqual(DEFAULT_WORLD_STYLE.pathColors);
    page.set('style-color-tag', '#000000');
    page.click('style-reset-all');
    expect(styles.style()).toEqual(DEFAULT_WORLD_STYLE);
  });
});
