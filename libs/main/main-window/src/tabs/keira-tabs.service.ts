import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { KeepAliveRouteStrategy } from './keep-alive.strategy';

/** An open tab: a part of Keira (its first path segment), and the page of it last shown. */
export interface KeiraTab {
  section: string;
  url: string;
}

/** The sidebar's names of Keira's parts, by their first path segment. */
const SECTION_NAMES: Record<string, string> = {
  '': 'SIDEBAR.DASHBOARD',
  creature: 'SIDEBAR.CREATURE.TITLE',
  quest: 'SIDEBAR.QUEST.TITLE',
  gameobject: 'SIDEBAR.GAME_OBJECT.TITLE',
  item: 'SIDEBAR.ITEM.TITLE',
  'other-loots': 'SIDEBAR.OTHER_LOOTS.TITLE',
  texts: 'SIDEBAR.TEXTS.TITLE',
  gossip: 'SIDEBAR.GOSSIP.TITLE',
  waypoints: 'SIDEBAR.WAYPOINTS.TITLE',
  pools: 'SIDEBAR.POOLS.TITLE',
  scripts: 'SIDEBAR.SCRIPTS.TITLE',
  conditions: 'SIDEBAR.CONDITIONS.TITLE',
  'smart-ai': 'SIDEBAR.SMARTAI.TITLE',
  spell: 'SIDEBAR.SPELL_DBC_OVERRIDES.TITLE',
  'game-tele': 'SIDEBAR.GAME_TELE.TITLE',
  'creature-immunities': 'SIDEBAR.CREATURE_IMMUNITIES.TITLE',
  trainer: 'SIDEBAR.TRAINER.TITLE',
  'unused-guid-search': 'SIDEBAR.UNUSED_GUID_SEARCH',
  'world-editor': 'SIDEBAR.WORLD_EDITOR',
  'sql-editor': 'SIDEBAR.SQL_EDITOR',
  settings: 'SIDEBAR.SETTINGS',
};

/** The first page of each part (where a new tab of it opens), in the order the launcher lists them. */
export const SECTION_START: [string, string][] = [
  ['', '/'],
  ['world-editor', '/world-editor'],
  ['creature', '/creature/select'],
  ['quest', '/quest/select'],
  ['gameobject', '/gameobject/select'],
  ['item', '/item/select'],
  ['other-loots', '/other-loots/select-reference'],
  ['texts', '/texts/select-page-text'],
  ['gossip', '/gossip/select'],
  ['waypoints', '/waypoints/select'],
  ['pools', '/pools/select'],
  ['scripts', '/scripts/select-script-waypoint'],
  ['conditions', '/conditions/select'],
  ['smart-ai', '/smart-ai/search-existing'],
  ['spell', '/spell/select'],
  ['game-tele', '/game-tele/select'],
  ['creature-immunities', '/creature-immunities/select'],
  ['trainer', '/trainer/select'],
  ['unused-guid-search', '/unused-guid-search'],
  ['sql-editor', '/sql-editor'],
  ['settings', '/settings'],
];

/** "creature-template" → "Creature Template". */
const humanize = (segment: string): string => segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** A url's part of Keira (its first segment) and page (its second). */
export function urlSection(url: string): { section: string; page: string } {
  const [section = '', page = ''] = url.replace(/^\//, '').split(/[?#]/)[0].split('/');
  return { section, page };
}

/**
 * Keira's tabs, like a browser's: each part opened (the World Editor, Creature, Quest…) gets a tab that remembers the
 * page last shown in it, so going back and forth never loses one; the World Editor stays alive in its tab.
 */
@Injectable({ providedIn: 'root' })
export class KeiraTabsService {
  private readonly router = inject(Router);
  private readonly strategy = inject(KeepAliveRouteStrategy);
  private readonly _tabs = signal<KeiraTab[]>([]);
  readonly tabs = this._tabs.asReadonly();
  private readonly _active = signal('');
  /** The section shown. */
  readonly active = this._active.asReadonly();

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      const url = event.urlAfterRedirects;
      const { section } = urlSection(url);
      this._active.set(section);
      const tabs = this._tabs();
      const open = tabs.find((tab) => tab.section === section);
      this._tabs.set(open ? tabs.map((tab) => (tab === open ? { section, url } : tab)) : [...tabs, { section, url }]);
    });
  }

  /** The name of a tab (the sidebar's for its part, then its page). */
  titleKey(tab: KeiraTab): string {
    return SECTION_NAMES[tab.section] ?? humanize(tab.section);
  }

  pageName(tab: KeiraTab): string {
    const { page } = urlSection(tab.url);
    return page ? humanize(page) : '';
  }

  show(tab: KeiraTab): void {
    void this.router.navigateByUrl(tab.url);
  }

  /** Whether a part has a tab open. */
  isOpen(section: string): boolean {
    return this._tabs().some((tab) => tab.section === section);
  }

  /** Opens a part from the launcher: its tab when open, else a new tab at its first page. */
  launch(section: string): void {
    const open = this._tabs().find((tab) => tab.section === section);
    void this.router.navigateByUrl(open ? open.url : (SECTION_START.find(([key]) => key === section) as [string, string])[1]);
  }

  /** Closes a tab (a kept page lets go): the one shown closes to the tab before it (the next, for the first). */
  close(tab: KeiraTab): void {
    const tabs = this._tabs();
    const index = tabs.indexOf(tab);
    const rest = tabs.filter((other) => other !== tab);
    this._tabs.set(rest);
    // (the page kept is let go once it's no longer shown)
    if (tab.section === this._active() && rest.length) {
      void this.router.navigateByUrl(rest[Math.max(0, index - 1)].url).then(() => this.strategy.drop(tab.section));
    } else {
      this.strategy.drop(tab.section);
    }
  }
}
