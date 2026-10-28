import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { PageObjectModel } from 'ngx-page-object-model';
import { normaliseBearing, WorldCompassComponent } from './world-compass.component';

@Component({
  imports: [WorldCompassComponent],
  template: `
    <keira-world-compass
      [heading]="heading()"
      [northUp]="northUp()"
      [northArrow]="northArrow()"
      [points]="points()"
      [degrees]="degrees()"
      [mils]="mils()"
      [opacity]="opacity()"
    />
  `,
})
class HostComponent {
  readonly heading = signal(0);
  readonly northUp = signal(false);
  readonly northArrow = signal(true);
  readonly points = signal(true);
  readonly degrees = signal(true);
  readonly mils = signal(false);
  readonly opacity = signal(1);
}

class CompassPage extends PageObjectModel<HostComponent> {
  text(id: string): string {
    return (this.getDebugElementByTestId(id).nativeElement as Element).textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }
  has(id: string): boolean {
    return !!this.getDebugElementByTestId(id, false);
  }
  transform(id: string): string | null {
    return (this.getDebugElementByTestId(id).nativeElement as Element).getAttribute('transform');
  }
}

describe('WorldCompassComponent', () => {
  const setup = () => {
    TestBed.configureTestingModule({ imports: [HostComponent, TranslateTestingModule] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { host: fixture.componentInstance, page: new CompassPage(fixture) };
  };

  it('turns the dial so the way the camera looks is at the top, with the bearing in degrees', () => {
    const { host, page } = setup();
    expect(page.text('world-compass-readout')).toBe('WORLD_EDITOR.COMPASS_N 0°');
    // the points on the outer ring, the numbers between them inside
    expect(page.text('world-compass-point-0')).toBe('WORLD_EDITOR.COMPASS_N');
    expect(page.text('world-compass-point-45')).toBe('WORLD_EDITOR.COMPASS_NE');
    expect(page.has('world-compass-ring')).toBe(true);
    // numbers only at the marks every 45°: north a red arrow, east / south / west arrows, the others dotted ticks
    expect(page.text('world-compass-label-45')).toBe('45');
    expect(page.has('world-compass-label-15')).toBe(false);
    const kind = (angle: number) =>
      ['north', 'tick', 'arrow'].find((name) =>
        (page.getDebugElementByTestId(`world-compass-mark-${angle}`).nativeElement as Element).classList.contains(name),
      );
    expect([0, 45, 90].map(kind)).toEqual(['north', 'tick', 'arrow']);
    expect((page.getDebugElementByTestId('world-compass').nativeElement as HTMLElement).style.opacity).toBe('1');
    host.opacity.set(0.4);
    page.fixture.detectChanges();
    expect((page.getDebugElementByTestId('world-compass').nativeElement as HTMLElement).style.opacity).toBe('0.4');
    expect(page.has('world-compass-north')).toBe(true);
    host.heading.set(-312.6);
    page.fixture.detectChanges();
    expect(page.text('world-compass-readout')).toBe('WORLD_EDITOR.COMPASS_NE 47°');
    expect(page.transform('world-compass-dial')).toBe(`rotate(${-normaliseBearing(-312.6)})`);
    expect(page.has('world-compass-needle')).toBe(false);
    // just under a full turn shows as 0
    host.heading.set(359.8);
    page.fixture.detectChanges();
    expect(page.text('world-compass-degrees')).toBe('0°');
  });

  it('can keep north up and turn a needle, and show mils, numbers only, no arrow or no readout', () => {
    const { host, page } = setup();
    host.heading.set(90);
    host.northUp.set(true);
    host.mils.set(true);
    host.points.set(false);
    host.northArrow.set(false);
    page.fixture.detectChanges();
    expect(page.transform('world-compass-dial')).toBe('rotate(0)');
    expect(page.transform('world-compass-needle')).toBe('rotate(90)');
    expect(page.text('world-compass-readout')).toBe('WORLD_EDITOR.COMPASS_E 90°1600 mil');
    expect(page.text('world-compass-label-0')).toBe('0');
    expect(page.has('world-compass-point-0')).toBe(false);
    expect(page.has('world-compass-ring')).toBe(false);
    expect(page.has('world-compass-north')).toBe(false);
    host.degrees.set(false);
    page.fixture.detectChanges();
    expect(page.text('world-compass-readout')).toBe('WORLD_EDITOR.COMPASS_E 1600 mil');
    host.mils.set(false);
    page.fixture.detectChanges();
    expect(page.has('world-compass-readout')).toBe(false);
  });
});
