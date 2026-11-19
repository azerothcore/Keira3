import { signal, WritableSignal } from '@angular/core';
import { captureSection, registerTabState, resetSection, restoreSection } from './tab-state';

/** A handler of a part (its editor's route gives the part, or its own `tabSection`). */
class Handler {
  _selected: string | undefined = undefined;
  selectedName: string | undefined = undefined;
  isNew = false;
  forceReload = false;
  _statusMap: Record<string, WritableSignal<boolean>> = { table: signal(false) };
  cache = new Map<string, string>();
  callback = () => 1;
  tags = ['a'];
  options: Record<string, unknown> = { make: () => 1 };
  nothing = null;
  sym = Symbol('x');
  constructor(
    readonly mainEditorRoutePath: string | undefined,
    readonly tabSection?: string,
  ) {
    registerTabState(this);
  }
}

class Editor {
  _form: object = { name: 'form 0' };
  _loadedEntityId: string | undefined = undefined;
  _newRows: { id: number; at?: Date }[] = [];
  _error: Error | undefined = undefined;
  _loading = false;
  _originalValue: object | undefined = undefined;
  _originalRows: object[] = [];
  _selectedRowId: number | undefined = undefined;
  _diffQuery = '';
  _fullQuery = '';
  _errors: string[] = [];
  _isNew = false;
  forms = 0;
  constructor(readonly handlerService: Handler | undefined) {
    registerTabState(this);
  }
  initForm(): void {
    this._form = { name: `form ${++this.forms}` };
  }
}

describe('tab state', () => {
  it("keeps a part's handlers and editors, gives them back, and empties them", () => {
    const handler = new Handler('/quest/quest-template');
    const editor = new Editor(handler);
    const other = new Handler('creature/creature-template');
    const sai = new Handler('smart-ai/editors', 'quest');
    // (an editor of no handler, a handler of no route: in no part; a handler without statuses; something else)
    new Editor(undefined);
    new Handler(undefined);
    const plain = new Handler('quest/x');
    delete (plain as Partial<Handler>)._statusMap;
    registerTabState({ handlerService: handler });

    Object.assign(handler, { _selected: '1', selectedName: 'One' });
    handler._statusMap['table'].set(true);
    const error = new Error('failed');
    Object.assign(editor, { _loadedEntityId: '1', _newRows: [{ id: 1, at: new Date(0) }], _error: error, _loading: true });
    sai._selected = 's1';
    other._selected = 'c';
    const form1 = editor._form;
    const state = captureSection('quest');
    expect(state.unsaved).toBe(true);
    expect(state.services.map(({ service }) => service)).toEqual([handler, editor, sai, plain]);

    // another tab: emptied, a form of its own, answers to the earlier tab dropped
    resetSection('quest');
    expect([handler._selected, handler.selectedName, handler.isNew, handler._statusMap['table']()]).toEqual([
      undefined,
      undefined,
      false,
      false,
    ]);
    expect(sai._selected).toBeUndefined();
    expect(editor._form).not.toBe(form1);
    expect([editor._loadedEntityId, editor._newRows, editor._error, editor._loading]).toEqual([undefined, [], undefined, false]);
    expect((editor as Editor & { _tabGeneration: number })._tabGeneration).toBe(1);
    expect(other._selected).toBe('c');
    handler._selected = '2';
    handler._statusMap['new_table'] = signal(true);

    // back: as it was (not loading), its form, its error; a status this tab didn't have is set
    restoreSection(state);
    expect([handler._selected, handler.selectedName, handler._statusMap['table']()]).toEqual(['1', 'One', true]);
    expect(editor._form).toBe(form1);
    expect(editor._loadedEntityId).toBe('1');
    expect(editor._newRows[0].at).toEqual(new Date(0));
    expect(editor._error).toBe(error);
    expect(editor._loading).toBe(false);
    expect((editor as Editor & { _tabGeneration: number })._tabGeneration).toBe(2);
    expect(handler.tags).toEqual(['a']);
    expect(sai._selected).toBe('s1');

    // without changes pending, its editors read their rows again; a status the part didn't have yet is made
    handler._statusMap['table'].set(false);
    handler._statusMap['new_table'].set(false);
    const saved = captureSection('quest');
    delete handler._statusMap['table'];
    restoreSection(saved);
    expect(editor._loadedEntityId).toBeUndefined();
    expect(handler._statusMap['table']()).toBe(false);

    // an editor made after the tab left starts empty when it comes back
    const later = new Editor(handler);
    later._loadedEntityId = '9';
    // (an editor without some of the fields: they aren't added)
    delete (later as Partial<Editor>)._isNew;
    restoreSection(saved);
    expect(later._loadedEntityId).toBeUndefined();
    expect(later.forms).toBe(1);
    expect('_isNew' in later).toBe(false);
  });
});
