import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { GameMapData, WorldBounds, WorldPosition, WowClientService, WowMap } from '@keira/shared/wow-data';
import { DebugHtmlElement, PageObjectModel } from 'ngx-page-object-model';
import { GameMapComponent } from './game-map.component';
import { GAME_MAP_POIS_KEY, GameMapPoi } from './game-map-pois';
import { WorldMapDot } from './world-map.component';

@Component({
  imports: [GameMapComponent],
  template: `
    <keira-game-map
      [mapId]="mapId()"
      [camera]="camera()"
      [zoneId]="zoneId()"
      [dots]="dots()"
      [pois]="pois()"
      [maps]="maps()"
      (goTo)="goTos.push($event)"
      (regionSelected)="regions.push($event)"
    />
  `,
})
class HostComponent {
  readonly mapId = signal<number | undefined>(0);
  readonly camera = signal<WorldPosition | undefined>({ x: -9000, y: -250, z: 55 });
  readonly zoneId = signal(12);
  readonly dots = signal<WorldMapDot[]>([
    { key: 'creature:1', position: { x: -9000, y: 0, z: 50 }, color: '#ff0', title: 'Hogger' },
    { key: 'creature:2', position: { x: 0, y: 0, z: 0 }, color: '#ff0' },
  ]);
  readonly pois = signal<GameMapPoi[]>([
    { kind: 'flight', mapId: 0, x: -9100, y: -300, z: 1, name: 'Thor', subname: 'Gryphon Master' },
    { kind: 'spirit', mapId: 0, x: -9200, y: -300, z: 1, name: 'Spirit Healer' },
    { kind: 'bank', mapId: 0, x: -9300, y: -300, z: 1, name: 'Banker' },
    { kind: 'inn', mapId: 530, x: 9000, y: -7000, z: 1, name: 'Eversong innkeeper' },
    { kind: 'inn', mapId: 530, x: 0, y: 0, z: 1, name: 'Outland innkeeper' },
  ]);
  readonly maps = signal<WowMap[]>([{ id: 0, directory: 'Azeroth', name: 'Eastern Kingdoms', instanceType: 0 }]);
  readonly goTos: { mapId: number; position: WorldPosition }[] = [];
  readonly regions: WorldBounds[] = [];
}

class Page extends PageObjectModel<HostComponent> {
  byId<T extends HTMLElement = HTMLElement>(id: string, assert = true): DebugHtmlElement<T> {
    return this.getDebugElementByTestId(id, assert);
  }
  picture(): HTMLElement {
    return this.byId('game-map-picture').nativeElement;
  }
  title(): string {
    return this.byId('game-map-title').nativeElement.textContent?.trim() ?? '';
  }
  hoverAt(x: number, y: number): void {
    this.picture().dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
    this.fixture.detectChanges();
  }
  click(id: string): void {
    this.byId(id).nativeElement.click();
    this.fixture.detectChanges();
  }
  tooltip(): string {
    return [...this.byId('game-map-tooltip').nativeElement.children].map((line) => line.textContent?.trim()).join(' ');
  }
}

const bounds = (minX: number, maxX: number, minY: number, maxY: number) => ({ minX, maxX, minY, maxY });
const area = (id: number, mapId: number, areaId: number, folder: string, b = bounds(0, 0, 0, 0), parent = 0, defaultFloor = 0) => ({
  id,
  mapId,
  areaId,
  folder,
  bounds: b,
  parent,
  defaultFloor,
});

const data = (): GameMapData => ({
  areas: [
    area(14, 0, 0, 'Azeroth', bounds(-16000, 12000, -22000, 18000)),
    area(466, 530, 0, 'Expansion01', bounds(-6000, 6000, -4500, 13000)),
    area(301, 0, 1519, 'Stormwind', bounds(-8900, -8100, 600, 1400)),
    area(30, 0, 12, 'Elwynn', bounds(-10000, -8000, -2000, 1500)),
    area(32, 0, 10, 'Duskwood', bounds(-11500, -10500, -2000, 1000)),
    area(36, 0, 44, 'Redridge', bounds(-10500, -9500, -4000, -2500)),
    area(1001, 0, 6001, 'Fargodeepmine1_', bounds(-9860, -9700, 42, 282), 30),
    area(31, 0, 40, 'Westfall', bounds(-12000, -9000, -3000, 0)),
    area(462, 530, 3430, 'EversongWoods', bounds(7700, 11000, -9400, -4500)),
    area(535, 533, 3456, 'Naxxramas', bounds(2300, 3600, -4400, -2500), 30),
    area(529, 603, 4273, 'Ulduar', bounds(-1000, 1200, -1700, 1600), 0, -1),
  ],
  overlays: [
    {
      mapAreaId: 30,
      areaIds: [87],
      texture: 'Goldshire',
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      hit: { left: 400, top: 300, right: 600, bottom: 400 },
    },
    { mapAreaId: 30, areaIds: [88], texture: 'Big', width: 10, height: 10, x: 0, y: 0, hit: { left: 0, top: 0, right: 1000, bottom: 660 } },
    {
      mapAreaId: 31,
      areaIds: [89],
      texture: 'Other',
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      hit: { left: 0, top: 0, right: 1000, bottom: 660 },
    },
  ],
  floors: [
    { id: 56, mapId: 533, floor: 1, bounds: bounds(2886, 3615, -3734, -2640), parent: 0 },
    { id: 57, mapId: 533, floor: 2, bounds: bounds(2886, 3615, -3734, -2640), parent: 0 },
    { id: 69, mapId: 603, floor: 1, bounds: bounds(1400, 1800, -450, 220), parent: 0 },
  ],
  transforms: [{ mapId: 530, region: bounds(4800, 16000, -10000, -2600), newMapId: 0, offsetX: -2400, offsetY: 2400 }],
  zones: new Map([
    [12, { name: 'Elwynn Forest', flags: 64, levels: [1, 10] as [number, number], faction: 1 }],
    [1519, { name: 'Stormwind City', flags: 0x100 | 0x800 }],
    [10, { name: 'Duskwood', flags: 0, levels: [18, 30] as [number, number], faction: 0 }],
    [44, { name: 'Redridge Mountains', flags: 0 }],
    [40, { name: 'Westfall', flags: 64, levels: [10, 20] as [number, number], faction: 0 }],
    [3430, { name: 'Eversong Woods', flags: 0, faction: -1 }],
    [87, { name: 'Goldshire', flags: 0 }],
    [6001, { name: 'Fargodeep Mine', flags: 0 }],
    [88, { name: 'Northshire', flags: 0 }],
    [3456, { name: 'Naxxramas', flags: 0x800 }],
  ]),
});

describe(GameMapComponent.name, () => {
  const glow = { width: 2, height: 2, data: new Uint8Array(16).fill(30) };
  const bright = { width: 2, height: 2, data: new Uint8Array(16).fill(60) };
  const icon = { width: 1, height: 1, data: new Uint8Array(4).fill(255) };
  const picture = { width: 2, height: 2, data: new Uint8Array(16).fill(100) };
  const client = { getGameMap: vi.fn(), getGameMapPicture: vi.fn(), getTexture: vi.fn() };

  beforeEach(async () => {
    localStorage.clear();
    // the picture is drawn at its own size: pixels on screen are pixels of the map
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1002, 668));
    client.getGameMap.mockReset().mockResolvedValue(data());
    client.getGameMapPicture
      .mockReset()
      .mockImplementation((page: { prefix: string }) =>
        page.prefix.startsWith('Westfall')
          ? Promise.resolve(undefined)
          : page.prefix.startsWith('Expansion')
            ? Promise.reject(new Error('bad'))
            : Promise.resolve(picture),
      );
    client.getTexture
      .mockReset()
      .mockImplementation((path: string) =>
        path.includes('Tracking')
          ? Promise.resolve(path.includes('Banker') ? undefined : icon)
          : path.includes('Westfall')
            ? Promise.reject(new Error('none'))
            : Promise.resolve(path.includes('Stormwind') ? bright : glow),
      );
    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateTestingModule],
      providers: [{ provide: WowClientService, useValue: client }],
    }).compileComponents();
  });
  afterEach(() => vi.restoreAllMocks());

  const settle = async (page: Page) => {
    for (let i = 0; i < 4; i++) {
      page.fixture.detectChanges();
      await page.fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
    page.fixture.detectChanges();
  };
  const setup = async (change?: (host: HostComponent) => void) => {
    const fixture = TestBed.createComponent(HostComponent);
    change?.(fixture.componentInstance);
    const page = new Page(fixture);
    fixture.detectChanges();
    expect(page.byId('game-map-loading')).toBeTruthy();
    await settle(page);
    return { page, host: fixture.componentInstance };
  };

  it('opens the zone the camera is in, with its sub-zones, pins and coordinates', async () => {
    const { page, host } = await setup();
    expect(page.title()).toBe('Elwynn Forest');
    expect(page.byId('game-map-picture').nativeElement.querySelector('img')).toBeTruthy();
    expect(client.getGameMapPicture.mock.calls[0][1]).toHaveLength(2);
    expect(page.byId('game-map-camera-pin').nativeElement.style.left).toBe('50%');
    // spawns on the picture, points of interest of the kinds shown (flight masters with their icon, spirit healers)
    expect(page.byId('game-map-pin-creature:1').nativeElement.title).toBe('Hogger');
    expect(page.byId('game-map-pin-creature:2', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:0').nativeElement.title).toBe('Thor <Gryphon Master> WORLD_EDITOR.POI_FLIGHT');
    expect(page.byId('game-map-pin-poi:0').nativeElement.querySelector('img')).toBeTruthy();
    expect(page.byId('game-map-pin-poi:1').nativeElement.querySelector('i.fa-heartbeat')).toBeTruthy();
    expect(page.byId('game-map-pin-poi:2', false)).toBeFalsy();

    // the smallest sub-zone named there, and the coordinates as the game says them
    page.hoverAt(501, 334);
    expect(page.tooltip()).toBe('Goldshire 50.0, 50.0');
    page.hoverAt(100, 100);
    expect(page.tooltip()).toBe('Northshire 10.0, 15.0');
    page.hoverAt(1001, 667);
    expect(page.tooltip()).toContain('Elwynn Forest');
    page.picture().click();
    expect(host.goTos.at(-1)?.mapId).toBe(0);
    expect(host.goTos.at(-1)?.position.z).toBe(55);
    page.hoverAt(501, 334);
    page.picture().click();
    expect(host.goTos.at(-1)?.position).toEqual({ x: -9000, y: -250, z: 55 });
    page.picture().dispatchEvent(new PointerEvent('pointerleave'));
    page.fixture.detectChanges();
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    page.picture().click();
    expect(host.goTos).toHaveLength(2);

    // a pin goes to its spawn
    page.byId('game-map-pin-creature:1').nativeElement.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    page.click('game-map-pin-creature:1');
    expect(host.goTos.at(-1)?.position).toEqual({ x: -9000, y: 0, z: 50 });

    // the maps inside the zone: a mine, Naxxramas (reached from here in this test)
    const inside = page.byId<HTMLSelectElement>('game-map-children').nativeElement;
    expect([...inside.options].map((o) => o.textContent?.trim())).toEqual(['WORLD_EDITOR.GAME_MAP_INSIDE', 'Fargodeep Mine', 'Naxxramas']);
    inside.value = 'area:1001';
    inside.dispatchEvent(new Event('change'));
    page.fixture.detectChanges();
    expect(page.title()).toBe('Fargodeep Mine');
    expect(page.byId('game-map-children', false)).toBeFalsy();
    page.click('game-map-back');

    page.click('game-map-load-zone');
    expect(host.regions).toEqual([bounds(-10000, -8000, -2000, 1500)]);
  });

  it('goes back to the continent, where zones glow and say their levels, and opens them', async () => {
    const { page } = await setup();
    page.click('game-map-back');
    expect(page.title()).toBe('Eastern Kingdoms');
    await settle(page);
    expect(page.byId('game-map-load-zone', false)).toBeFalsy();
    // Eversong Woods' innkeeper, from Outland's map, is drawn on the Eastern Kingdoms
    expect(page.byId('game-map-pin-poi:3')).toBeTruthy();
    expect(page.byId('game-map-pin-poi:4', false)).toBeFalsy();
    // Elwynn: from 41% to 50% across, 71% to 79% down
    page.hoverAt(457, 501);
    expect(page.byId('game-map-glow').nativeElement.style.width).toMatch(/^8\.7/);
    expect(page.tooltip()).toBe('Elwynn Forest WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_ALLIANCE');
    // the city glowing more than the zone around it
    page.hoverAt(Math.round(((18000 - 1000) / 40000) * 1002), Math.round(((12000 + 8500) / 28000) * 668));
    expect(page.tooltip()).toBe('Stormwind City WORLD_EDITOR.GAME_MAP_CITY WORLD_EDITOR.GAME_MAP_SANCTUARY');
    page.hoverAt(463, 549);
    expect(page.tooltip()).toBe('Duskwood WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_HORDE');
    page.hoverAt(532, 525);
    expect(page.tooltip()).toBe('Redridge Mountains');
    // Westfall has no glow: nothing under the pointer there
    page.hoverAt(515, 560);
    expect(page.byId('game-map-glow', false)).toBeFalsy();
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    page.picture().click();
    expect(page.title()).toBe('Eastern Kingdoms');
    // Eversong Woods: contested, no levels
    page.hoverAt(565, 120);
    expect(page.tooltip()).toBe('Eversong Woods WORLD_EDITOR.GAME_MAP_CONTESTED');
    page.hoverAt(457, 501);
    page.picture().click();
    page.fixture.detectChanges();
    expect(page.title()).toBe('Elwynn Forest');
  });

  it('goes up to the world and cosmic maps, whose worlds light up', async () => {
    const { page } = await setup();
    page.click('game-map-back');
    page.click('game-map-back');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');
    await settle(page);
    // the Eastern Kingdoms on the right
    page.hoverAt(900, 300);
    expect(page.tooltip()).toBe('Eastern Kingdoms');
    // Kalimdor: no such page in this client's data
    page.hoverAt(200, 400);
    expect(page.tooltip()).toBe('');
    page.picture().click();
    page.fixture.detectChanges();
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');
    page.click('game-map-back');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_COSMIC');
    expect(page.byId('game-map-back', false)).toBeFalsy();
    page.hoverAt(309, 228);
    expect(page.byId('game-map-ring')).toBeTruthy();
    page.hoverAt(5, 5);
    expect(page.byId('game-map-ring', false)).toBeFalsy();
    // in the circle's square, out of the circle
    page.hoverAt(148, 67);
    expect(page.byId('game-map-ring', false)).toBeFalsy();
    // Outland: its picture can't be read
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    page.hoverAt(309, 228);
    page.picture().click();
    await settle(page);
    expect(page.byId('game-map-no-picture')).toBeTruthy();
    page.click('game-map-camera');
    expect(page.title()).toBe('Elwynn Forest');
  });

  it('switches between the floors of an instance', async () => {
    const { page, host } = await setup((h) => {
      h.mapId.set(533);
      h.camera.set({ x: 3200, y: -3100, z: 1 });
      h.zoneId.set(0);
    });
    expect(page.title()).toBe('Naxxramas – WORLD_EDITOR.GAME_MAP_FLOOR');
    expect(page.byId('game-map-floor-area:535:1').nativeElement.classList).toContain('btn-light');
    page.click('game-map-floor-area:535:2');
    expect(page.byId('game-map-floor-area:535:2').nativeElement.classList).toContain('btn-light');
    page.hoverAt(10, 10);
    expect(page.tooltip()).toContain('Naxxramas');
    page.click('game-map-back');
    expect(page.title()).toBe('Elwynn Forest');
    // a zone of another map: no spawns, and a click goes there on the ground
    expect(page.byId('game-map-pin-creature:1', false)).toBeFalsy();
    page.hoverAt(501, 334);
    page.picture().click();
    expect(host.goTos.at(-1)?.mapId).toBe(0);
    expect(host.goTos.at(-1)?.position.z).toBe(0);
  });

  it('names the picture of its own an instance has besides its floors', async () => {
    const { page } = await setup((h) => {
      h.mapId.set(603);
      h.camera.set({ x: 1600, y: -100, z: 1 });
    });
    expect(page.title()).toBe('Ulduar – WORLD_EDITOR.GAME_MAP_FLOOR');
    page.click('game-map-floor-area:529');
    expect(page.byId('game-map-floor-area:529').nativeElement.textContent?.trim()).toBe('WORLD_EDITOR.GAME_MAP_OUTSIDE');
    expect(page.title()).toBe('Ulduar');
  });

  it('opens the world map without a camera, and says when the world map cannot be read', async () => {
    const { page } = await setup((h) => h.camera.set(undefined));
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');
    expect(page.byId('game-map-camera-pin', false)).toBeFalsy();
    page.hoverAt(900, 300);
    page.picture().click();
    await settle(page);
    page.hoverAt(457, 501);
    page.picture().click();
    page.fixture.detectChanges();
    expect(page.title()).toBe('Elwynn Forest');
    page.hoverAt(501, 334);
    page.picture().click();
    expect(page.fixture.componentInstance.goTos.at(-1)?.position.z).toBe(0);
    // a picture with no size yet: the pointer isn't read
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 0, 0));
    page.hoverAt(10, 10);
    expect(page.tooltip()).toContain('50.0, 50.0');

    client.getGameMap.mockRejectedValueOnce(new Error('no client'));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failed = await setup();
    expect(failed.page.byId('game-map-failed')).toBeTruthy();
  });

  it('shows the kinds of points of interest chosen, kept on this computer', async () => {
    const { page } = await setup();
    page.click('game-map-filters-btn');
    expect(page.byId('game-map-filters')).toBeTruthy();
    page.click('game-map-poi-bank');
    expect(page.byId('game-map-pin-poi:2')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(GAME_MAP_POIS_KEY) as string)).toContain('bank');
    page.click('game-map-poi-flight');
    expect(page.byId('game-map-pin-poi:0', false)).toBeFalsy();
    page.click('game-map-pois-none');
    expect(page.byId('game-map-pin-poi:1', false)).toBeFalsy();
    page.click('game-map-pois-all');
    expect(page.byId('game-map-pin-poi:0')).toBeTruthy();
    page.click('game-map-filters-btn');
    expect(page.byId('game-map-filters', false)).toBeFalsy();
  });
});
