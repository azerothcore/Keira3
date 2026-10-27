import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ServerTileCoverage, TILE_SIZE, TileCoord, WorldBounds, WorldPosition, WowClientService } from '@keira/shared/wow-data';
import { PageObjectModel } from 'ngx-page-object-model';
import { WorldMapComponent, WorldMapDot } from './world-map.component';

@Component({
  imports: [WorldMapComponent],
  template: `
    <keira-world-map
      [directory]="directory()"
      [mapId]="mapId()"
      [tiles]="tiles()"
      [camera]="camera()"
      [dots]="dots()"
      [zones]="zones()"
      [coverage]="coverage()"
      (goTo)="goTos.push($event)"
      (regionSelected)="regions.push($event)"
      (closed)="closes = closes + 1"
    />
  `,
})
class HostComponent {
  readonly directory = signal<string | undefined>('Azeroth');
  readonly mapId = signal<number | undefined>(0);
  readonly tiles = signal<TileCoord[]>([
    { tx: 31, ty: 49 },
    { tx: 32, ty: 49 },
  ]);
  readonly camera = signal<WorldPosition | undefined>(undefined);
  readonly dots = signal<WorldMapDot[]>([]);
  readonly zones = signal<{ name: string; bounds: WorldBounds }[]>([]);
  readonly coverage = signal<Map<string, ServerTileCoverage> | undefined>(undefined);
  readonly goTos: WorldPosition[] = [];
  readonly regions: WorldBounds[] = [];
  closes = 0;
}

class Page extends PageObjectModel<HostComponent> {
  map(): HTMLElement {
    return this.getDebugElementByTestId('world-map').nativeElement;
  }
  pointer(type: string, x: number, y: number, shiftKey = false): void {
    this.map().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, button: 0, shiftKey, bubbles: true }));
    this.fixture.detectChanges();
  }
  wheel(x: number, y: number, deltaY: number): void {
    this.map().dispatchEvent(new WheelEvent('wheel', { clientX: x, clientY: y, deltaY, bubbles: true, cancelable: true }));
    this.fixture.detectChanges();
  }
}

describe(WorldMapComponent.name, () => {
  const client = { getMinimap: vi.fn() };
  const image = { width: 128, height: 128, data: new Uint8Array(128 * 128 * 4).fill(200) };

  beforeEach(async () => {
    // a 200 × 100 view: the two tiles fit at 100 px each
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    client.getMinimap.mockReset();
    client.getMinimap.mockImplementation((_d: string, tile: TileCoord) =>
      tile.tx === 31 ? Promise.resolve(image) : tile.tx === 32 ? Promise.reject(new Error('none')) : Promise.resolve(undefined),
    );
    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateTestingModule],
      providers: [{ provide: WowClientService, useValue: client }],
    }).compileComponents();
  });

  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const page = new Page(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    return { fixture, page, host: fixture.componentInstance };
  };

  it("fits the map's tiles in the view, with their minimap images, names and grid", async () => {
    const { page } = await setup();
    const tile = page.getDebugElementByTestId('world-map-tile-31_49').nativeElement as HTMLElement;
    expect(tile.style.left).toBe('3100px');
    expect(tile.style.width).toBe('100px');
    expect(tile.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/bmp/);
    expect(tile.textContent?.trim()).toBe('31_49');
    expect((page.getDebugElementByTestId('world-map-tile-32_49').nativeElement as HTMLElement).querySelector('img')).toBeNull();
    expect(client.getMinimap).toHaveBeenCalledWith('Azeroth', { tx: 31, ty: 49 });
  });

  it('goes where clicked, pans when dragged, and selects an area with Shift + drag', async () => {
    const { page, host } = await setup();
    // the middle of tile 31_49 (left half of the view)
    page.pointer('pointerdown', 50, 50);
    // a slight move is still a click
    page.pointer('pointermove', 52, 50);
    page.pointer('pointerup', 50, 50);
    expect(host.goTos[0].x).toBeCloseTo((32 - 49.5) * TILE_SIZE);
    expect(host.goTos[0].y).toBeCloseTo((32 - 31.5) * TILE_SIZE);

    page.pointer('pointerdown', 50, 50);
    page.pointer('pointermove', 150, 50);
    page.pointer('pointerup', 150, 50);
    expect(host.goTos).toHaveLength(1);
    expect((page.getDebugElementByTestId('world-map-tile-31_49').nativeElement as HTMLElement).parentElement?.style.transform).toContain(
      'translate(-3000px',
    );

    page.pointer('pointerdown', 110, 10, true);
    page.pointer('pointermove', 190, 90, true);
    expect(page.getDebugElementByTestId('world-map-selection')).toBeTruthy();
    page.pointer('pointerup', 190, 90, true);
    expect(page.getDebugElementByTestId('world-map-selection', false)).toBeFalsy();
    expect(host.regions).toHaveLength(1);
    expect(host.regions[0].maxX - host.regions[0].minX).toBeCloseTo(0.8 * TILE_SIZE);

    // other buttons, and moves without a press, do nothing
    page.map().dispatchEvent(new MouseEvent('pointerdown', { button: 2, bubbles: true }));
    page.pointer('pointerup', 10, 10);
    expect(host.goTos).toHaveLength(1);
  });

  it('zooms around the cursor with the wheel, within limits, and comes back to the camera or the whole map', async () => {
    const { page, host, fixture } = await setup();
    const width = () => (page.getDebugElementByTestId('world-map-tile-31_49').nativeElement as HTMLElement).style.width;
    page.wheel(50, 50, -100);
    expect(width()).toBe('125px');
    page.wheel(50, 50, 100);
    expect(width()).toBe('100px');
    for (let i = 0; i < 40; i++) {
      page.wheel(50, 50, 100);
    }
    expect(width()).toBe('4px');
    // pressing its buttons is not a click on the map
    const fit = page.getDebugElementByTestId('world-map-fit').nativeElement as HTMLElement;
    fit.dispatchEvent(new MouseEvent('pointerdown', { clientX: 190, clientY: 10, button: 0, bubbles: true }));
    fit.dispatchEvent(new MouseEvent('pointerup', { clientX: 190, clientY: 10, button: 0, bubbles: true }));
    fit.click();
    fixture.detectChanges();
    expect(host.goTos).toEqual([]);
    expect(width()).toBe('100px');
    page.getDebugElementByTestId('world-map-close').nativeElement.click();
    expect(host.closes).toBe(1);

    page.getDebugElementByTestId('world-map-camera-btn').nativeElement.click();
    host.camera.set({ x: (32 - 49.5) * TILE_SIZE, y: (32 - 32.5) * TILE_SIZE, z: 0 });
    fixture.detectChanges();
    page.getDebugElementByTestId('world-map-camera-btn').nativeElement.click();
    fixture.detectChanges();
    const camera = page.getDebugElementByTestId('world-map-camera').nativeElement as HTMLElement;
    expect(camera.style.left).toBe('3250px');
    expect((camera.parentElement as HTMLElement).style.transform).toBe('translate(-3150px, -4900px)');
  });

  it('names the hovered tile with its server files, and draws dots and zones', async () => {
    const { page, host, fixture } = await setup();
    host.coverage.set(
      new Map([
        ['31_49', { map: true, vmap: false, mmap: true }],
        ['32_49', { map: false, vmap: false, mmap: false }],
      ]),
    );
    host.dots.set([
      { key: 'creature:1', position: { x: (32 - 49.5) * TILE_SIZE, y: (32 - 31.5) * TILE_SIZE, z: 0 }, color: '#ffc107', title: 'Guard' },
    ]);
    host.zones.set([{ name: 'Elwynn', bounds: { minX: -9600, maxX: -9067, minY: 0, maxY: 533 } }]);
    fixture.detectChanges();
    expect((page.getDebugElementByTestId('world-map-dot-creature:1').nativeElement as HTMLElement).style.left).toBe('3150px');
    expect(page.getDebugElementByTestId('world-map-tile-32_49').nativeElement.classList).toContain('missing');
    expect(page.getDebugElementByTestId('world-map-tile-31_49').nativeElement.classList).not.toContain('missing');
    expect(page.map().textContent).toContain('Elwynn');

    page.pointer('pointermove', 50, 50);
    const info = page.getDebugElementByTestId('world-map-info').nativeElement as HTMLElement;
    expect(info.textContent).toContain('31_49');
    expect(info.textContent).toContain('0004931.map');
    expect(info.textContent).toContain('000_31_49.vmtile');
    expect(info.querySelector('.text-danger')?.textContent).toBe('000_31_49.vmtile');
    // off the map's tiles, or out of the view
    page.pointer('pointermove', 50, 150);
    expect(page.getDebugElementByTestId('world-map-info', false)).toBeFalsy();
    page.pointer('pointermove', 50, 50);
    page.map().dispatchEvent(new MouseEvent('pointerleave'));
    fixture.detectChanges();
    expect(page.getDebugElementByTestId('world-map-info', false)).toBeFalsy();
    // no map id: no file names
    host.mapId.set(undefined);
    fixture.detectChanges();
    page.pointer('pointermove', 50, 50);
    expect(page.getDebugElementByTestId('world-map-info').nativeElement.textContent?.trim()).toBe('31_49');
  });

  it('starts over with another map, and has nothing to fit without tiles', async () => {
    const { page, host, fixture } = await setup();
    host.directory.set('Kalimdor');
    host.tiles.set([]);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    expect(page.getDebugElementByTestId('world-map-tile-31_49', false)).toBeFalsy();
    host.directory.set(undefined);
    host.tiles.set([{ tx: 31, ty: 49 }]);
    fixture.detectChanges();
    // zoomed in: the bigger images
    for (let i = 0; i < 5; i++) {
      page.wheel(50, 50, -100);
    }
    host.directory.set('Azeroth');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    expect(client.getMinimap).toHaveBeenCalledWith('Azeroth', { tx: 31, ty: 49 });
    // closed while an image loads
    let finish: (value: typeof image) => void = () => undefined;
    client.getMinimap.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    host.directory.set('Northrend');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.destroy();
    finish(image);
    await new Promise((resolve) => setTimeout(resolve));
  });
});
