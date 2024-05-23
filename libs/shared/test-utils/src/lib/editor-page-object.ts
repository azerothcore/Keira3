import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableRow } from '@keira/shared/constants';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PageObject } from './page-object';
import { QueryOutputComponentPage } from './query-output-page-object';

export abstract class EditorPageObject<T> extends PageObject<T> {
  readonly PREVIEW_CONTAINER_SELECTOR = '.preview-container';
  protected readonly queryPo: QueryOutputComponentPage<unknown>;

  get queryTypeSwitchWrapper(): HTMLDivElement {
    return this.query<HTMLDivElement>('.query-type-switch');
  }

  constructor(
    protected override fixture: ComponentFixture<T>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    super(fixture, config);
    this.queryPo = new QueryOutputComponentPage(fixture as ComponentFixture<any>);
  }

  changeAllFields<E extends TableRow>(entity: E, excludedFields: string[] = [], values: (string | number)[] = []): void {
    let i = 0;
    for (const field of Object.getOwnPropertyNames(entity)) {
      if (!excludedFields.includes(field)) {
        if (!this.getInputById(field).disabled) {
          if (this.getInputById(field) instanceof HTMLSelectElement) {
            const value = values.length ? values[i] : i;
            this.setSelectValueById(field, value);
          } else {
            this.setInputValueById(field, i);
          }

          i++;
        }
      }
    }
  }

  clickExecuteQuery(): void {
    this.clickElement(this.queryPo.executeBtn);
  }

  clickCopyQuery(): void {
    this.clickElement(this.queryPo.copyBtn);
  }

  setSelectValueById(inputId: string, value: string | number): void {
    /*
     * the <select> value is always "index: value"
     * index is the position index of the <option> tag
     * value is the option value (ngValue)
     *
     * usually, the index matches the ngValue if the value is an auto-increment number
     * otherwise, it could not match and in the tests, we specify the full select value as "index: value" and not only "x"
     */

    if (typeof value === 'string') {
      this.setInputValueById(inputId, `${value}`); // value = "index: value"
    } else {
      this.setInputValueById(inputId, `${value}: ${value}`); // the value is a number that matches the index
    }
  }

  getSelectorBtn(name: string, assert = true): HTMLButtonElement {
    return this.query<HTMLButtonElement>(`#${name}-selector-btn`, assert);
  }

  getCellOfTableExternal(tableSelector: string, rowIndex: number, colIndex: number): HTMLTableCellElement {
    const element = document.querySelector<HTMLTableCellElement>(
      `${tableSelector} tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`,
    ) as HTMLTableCellElement;
    expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${tableSelector}`);
    return element;
  }

  toggleFlagInRowExternal(rowIndex: number): void {
    const cell = this.getCellOfTableExternal('#flags-table', rowIndex, 0);
    const toggleSelector = 'ui-switch';
    const toggleElement = cell.querySelector<HTMLElement>(toggleSelector) as HTMLElement;
    expect(toggleElement).toBeTruthy(`Unable to find ${toggleSelector}`);
    this.clickElement(toggleElement);
  }

  clickModalSelect(): void {
    this.clickElement(this.queryOutsideComponent('#modal-select-btn'));

    // TODO: this shouldn't be necessary, but for some reasons the modal does not close so we manually close it
    //  see: https://stackoverflow.com/questions/57279830/ngx-bootstrap-modal-does-not-hide-during-test
    const modalService: BsModalService = TestBed.inject(BsModalService);
    modalService.hide();
  }

  clickModalCancel(): void {
    this.clickElement(this.queryOutsideComponent('#modal-cancel-btn'));
  }

  expectModalDisplayed(): void {
    this.queryOutsideComponent('.modal-content', true);
  }

  expectModalHidden(): void {
    expect(this.queryOutsideComponent('.modal-content', false)).toBeFalsy('Expected modal to be hidden');
  }

  clickSearchBtn(): void {
    this.clickElement(this.queryOutsideComponent('#search-btn'));
  }

  expectQuerySwitchToBeHidden(): void {
    expect(this.queryTypeSwitchWrapper.hidden).toBe(true, 'Expected query switch to be hidden');
  }

  expectFullQueryToBeShown(): void {
    this.queryPo.expectFullQueryToBeShown();
  }

  expectDiffQueryToBeShown(): void {
    this.queryPo.expectDiffQueryToBeShown();
  }

  expectFullQueryToContain(expectedQuery: string): void {
    // can be useful when finding the correct query after an intended change:
    // console.log(this.queryPo.fullQueryWrapper.innerText);
    expect(this.queryPo.fullQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectDiffQueryToContain(expectedQuery: string): void {
    // can be useful when finding the correct query after an intended change:
    console.log(this.queryPo.diffQueryWrapper.innerText);
    expect(this.queryPo.diffQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectAllQueriesToContain(expectedQuery: string): void {
    this.expectDiffQueryToContain(expectedQuery);
    this.expectFullQueryToContain(expectedQuery);
  }

  expectFullQueryToBeEmpty(): void {
    expect(this.queryPo.fullQueryWrapper.innerText).toEqual('');
  }

  expectDiffQueryToBeEmpty(): void {
    expect(this.queryPo.diffQueryWrapper.innerText).toEqual('');
  }
}
