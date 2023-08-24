import { PageObject } from './page-object';

export abstract class SelectPageObject<T> extends PageObject<T> {
  ID_FIELD: string;

  get createInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('keira-create input#id');
  }
  get selectNewBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('keira-create #select-button');
  }
  get freeStatusWrapper(): HTMLDivElement {
    return this.query<HTMLDivElement>('#id-free-status');
  }

  get searchIdInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#search-id');
  }
  get searchNameInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#name');
  }
  get searchScriptNameInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#ScriptName');
  }
  get searchLimitInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#limit');
  }
  get searchBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#search-btn');
  }

  get topBar(): HTMLElement {
    return this.query<HTMLElement>('keira-top-bar');
  }

  expectTopBarCreatingNew(id: number): void {
    expect(this.topBar.innerText).toContain(`Creating new: ${id}`);
  }

  expectTopBarEditing(id: number, name: string): void {
    expect(this.topBar.innerText).toContain(`Editing: ${name} (${id})`);
  }

  expectNewEntityFree(): void {
    const error = 'Expected new entity to be free';
    expect(this.selectNewBtn.disabled).toBe(false, error);
    expect(this.freeStatusWrapper.innerHTML).toContain('fa-check-circle', error);
    expect(this.freeStatusWrapper.innerText).toContain(`CREATE.FREE_ENTRY CREATE.FREE`, error);
  }

  expectEntityAlreadyInUse(): void {
    const error = 'Expected new entity to be already in use';
    expect(this.selectNewBtn.disabled).toBe(true, error);
    expect(this.freeStatusWrapper.innerHTML).toContain('fa-times-circle', error);
    expect(this.freeStatusWrapper.innerText).toContain(`CREATE.FREE_ENTRY CREATE.ALREADY_USE`, error);
  }
}
