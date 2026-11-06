import { computed, inject, Injectable, signal } from '@angular/core';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';

/** Where the 3D previews of creatures and gameobjects come from. */
export type ModelViewerSource = 'wowhead' | 'game-data';
export const MODEL_VIEWER_KEY = 'keira3.modelViewer';

/**
 * The 3D previews (creature and gameobject editors, quest preview…) show Wowhead's online models by default, or the
 * models of the game data set in Settings (the client this server uses: its own and patched models), read here.
 */
@Injectable({ providedIn: 'root' })
export class ModelViewerSettingService {
  private readonly client = inject(WowClientService);
  private readonly paths = inject(WowDataSettingsService);
  private readonly _source = signal<ModelViewerSource>(this.load());
  readonly source = this._source.asReadonly();
  /** The game data's models are shown: asked for, in the desktop app, with a client folder set. */
  readonly useGameData = computed(() => this._source() === 'game-data' && this.client.isSupported() && this.paths.isConfigured());

  choose(source: ModelViewerSource): void {
    this._source.set(source);
    try {
      localStorage.setItem(MODEL_VIEWER_KEY, source);
    } catch {
      // (storage blocked: until Keira closes)
    }
  }

  private load(): ModelViewerSource {
    try {
      return localStorage.getItem(MODEL_VIEWER_KEY) === 'game-data' ? 'game-data' : 'wowhead';
    } catch {
      return 'wowhead';
    }
  }
}
