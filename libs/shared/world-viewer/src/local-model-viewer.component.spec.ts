import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { M2Mesh, WowClientService } from '@keira/shared/wow-data';
import { PageObject } from '@keira/shared/test-utils';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { LocalModelViewerComponent } from './local-model-viewer.component';
import { WORLD_RENDERER_FACTORY } from './world-renderer';

class LocalModelViewerPage extends PageObject<LocalModelViewerComponent> {
  canvas(): DebugHtmlElement<HTMLCanvasElement> {
    return this.getDebugElementByCss('canvas');
  }
  state(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByTestId('local-model-state', assert);
  }
  async settle(): Promise<void> {
    for (let i = 0; i < 20; i++) {
      await Promise.resolve();
      await this.whenStable();
    }
    this.fixture.detectChanges();
  }
}

/** A one-triangle model with one texture slot. */
const triangle = (): M2Mesh =>
  ({
    positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 2]),
    normals: new Float32Array(9),
    uvs: new Float32Array(6),
    indices: new Uint16Array([0, 1, 2]),
    batches: [{ start: 0, count: 3, geoset: 0, blend: 0, alpha: 1, textureType: 0, texture: 'skin.blp' }],
    attachments: [],
  }) as unknown as M2Mesh;

describe(LocalModelViewerComponent.name, () => {
  const setup = (
    client: Partial<Record<keyof WowClientService, unknown>>,
    kind: 'creature' | 'gameobject' | 'item' = 'creature',
    displayId = 5,
    inventoryType?: number,
  ) => {
    const renderer = { setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() };
    TestBed.configureTestingModule({
      imports: [LocalModelViewerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WowClientService, useValue: { getTexture: vi.fn().mockResolvedValue(undefined), ...client } },
        { provide: WORLD_RENDERER_FACTORY, useValue: () => renderer },
      ],
    });
    const page = new LocalModelViewerPage(TestBed.createComponent(LocalModelViewerComponent));
    const failed = vi.fn();
    page.fixture.componentInstance.failed.subscribe(failed);
    page.fixture.componentRef.setInput('kind', kind);
    page.fixture.componentRef.setInput('displayId', displayId);
    page.fixture.componentRef.setInput('inventoryType', inventoryType);
    page.fixture.detectChanges();
    return { page, renderer, failed };
  };

  it('draws a creature display from the game data, turned by dragging and zoomed by scrolling', async () => {
    const getCreatureDisplay = vi.fn().mockResolvedValue({
      model: 'creature/human.m2',
      scale: 2,
      textures: {},
      attachments: [{ point: 11, model: 'item/helm.m2', texture: 'helm.blp' }],
    });
    const body = { ...triangle(), attachments: [{ id: 11, bone: 0, position: [0, 0, 2] }] };
    const getM2 = vi.fn((path: string) =>
      Promise.resolve(path === 'creature/human.m2' ? body : { ...triangle(), batches: [{ ...triangle().batches[0], texture: undefined }] }),
    );
    const { page, renderer, failed } = setup({ getCreatureDisplay, getM2 });
    expect(page.state().nativeElement.textContent).toContain('loading');
    await page.settle();

    expect(getCreatureDisplay).toHaveBeenCalledWith(5);
    expect(getM2).toHaveBeenCalledWith('item/helm.m2');
    expect(page.state(false)).toBeFalsy();
    expect(renderer.render).toHaveBeenCalledTimes(1);
    expect(failed).not.toHaveBeenCalled();

    const canvas = page.canvas().nativeElement;
    canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 5 }));
    expect(renderer.render).toHaveBeenCalledTimes(1);
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 30 }));
    canvas.dispatchEvent(new PointerEvent('pointerup'));
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 1 }));
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -1 }));
    expect(renderer.render).toHaveBeenCalledTimes(4);

    page.fixture.destroy();
    expect(renderer.dispose).toHaveBeenCalled();
  });

  it('draws an item alone from its display, its texture in the object slot', async () => {
    const getItemDisplayInfo = vi.fn().mockResolvedValue({ models: ['Sword_1H.mdx', ''], textures: ['Sword_1H', ''] });
    const getM2 = vi.fn().mockResolvedValue(triangle());
    const { page, renderer, failed } = setup({ getItemDisplayInfo, getM2 }, 'item', 400, 13);
    await page.settle();

    expect(getItemDisplayInfo).toHaveBeenCalledWith(400);
    expect(getM2).toHaveBeenCalledWith('Item\\ObjectComponents\\Weapon\\Sword_1H.m2');
    expect(renderer.render).toHaveBeenCalled();
    expect(failed).not.toHaveBeenCalled();
  });

  it('says it cannot draw an item without a display or worn on the body', async () => {
    const missing = setup({ getItemDisplayInfo: vi.fn().mockResolvedValue(undefined) }, 'item', 400, 13);
    await missing.page.settle();
    expect(missing.failed).toHaveBeenCalledWith('display 400 is not in the game data');
    TestBed.resetTestingModule();
    const chest = setup({ getItemDisplayInfo: vi.fn().mockResolvedValue({ models: ['Robe', ''], textures: ['', ''] }) }, 'item', 401, 5);
    await chest.page.settle();
    expect(chest.failed).toHaveBeenCalledWith('display 401 is not in the game data');
  });

  it('draws a gameobject display, and shows the next display asked for', async () => {
    const getGameObjectDisplay = vi.fn().mockResolvedValue('world/chest.m2');
    const { page, renderer } = setup({ getGameObjectDisplay, getM2: vi.fn().mockResolvedValue(triangle()) }, 'gameobject', 7);
    await page.settle();
    expect(renderer.render).toHaveBeenCalled();

    page.fixture.componentRef.setInput('displayId', 8);
    page.fixture.detectChanges();
    await page.settle();
    expect(getGameObjectDisplay).toHaveBeenLastCalledWith(8);
    expect(page.state(false)).toBeFalsy();
  });

  it('says why it cannot draw a display: not in the game data, a building, unreadable, an error', async () => {
    const cases: [Partial<Record<keyof WowClientService, unknown>>, 'creature' | 'gameobject', string][] = [
      [{ getCreatureDisplay: vi.fn().mockResolvedValue(undefined) }, 'creature', 'display 5 is not in the game data'],
      [{ getGameObjectDisplay: vi.fn().mockResolvedValue(undefined) }, 'gameobject', 'display 5 is not in the game data'],
      [{ getGameObjectDisplay: vi.fn().mockResolvedValue('world/ship.wmo') }, 'gameobject', 'world/ship.wmo is a building'],
      [
        {
          getCreatureDisplay: vi.fn().mockResolvedValue({ model: 'a.m2', scale: 1, textures: {} }),
          getM2: vi.fn().mockResolvedValue(undefined),
        },
        'creature',
        'a.m2 could not be read',
      ],
      [{ getCreatureDisplay: vi.fn().mockRejectedValue(new Error('no archive')) }, 'creature', 'no archive'],
      [{ getCreatureDisplay: vi.fn().mockRejectedValue('down') }, 'creature', 'down'],
    ];
    for (const [client, kind, reason] of cases) {
      TestBed.resetTestingModule();
      const { page, failed } = setup(client, kind);
      await page.settle();
      expect(page.state().nativeElement.textContent).toContain(reason);
      expect(failed).toHaveBeenCalledWith(expect.stringContaining(reason));
    }
  });

  it('drops a display read for a display no longer asked for', async () => {
    let answer!: (display: unknown) => void;
    const getCreatureDisplay = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => (answer = resolve)))
      .mockResolvedValue(undefined);
    const getM2 = vi.fn().mockResolvedValue(triangle());
    const { page, renderer, failed } = setup({ getCreatureDisplay, getM2 });

    page.fixture.componentRef.setInput('displayId', 6);
    page.fixture.detectChanges();
    await page.settle();
    answer({ model: 'old.m2', scale: 1, textures: {} });
    await page.settle();

    expect(failed).toHaveBeenCalledTimes(1);
    expect(renderer.render).not.toHaveBeenCalled();

    // (an error for an old display isn't said either)
    TestBed.resetTestingModule();
    let reject!: (error: Error) => void;
    const late = setup({
      getCreatureDisplay: vi
        .fn()
        .mockImplementationOnce(() => new Promise((_, no) => (reject = no)))
        .mockResolvedValue({ model: 'b.m2', scale: 0, textures: {} }),
      getM2,
    });
    late.page.fixture.componentRef.setInput('displayId', 9);
    late.page.fixture.detectChanges();
    await late.page.settle();
    reject(new Error('old'));
    await late.page.settle();
    expect(late.failed).not.toHaveBeenCalled();
    expect(late.renderer.render).toHaveBeenCalled();
  });
});
