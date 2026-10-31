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

const registered = new Set<WeakRef<Stateful>>();

/** Called by every handler and editor when made. */
export function registerTabState(service: object): void {
  registered.add(new WeakRef(service as Stateful));
}

/** The handlers and editors alive. */
function alive(): Stateful[] {
  const services: Stateful[] = [];
  for (const ref of registered) {
    const service = ref.deref();
    if (service) {
      services.push(service);
    } else {
      /* istanbul ignore next */ // (collected by the garbage collector: can't be made to happen in a test)
      registered.delete(ref);
    }
  }
  return services;
}

/** The part of Keira (first path segment) of a handler: from its editor's route. */
function handlerSection(handler: Stateful): string | undefined {
  const path = handler['mainEditorRoutePath'];
  return typeof path === 'string' ? path.replace(/^\//, '').split('/')[0] : undefined;
}

const isHandler = (service: Stateful): boolean => 'mainEditorRoutePath' in service;
const isEditor = (service: Stateful): boolean => 'handlerService' in service && '_form' in service;

function sectionOf(service: Stateful): string | undefined {
  return isHandler(service) ? handlerSection(service) : handlerSection((service['handlerService'] ?? {}) as Stateful);
}

const NOT_PLAIN = Symbol('not plain');
/** Not copied: other services, the subscriptions, the forms (kept apart), the status signals (kept apart). */
const SKIPPED = new Set(['subscriptions', 'router', 'queryService', 'toastrService', 'handlerService', '_form', '_statusMap']);

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

function copyFields(service: Stateful): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(service)) {
    const copy = SKIPPED.has(key) ? NOT_PLAIN : copyPlain(value);
    if (copy !== NOT_PLAIN) {
      fields[key] = copy;
    }
  }
  return fields;
}

type StatusMap = Record<string, WritableSignal<boolean>>;
const statusMap = (handler: Stateful): StatusMap => (handler['_statusMap'] ?? {}) as StatusMap;

interface ServiceState {
  service: Stateful;
  fields: Record<string, unknown>;
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
      const state: ServiceState = { service, fields: copyFields(service) };
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
  for (const { service, fields, form, status } of state.services) {
    Object.assign(service, copyPlain(fields));
    if (form) {
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

/** Empties a part's handlers and editors (a new tab of it): nothing selected, each editor with a form of its own. */
export function resetSection(section: string): void {
  for (const service of alive()) {
    if (sectionOf(service) !== section) {
      continue;
    }
    if (isEditor(service)) {
      service['_loadedEntityId'] = undefined;
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
