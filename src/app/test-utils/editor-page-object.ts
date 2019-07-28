import { ComponentFixture } from '@angular/core/testing';

import { PageObject } from './page-object';
import { QueryOutputComponentPage } from '../components/editors/shared/query-output/query-output.component.spec';

export abstract class EditorPageObject<T> extends PageObject<T> {
  readonly queryPo: QueryOutputComponentPage;

  get queryTypeSwitchWrapper() { return this.query<HTMLDivElement>('.query-type-switch'); }

  constructor(
    protected fixture: ComponentFixture<T>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    super(fixture, config);
    this.queryPo = new QueryOutputComponentPage(fixture as ComponentFixture<any>);
  }

  getInput(name: string) {
    return this.query<HTMLInputElement>(`#${name}`);
  }

  expectDiffQueryHidden() {
    expect(this.queryTypeSwitchWrapper.hidden).toBe(true, 'Expected query switch to be hidden');
    this.queryPo.expectFullQueryToBeShown();
  }

  expectFullQueryToContain(expectedQuery: string) {
    expect(this.queryPo.fullQueryWrapper.innerText).toContain(expectedQuery);
  }
}
