import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_WORLD_RENDER_SETTINGS,
  drawDistances,
  WORLD_RENDER_SETTINGS_KEY,
  WorldRenderSettingsService,
} from './world-render-settings';

describe('WorldRenderSettingsService', () => {
  beforeEach(() => localStorage.clear());

  it('starts with the defaults', () => {
    expect(TestBed.inject(WorldRenderSettingsService).settings()).toEqual(DEFAULT_WORLD_RENDER_SETTINGS);
  });

  it('saves changes and restores them, ignoring invalid stored values', () => {
    TestBed.inject(WorldRenderSettingsService).update({ lowDetailTerrain: true, drawDistance: 400 });
    const stored = JSON.parse(localStorage.getItem(WORLD_RENDER_SETTINGS_KEY) as string);
    expect(stored.lowDetailTerrain).toBe(true);

    localStorage.setItem(WORLD_RENDER_SETTINGS_KEY, JSON.stringify({ ...stored, showModels: 'yes' }));
    TestBed.resetTestingModule();
    const restored = TestBed.inject(WorldRenderSettingsService).settings();
    expect(restored.lowDetailTerrain).toBe(true);
    expect(restored.drawDistance).toBe(400);
    expect(restored.showModels).toBe(true);
  });

  it('resets to the defaults', () => {
    const service = TestBed.inject(WorldRenderSettingsService);
    service.update({ terrainRadius: 3 });
    service.reset();
    expect(service.settings()).toEqual(DEFAULT_WORLD_RENDER_SETTINGS);
  });

  it('survives corrupted storage', () => {
    localStorage.setItem(WORLD_RENDER_SETTINGS_KEY, '{nope');
    expect(TestBed.inject(WorldRenderSettingsService).settings()).toEqual(DEFAULT_WORLD_RENDER_SETTINGS);
  });

  it('gives one distance to every group, or each its own in advanced mode', () => {
    const settings = { ...DEFAULT_WORLD_RENDER_SETTINGS, drawDistance: 100 };
    expect(drawDistances(settings)).toEqual({ largeDoodads: 100, smallDoodads: 100, creatures: 100, gameobjects: 100 });
    expect(drawDistances({ ...settings, advancedDistances: true, smallDoodadDistance: 0 })).toEqual({
      largeDoodads: 500,
      smallDoodads: 0,
      creatures: 250,
      gameobjects: 250,
    });
  });
});
