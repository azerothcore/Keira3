import { Injectable, signal } from '@angular/core';

/** How a search of one table (or all of them, "default") matches and how many rows it gives. */
export interface SearchSettings {
  /** A number typed (`120`) is looked up exactly (`= 120`), not as a part (`LIKE '%120%'`). */
  exactNumbers?: boolean;
  /** Text typed is looked up exactly (`= 'Hogger'`), not as a part. */
  exactNames?: boolean;
  /** The rows a search gives at first. */
  limit?: number;
}

/** How the editors behave (Settings > Editors). */
export interface EditorSettings {
  /** "Execute & copy" copies the query only when it ran (a failed one keeps the changes, uncopied). */
  copyOnlyOnSuccess: boolean;
  /** A flags or mask column changed is updated by its bits (`flags = (flags | 2) & ~1`), keeping bits set meanwhile. */
  bitwiseFlags: boolean;
  /** By table ("default" for those not set). */
  search: Record<string, SearchSettings>;
}

export const EDITOR_SETTINGS_KEY = 'keira3.editorSettings';
export const DEFAULT_SEARCH_LIMIT = 50;

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  copyOnlyOnSuccess: true,
  bitwiseFlags: true,
  search: { default: { exactNumbers: false, exactNames: false, limit: DEFAULT_SEARCH_LIMIT } },
};

/** The tables whose search can be set apart (the main ones; the rest follow "default"). */
export const SEARCH_TABLES = [
  'creature_template',
  'gameobject_template',
  'quest_template',
  'item_template',
  'smart_scripts',
  'conditions',
  'gossip_menu',
  'pool_template',
  'npc_text',
  'broadcast_text',
  'spell_dbc',
  'game_tele',
  'trainer',
];

@Injectable({ providedIn: 'root' })
export class EditorSettingsService {
  readonly settings = signal<EditorSettings>(this.load());

  save(settings: Partial<EditorSettings>): void {
    const next = { ...this.settings(), ...settings };
    this.settings.set(next);
    try {
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // (storage blocked: kept until Keira closes)
    }
  }

  /** Changes how one table's search (or "default") works; an empty value follows "default" again. */
  saveSearch(table: string, changes: SearchSettings): void {
    const current = { ...this.settings().search[table], ...changes };
    const cleaned = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== undefined)) as SearchSettings;
    this.save({ search: { ...this.settings().search, [table]: cleaned } });
  }

  /** How a table's search works: its own settings over "default". */
  search(table: string): Required<SearchSettings> {
    const { default: base, [table]: own } = this.settings().search;
    return {
      exactNumbers: own?.exactNumbers ?? base?.exactNumbers ?? false,
      exactNames: own?.exactNames ?? base?.exactNames ?? false,
      limit: own?.limit ?? base?.limit ?? DEFAULT_SEARCH_LIMIT,
    };
  }

  private load(): EditorSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(EDITOR_SETTINGS_KEY) ?? '{}') as Partial<EditorSettings>;
      return {
        copyOnlyOnSuccess:
          typeof stored.copyOnlyOnSuccess === 'boolean' ? stored.copyOnlyOnSuccess : DEFAULT_EDITOR_SETTINGS.copyOnlyOnSuccess,
        bitwiseFlags: typeof stored.bitwiseFlags === 'boolean' ? stored.bitwiseFlags : DEFAULT_EDITOR_SETTINGS.bitwiseFlags,
        search:
          stored.search && typeof stored.search === 'object' && !Array.isArray(stored.search)
            ? { ...DEFAULT_EDITOR_SETTINGS.search, ...stored.search }
            : DEFAULT_EDITOR_SETTINGS.search,
      };
    } catch {
      return DEFAULT_EDITOR_SETTINGS;
    }
  }
}
