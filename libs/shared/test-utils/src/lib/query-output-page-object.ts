import { PageObject } from './keira-page-object';

export class QueryOutputComponentPage<ComponentType> extends PageObject<ComponentType> {
  get diffQueryWrapper(): HTMLElement {
    return this.query<HTMLElement>('keira-highlightjs-wrapper#diff-query');
  }
  get fullQueryWrapper(): HTMLElement {
    return this.query<HTMLElement>('keira-highlightjs-wrapper#full-query');
  }

  get diffQueryInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#diff-query-input');
  }
  get fullQueryInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#full-query-input');
  }

  get copyBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#copy-btn');
  }
  get executeBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#execute-btn');
  }
  get executeAndCopyBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#execute-and-copy-btn');
  }
  get reloadBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#reload-btn');
  }

  expectDiffQueryToBeShown() {
    expect(this.isHidden(this.diffQueryWrapper)).toBe(false, 'Expected diff query wrapper NOT to be hidden');
    expect(this.isHidden(this.fullQueryWrapper)).toBe(true, 'Expected full query wrapper to be Hidden');
  }

  expectFullQueryToBeShown() {
    expect(this.isHidden(this.diffQueryWrapper)).toBe(true, 'Expected diff query wrapper to be hidden');
    expect(this.isHidden(this.fullQueryWrapper)).toBe(false, 'Expected full query wrapper NOT to be hidden');
  }
}
