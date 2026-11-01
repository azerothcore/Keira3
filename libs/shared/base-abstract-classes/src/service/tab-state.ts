import { signal, WritableSignal } from '@angular/core';

/**
 * What an editor tab keeps of its part of Keira (Creature, Quest…) while another tab of the same part is shown: the
 * entity its handler selected, and what its editors loaded and changed. Keira's handlers and editors are one per part,
 * so a tab hands them its own state back when it's shown again.
 */

/** A handler or editor taking part (they register themselves when made). */
interface Stateful {
  [key: string]: unknown;
}

/** (Keira's handlers and editors are made once and live as long as Keira.) */
const registered = new Set<Stateful>();

/** Called by every handler and editor when made. */
export function registerTabState(service: object): void {
  registered.add(service as Stateful);
}

/** The handlers and editors made. */
const alive = (): Stateful[] => [...registered];

/**
 * The part of Keira (first path segment) of a handler: its `tabSection` when it says (the creature's SmartAI handler
 * is Creature's, though its editor's route is SmartAI's), else from its editor's route.
 */
function handlerSection(handler: Stateful): string | undefined {
  const own = handler['tabSection'];
  const path = typeof own === 'string' ? own : handler['mainEditorRoutePath'];
  return typeof path === 'string' ? path.replace(/^\//, '').split('/')[0] : undefined;
}

const isHandler = (service: Stateful): boolean => 'mainEditorRoutePath' in service;
const isEditor = (service: Stateful): boolean => 'handlerService' in service && '_form' in service;

function sectionOf(service: Stateful): string | undefined {
  return isHandler(service) ? handlerSection(service) : handlerSection((service['handlerService'] ?? {}) as Stateful);
}

const NOT_PLAIN = Symbol('not plain');
/**
 * Not copied: other services, the subscriptions, the forms (kept apart), the status signals (kept apart), and the
 * count of tabs an editor has served (it only goes up: a query sent for a tab no longer shown is dropped).
 */
const SKIPPED = new Set([
  'subscriptions',
  'router',
  'queryService',
  'toastrService',
  'handlerService',
  '_form',
  '_statusMap',
  '_tabGeneration',
]);

/** A deep copy of plain data (numbers, strings, arrays, plain objects); NOT_PLAIN for anything else. */
function copyPlain(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'function' || typeof value === 'symbol' ? NOT_PLAIN : value;
  }
  if (Array.isArray(value)) {
    const items = value.map(copyPlain);
    return items.includes(NOT_PLAIN) ? NOT_PLAIN : items;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return NOT_PLAIN;
  }
  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    const itemCopy = copyPlain(item);
    if (itemCopy === NOT_PLAIN) {
      return NOT_PLAIN;
    }
    copy[key] = itemCopy;
  }
  return copy;
}

/** A service's fields: plain data copied, the rest (an error, rows with binary values…) kept as it is. */
function copyFields(service: Stateful): { fields: Record<string, unknown>; kept: Record<string, unknown> } {
  const fields: Record<string, unknown> = {};
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(service)) {
    if (SKIPPED.has(key) || typeof value === 'function') {
      continue;
    }
    const copy = copyPlain(value);
    if (copy === NOT_PLAIN) {
      kept[key] = value;
    } else {
      fields[key] = copy;
    }
  }
  // (a query still running for this tab is dropped when it comes: it isn't loading when it's shown again)
  if ('_loading' in fields) {
    fields['_loading'] = false;
  }
  return { fields, kept };
}

/** Starts a new tab in an editor: what it was asked before is dropped when it answers. */
function nextGeneration(editor: Stateful): void {
  editor['_tabGeneration'] = Number(editor['_tabGeneration'] ?? 0) + 1;
}

type StatusMap = Record<string, WritableSignal<boolean>>;
const statusMap = (handler: Stateful): StatusMap => (handler['_statusMap'] ?? {}) as StatusMap;

interface ServiceState {
  service: Stateful;
  fields: Record<string, unknown>;
  kept: Record<string, unknown>;
  form?: unknown;
  status?: Record<string, boolean>;
}

/** A tab's part of Keira, as it left it. */
export interface SectionState {
  section: string;
  services: ServiceState[];
  /** Whether it has changes not executed yet (then they're kept as they are, not read again). */
  unsaved: boolean;
}

/** Takes what the handlers and editors of a part hold now. */
export function captureSection(section: string): SectionState {
  const services = alive()
    .filter((service) => (isHandler(service) || isEditor(service)) && sectionOf(service) === section)
    .map((service) => {
      const state: ServiceState = { service, ...copyFields(service) };
      if (isEditor(service)) {
        state.form = service['_form'];
      } else {
        state.status = Object.fromEntries(Object.entries(statusMap(service)).map(([table, changed]) => [table, changed()]));
      }
      return state;
    });
  const unsaved = services.some((state) => Object.values(state.status ?? {}).some(Boolean));
  return { section, services, unsaved };
}

/**
 * Gives a part's handlers and editors back a tab's state. Without changes pending, its editors read their rows again
 * when shown (what another tab executed meanwhile shows up).
 */
export function restoreSection(state: SectionState): void {
  // (the editors made after the tab left start empty in it)
  const saved = new Set(state.services.map(({ service }) => service));
  resetSection(state.section, (service) => !saved.has(service));
  for (const { service, fields, kept, form, status } of state.services) {
    Object.assign(service, copyPlain(fields), kept);
    if (form) {
      nextGeneration(service);
      service['_form'] = form;
      if (!state.unsaved) {
        service['_loadedEntityId'] = undefined;
      }
    }
    for (const [table, changed] of Object.entries(status ?? {})) {
      const map = statusMap(service);
      if (map[table]) {
        map[table].set(changed);
      } else {
        map[table] = signal(changed);
      }
    }
  }
}

/** What an empty editor holds (those of its fields it has). */
const EMPTY_EDITOR: Record<string, () => unknown> = {
  _loadedEntityId: () => undefined,
  _originalValue: () => undefined,
  _originalRows: () => [],
  _newRows: () => [],
  _selectedRowId: () => undefined,
  _diffQuery: () => '',
  _fullQuery: () => '',
  _error: () => undefined,
  _errors: () => [],
  _loading: () => false,
  _isNew: () => false,
};

/**
 * Empties a part's handlers and editors (a new tab of it, or the one holding them closed): nothing selected, each
 * editor empty with a form of its own. `only` picks some of them.
 */
export function resetSection(section: string, only: (service: Stateful) => boolean = () => true): void {
  for (const service of alive()) {
    if (sectionOf(service) !== section || !only(service)) {
      continue;
    }
    if (isEditor(service)) {
      nextGeneration(service);
      for (const [key, empty] of Object.entries(EMPTY_EDITOR)) {
        if (key in service) {
          service[key] = empty();
        }
      }
      (service['initForm'] as () => void).call(service);
    } else if (isHandler(service)) {
      service['_selected'] = undefined;
      service['selectedName'] = undefined;
      service['isNew'] = false;
      service['forceReload'] = false;
      for (const changed of Object.values(statusMap(service))) {
        changed.set(false);
      }
    }
  }
}
