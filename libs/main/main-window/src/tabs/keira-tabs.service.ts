import { computed, inject, Injectable, signal } from '@angular/core';
import { captureSection, resetSection, restoreSection, SectionState } from '@keira/shared/base-abstract-classes';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, Router } from '@angular/router';
import { filter } from 'rxjs';
import { KeepAliveRouteStrategy } from './keep-alive.strategy';

/** An open tab: a part of Keira (its first path segment), the page of it last shown, and its number among that part's. */
export interface KeiraTab {
  id: number;
  section: string;
  url: string;
  /** 1, 2, 3… among the tabs of its part (shown when there's more than one). */
  n: number;
  /** What it left in its part's editors when another tab of the part was shown. */
  state?: SectionState;
}

/** The parts with one page only (opened again, they show their tab). */
export const SINGLE_TAB_SECTIONS = new Set([
  '',
  'world-editor',
  'sql-editor',
  'session-sql',
  'table-browser',
  'find-anywhere',
  'sniff-to-sql',
  'sniffs',
  'settings',
  'unused-guid-search',
]);

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
  'game-events': 'SIDEBAR.GAME_EVENTS.TITLE',
  disables: 'SIDEBAR.DISABLES.TITLE',
  'area-triggers': 'SIDEBAR.AREA_TRIGGERS.TITLE',
  'db-scripts': 'SIDEBAR.DB_SCRIPTS.TITLE',
  'creature-immunities': 'SIDEBAR.CREATURE_IMMUNITIES.TITLE',
  trainer: 'SIDEBAR.TRAINER.TITLE',
  'unused-guid-search': 'SIDEBAR.UNUSED_GUID_SEARCH',
  'world-editor': 'SIDEBAR.WORLD_EDITOR',
  'sql-editor': 'SIDEBAR.SQL_EDITOR',
  'session-sql': 'SIDEBAR.SESSION_SQL',
  'table-browser': 'SIDEBAR.TABLE_BROWSER',
  'find-anywhere': 'SIDEBAR.FIND_ANYWHERE',
  'sniff-to-sql': 'SIDEBAR.SNIFF_TO_SQL',
  sniffs: 'SIDEBAR.SNIFFS',
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
  ['game-events', '/game-events/select'],
  ['disables', '/disables/select'],
  ['area-triggers', '/area-triggers/select'],
  ['db-scripts', '/db-scripts/select-event-scripts'],
  ['creature-immunities', '/creature-immunities/select'],
  ['trainer', '/trainer/select'],
  ['unused-guid-search', '/unused-guid-search'],
  ['sql-editor', '/sql-editor'],
  ['session-sql', '/session-sql'],
  ['table-browser', '/table-browser'],
  ['find-anywhere', '/find-anywhere'],
  ['sniff-to-sql', '/sniff-to-sql'],
  ['sniffs', '/sniffs'],
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
 * page last shown in it, so going back and forth never loses one; the World Editor stays alive in its tab. An editor's
 * part can be opened in more tabs (Creature [1], Creature [2]…), each with its own entity and changes; a tab shown
 * again without changes pending reads its rows again, so what another tab executed shows up.
 */
@Injectable({ providedIn: 'root' })
export class KeiraTabsService {
  private readonly router = inject(Router);
  private readonly strategy = inject(KeepAliveRouteStrategy);
  private readonly _tabs = signal<KeiraTab[]>([]);
  readonly tabs = this._tabs.asReadonly();
  private readonly _activeId = signal<number | undefined>(undefined);
  /** The tab shown. */
  readonly activeId = this._activeId.asReadonly();
  /** The section shown. */
  readonly active = computed(() => this._tabs().find((tab) => tab.id === this._activeId())?.section ?? '');
  private nextId = 1;
  /** The tab a navigation is for (from the tab bar), else the navigation picks one. */
  private pending: number | undefined;
  /** The tab of each part whose state the part's editors hold now (the last of its tabs shown). */
  private readonly owners = new Map<string, number>();

  constructor() {
    // (a navigation that didn't happen leaves nothing waiting)
    this.router.events
      .pipe(filter((event) => event instanceof NavigationCancel || event instanceof NavigationError || event instanceof NavigationSkipped))
      .subscribe(() => {
        this.pending = undefined;
        this.strategy.renew = false;
      });
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      const url = event.urlAfterRedirects;
      const { section } = urlSection(url);
      const tabs = this._tabs();
      const active = tabs.find((tab) => tab.id === this._activeId());
      const target =
        tabs.find((tab) => tab.id === this.pending) ??
        (active?.section === section ? active : tabs.find((tab) => tab.id === this.owners.get(section)));
      this.pending = undefined;
      this.strategy.renew = false;
      if (target) {
        this._tabs.set(tabs.map((tab) => (tab === target ? { ...tab, url } : tab)));
        this._activeId.set(target.id);
      } else {
        const tab: KeiraTab = { id: this.nextId++, section, url, n: this.nextNumber(section) };
        this._tabs.set([...tabs, tab]);
        this._activeId.set(tab.id);
      }
      this.owners.set(section, this._activeId() as number);
    });
  }

  private nextNumber(section: string): number {
    return (
      Math.max(
        0,
        ...this._tabs()
          .filter((tab) => tab.section === section)
          .map((tab) => tab.n),
      ) + 1
    );
  }

  /** The name of a tab (the sidebar's for its part, then its page). */
  titleKey(tab: Pick<KeiraTab, 'section'>): string {
    return SECTION_NAMES[tab.section] ?? humanize(tab.section);
  }

  pageName(tab: KeiraTab): string {
    const { page } = urlSection(tab.url);
    return page ? humanize(page) : '';
  }

  /** Its number, when its part has more tabs open ("[2]"), else ''. */
  number(tab: KeiraTab): string {
    return this._tabs().filter((other) => other.section === tab.section).length > 1 ? `[${tab.n}]` : '';
  }

  /** A test id for a tab: its part, and its number after the first. */
  testId(tab: KeiraTab): string {
    return (tab.section || 'dashboard') + (tab.n > 1 ? `-${tab.n}` : '');
  }

  /** Hands a part's editors to a tab: the state of the tab that had them is kept in it, the tab's own given back. */
  private takeOver(tab: KeiraTab): void {
    const ownerId = this.owners.get(tab.section);
    if (ownerId === tab.id) {
      return;
    }
    const state = captureSection(tab.section);
    this._tabs.set(this._tabs().map((other) => (other.id === ownerId ? { ...other, state } : other)));
    if (tab.state) {
      restoreSection(tab.state);
    } else {
      resetSection(tab.section);
    }
    this.owners.set(tab.section, tab.id);
    // (the page is made again, even when it's the same one: it shows this tab's entity)
    this.strategy.renew = true;
  }

  show(tab: KeiraTab): void {
    this.takeOver(tab);
    this.pending = tab.id;
    void this.router.navigateByUrl(tab.url, { onSameUrlNavigation: 'reload' });
  }

  /** Whether a part has a tab open. */
  isOpen(section: string): boolean {
    return this._tabs().some((tab) => tab.section === section);
  }

  /** Opens a part from the launcher: a new tab at its first page (a part with one page only: its tab when open). */
  launch(section: string): void {
    const open = this._tabs().find((tab) => tab.section === section);
    if (open && SINGLE_TAB_SECTIONS.has(section)) {
      this.show(open);
      return;
    }
    const tab: KeiraTab = { id: this.nextId++, section, url: '', n: this.nextNumber(section) };
    this._tabs.set([...this._tabs(), tab]);
    if (open) {
      this.takeOver(tab);
    }
    this.pending = tab.id;
    // (made again even when its part already shows its first page)
    void this.router.navigateByUrl((SECTION_START.find(([key]) => key === section) as [string, string])[1], {
      onSameUrlNavigation: 'reload',
    });
  }

  /** Closes a tab (a kept page lets go): the one shown closes to the tab before it (the next, for the first). */
  close(tab: KeiraTab): void {
    const tabs = this._tabs();
    const index = tabs.indexOf(tab);
    const rest = tabs.filter((other) => other !== tab);
    this._tabs.set(rest);
    if (this.owners.get(tab.section) === tab.id) {
      // (its entity and changes go with it: the next tab of its part starts empty, or with its own)
      this.owners.delete(tab.section);
      resetSection(tab.section);
    }
    const last = !rest.some((other) => other.section === tab.section);
    const drop = () => last && this.strategy.drop(tab.section);
    // (the page kept is let go once it's no longer shown)
    if (tab.id === this._activeId() && rest.length) {
      this.show(rest[Math.max(0, index - 1)]);
      void Promise.resolve().then(drop);
    } else {
      drop();
    }
  }
}
