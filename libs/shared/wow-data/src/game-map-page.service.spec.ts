import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GameMapData } from './game-map';
import { GameMapPageService, imageDataUrl } from './game-map-page.service';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';

const bounds = { minX: -100, maxX: 100, minY: -200, maxY: 200 };
const none = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
const data = (): GameMapData => ({
  areas: [
    { id: 687, mapId: 109, areaId: 1477, folder: 'TheTempleOfAtalHakkar', bounds: none, parent: 0, defaultFloor: 1 },
    { id: 700, mapId: 600, areaId: 0, folder: 'Nowhere', bounds: none, parent: 0, defaultFloor: 0 },
    { id: 701, mapId: 601, areaId: 99, folder: 'Picture', bounds, parent: 0, defaultFloor: 0 },
  ],
  overlays: [],
  floors: [
    { id: 1, mapId: 109, floor: 1, bounds, parent: 0 },
    { id: 2, mapId: 109, floor: 2, bounds: { minX: 500, maxX: 600, minY: 500, maxY: 600 }, parent: 0 },
  ],
  transforms: [],
  zones: new Map([[1477, { name: "The Temple of Atal'Hakkar", flags: 0 }]]),
});

describe('GameMapPageService', () => {
  const setup = (options: { supported?: boolean; clientPath?: string; picture?: boolean } = {}) => {
    const image = { width: 2, height: 1, data: new Uint8Array(8) };
    const client = {
      isSupported: () => options.supported ?? true,
      getGameMap: vi.fn(() => Promise.resolve(data())),
      getGameMapPicture: vi.fn(() => Promise.resolve(options.picture === false ? undefined : { image })),
    };
    TestBed.configureTestingModule({ providers: [{ provide: WowClientService, useValue: client }] });
    TestBed.inject(WowDataSettingsService).save({ clientPath: options.clientPath ?? '/wow', serverDataPath: '' });
    const context = { putImageData: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,x');
    vi.stubGlobal(
      'ImageData',
      class {
        constructor(
          readonly data: Uint8ClampedArray,
          readonly width: number,
          readonly height: number,
        ) {}
      },
    );
    return { service: TestBed.inject(GameMapPageService), client, context };
  };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("shows a dungeon's floor from the client, its picture made once", async () => {
    const { service, client, context } = setup();

    const shown = await service.pageAt(109, 10, 20);

    expect(shown?.page.kind).toBe('floor');
    expect(shown?.page.bounds).toEqual(bounds);
    expect(shown?.name).toBe("The Temple of Atal'Hakkar (1)");
    expect(shown?.imageUrl).toBe('data:image/png;base64,x');
    expect(context.putImageData).toHaveBeenCalled();

    expect((await service.pageAt(109, 550, 550))?.page.floor).toBe(2);
    await service.pageAt(109, 11, 21);
    expect(client.getGameMap).toHaveBeenCalledTimes(1);
    expect(client.getGameMapPicture).toHaveBeenCalledTimes(2);
  });

  it('names a zone page by its folder when the zone has no name, and shows nothing off the pages', async () => {
    const { service } = setup();

    expect((await service.pageAt(601, 0, 0))?.name).toBe('Picture');
    expect(await service.pageAt(600, 0, 0)).toBeUndefined();
  });

  it('shows nothing without the client, or without a picture', async () => {
    expect(await setup({ supported: false }).service.pageAt(109, 10, 20)).toBeUndefined();
    TestBed.resetTestingModule();
    expect(await setup({ clientPath: '' }).service.pageAt(109, 10, 20)).toBeUndefined();
    TestBed.resetTestingModule();
    expect(await setup({ picture: false }).service.pageAt(109, 10, 20)).toBeUndefined();
  });

  it('reads the client again after a failure', async () => {
    const { service, client } = setup();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    client.getGameMap.mockReturnValueOnce(Promise.reject(new Error('no client')));

    expect(await service.pageAt(109, 10, 20)).toBeUndefined();
    expect(await service.pageAt(109, 10, 20)).toBeDefined();
  });

  it('reads a picture again after a failure', async () => {
    const { service, client } = setup();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    client.getGameMapPicture.mockReturnValueOnce(Promise.reject(new Error('bad blp')));

    expect(await service.pageAt(109, 10, 20)).toBeUndefined();
    expect(await service.pageAt(109, 10, 20)).toBeDefined();
  });

  it('makes no picture without a canvas', () => {
    const document = { createElement: () => ({ getContext: () => null }) } as unknown as Document;
    expect(imageDataUrl({ width: 1, height: 1, data: new Uint8Array(4) }, document)).toBeUndefined();
  });
});
