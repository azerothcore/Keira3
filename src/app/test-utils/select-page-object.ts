import { PageObject } from './page-object';

export abstract class SelectPageObject<T> extends PageObject<T> {
  ID_FIELD: string;

  get createInput() { return this.query<HTMLInputElement>('app-create input#id'); }
  get selectNewBtn() { return this.query<HTMLButtonElement>('app-create #select-button'); }
  get freeStatusWrapper() { return this.query<HTMLDivElement>('#id-free-status'); }

  get queryWrapper() { return this.query<HTMLElement>('code.hljs'); }

  get searchIdInput() { return this.query<HTMLInputElement>('input#search-id'); }
  get searchNameInput() { return this.query<HTMLInputElement>('input#name'); }
  get searchLimitInput() { return this.query<HTMLInputElement>('input#limit'); }
  get searchBtn() { return this.query<HTMLButtonElement>('#search-btn'); }

  get topBar() { return this.query<HTMLElement>('app-top-bar'); }

  expectTopBarCreatingNew(id: number) {
    expect(this.topBar.innerText).toContain(`Creating new: ${id}`);
  }

  expectTopBarEditing(id: number, name: string) {
    expect(this.topBar.innerText).toContain(`Editing: ${name} (${id})`);
  }

  expectNewEntityFree() {
    const error = 'Expected new entity to be free';
    expect(this.selectNewBtn.disabled).toBe(false, error);
    expect(this.freeStatusWrapper.innerHTML).toContain('fa-check-circle', error);
    expect(this.freeStatusWrapper.innerText).toContain(`The ${this.ID_FIELD} is free`, error);
  }

  expectEntityAlreadyInUse() {
    const error = 'Expected new entity to be already in use';
    expect(this.selectNewBtn.disabled).toBe(true, error);
    expect(this.freeStatusWrapper.innerHTML).toContain('fa-times-circle', error);
    expect(this.freeStatusWrapper.innerText).toContain(`The ${this.ID_FIELD} is already in use`, error);
  }
}
