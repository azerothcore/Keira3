import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { Option } from '@keira/shared/constants';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { OptionsSelectorModalComponent } from './options-selector-modal.component';

describe('OptionsSelectorModalComponent', () => {
  const options: Option[] = [
    { value: 11, name: 'MOD_TAUNT' },
    { value: 98, name: 'KNOCK_BACK' },
    { value: 144, name: 'PULL_TOWARDS' },
    { value: 145, name: 'PULL_TOWARDS_DEST Black Hole Effect' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OptionsSelectorModalComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), BsModalRef],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(OptionsSelectorModalComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should safely create without config', () => {
    const { fixture, component } = setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.selectedValues).toEqual([]);
  });

  it('ngOnInit() should seed the selection from the raw value, keeping unknown ids', () => {
    const { component } = setup();
    component.value = ' 145, 98 ,999';
    component.config = { name: 'Effects', options };

    component.ngOnInit();

    expect(component.selectedValues).toEqual([98, 145, 999]);
  });

  it('ngOnInit() should handle a number value', () => {
    const { component } = setup();
    component.value = 98;
    component.config = { name: 'Effects', options };

    component.ngOnInit();

    expect(component.selectedValues).toEqual([98]);
  });

  it('isSelected() should properly work', () => {
    const { component } = setup();
    component.selectedValues = [98, 145];

    expect(component.isSelected(98)).toBe(true);
    expect(component.isSelected(11)).toBe(false);
  });

  it('toggleOption() should add an unselected value, writing the CSV ascending and unique', () => {
    const { component } = setup();
    component.value = '145,98';
    component.config = { name: 'Effects', options };
    component.ngOnInit();

    component.toggleOption(11);

    expect([...component.selectedValues].sort((a, b) => a - b)).toEqual([11, 98, 145]);
    expect(component.value).toEqual('11,98,145');
  });

  it('toggleOption() should remove an already selected value', () => {
    const { component } = setup();
    component.value = '145,98';
    component.config = { name: 'Effects', options };
    component.ngOnInit();

    component.toggleOption(145);

    expect(component.selectedValues).toEqual([98]);
    expect(component.value).toEqual('98');
  });

  it('toggleOption() should empty the CSV when the last selected value is removed', () => {
    const { component } = setup();
    component.value = '98';
    component.config = { name: 'Effects', options };
    component.ngOnInit();

    component.toggleOption(98);

    expect(component.selectedValues).toEqual([]);
    expect(component.value).toEqual('');
  });

  it('toggleOption() should coerce a string value', () => {
    const { component } = setup();
    component.value = '';
    component.config = { name: 'Effects', options };
    component.ngOnInit();

    component.toggleOption('98');

    expect(component.selectedValues).toEqual([98]);
    expect(component.value).toEqual('98');
  });

  it('should render the selected values in a row per option, with the value and the description', () => {
    const { fixture, component } = setup();
    component.value = ' 145, 98 ';
    component.config = { name: 'Effects', options };
    fixture.detectChanges(); // also calls ngOnInit()

    const rows = fixture.nativeElement.querySelectorAll('#options-table tbody tr');
    expect(rows.length).toEqual(options.length);

    // the header cells are <th>, so only the <td> body cells are matched
    const firstRow = fixture.nativeElement.querySelectorAll('#options-table tr:nth-child(1) td');
    expect(firstRow[0].innerText.trim()).toEqual('');
    expect(firstRow[1].innerText.trim()).toEqual('11');
    expect(firstRow[2].innerText.trim()).toEqual('MOD_TAUNT');

    const lastRow = fixture.nativeElement.querySelectorAll('#options-table tr:nth-child(4) td');
    expect(lastRow[1].innerText.trim()).toEqual('145');
    expect(lastRow[2].innerText.trim()).toEqual('PULL_TOWARDS_DEST Black Hole Effect');

    expect(component.isSelected(options[0].value)).toBe(false);
    expect(component.isSelected(options[1].value)).toBe(true);
    expect(component.isSelected(options[3].value)).toBe(true);

    const switchButtonOf = (rowIndex: number) =>
      fixture.nativeElement.querySelector(`#options-table tr:nth-child(${rowIndex}) td:nth-child(1) ui-switch button.switch`);
    expect(switchButtonOf(1).getAttribute('aria-checked')).toEqual('false');
    expect(switchButtonOf(2).getAttribute('aria-checked')).toEqual('true');
    expect(switchButtonOf(3).getAttribute('aria-checked')).toEqual('false');
    expect(switchButtonOf(4).getAttribute('aria-checked')).toEqual('true');

    expect(fixture.nativeElement.querySelector('#switch-opt-11')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#switch-opt-145')).toBeTruthy();
    expect(fixture.nativeElement.innerHTML).toContain('Options selection:');
    expect(fixture.nativeElement.innerHTML).toContain('Effects');
  });

  it('clicking a switch should update the current value', () => {
    const { fixture, component } = setup();
    component.value = '98';
    component.config = { name: 'Effects', options };
    fixture.detectChanges();

    const firstSwitch = fixture.nativeElement.querySelector('#options-table tr:nth-child(1) td:nth-child(1) ui-switch');
    firstSwitch.click();
    fixture.detectChanges();

    expect(component.value).toEqual('11,98');

    firstSwitch.click();
    fixture.detectChanges();

    expect(component.value).toEqual('98');
  });
});
