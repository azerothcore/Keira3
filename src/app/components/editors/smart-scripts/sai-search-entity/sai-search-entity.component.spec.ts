import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiSearchEntityComponent } from './sai-search-entity.component';
import { SaiSearchEntityModule } from './sai-search-entity.module';
import { PageObject } from '../../../../test-utils/page-object';
import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';

class SaiSearchEntityComponentPage extends PageObject<SaiSearchEntityComponent> {
  get sourceTypeSelect() { return this.query<HTMLSelectElement>('select#source_type'); }
  get entryOrGuidInput() { return this.query<HTMLInputElement>('input#entryorguid', false); }
  get entryOrGuidLabel() { return this.query<HTMLLabelElement>('label[for="entryorguid"]', false); }
  get editBtn() { return this.query<HTMLButtonElement>('#edit-btn', false); }
  get creatureSelector() { return this.query<HTMLElement>('app-creature-selector-btn', false); }
  get gameobjectSelector() { return this.query<HTMLElement>('app-gameobject-selector-btn', false); }
}

describe('SaiSearchEntityComponent', () => {
  let component: SaiSearchEntityComponent;
  let fixture: ComponentFixture<SaiSearchEntityComponent>;
  let page: SaiSearchEntityComponentPage;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SaiSearchEntityModule,
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaiSearchEntityComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    page = new SaiSearchEntityComponentPage(fixture);
  });

  it('initially should only display the sourceType', () => {
    expect(page.sourceTypeSelect).toBeTruthy();
    expect(page.entryOrGuidInput).toBeFalsy();
    expect(page.entryOrGuidLabel).toBeFalsy();
    expect(page.editBtn).toBeFalsy();
  });

  it('selecting a sourceType should show everything else', () => {
    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[0].value);

    expect(page.sourceTypeSelect).toBeTruthy();
    expect(page.entryOrGuidInput).toBeTruthy();
    expect(page.entryOrGuidLabel).toBeTruthy();
    expect(page.editBtn).toBeTruthy();
  });

  it('the btn should be disabled when entryOrGuid has an invalid value', () => {
    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[0].value);
    expect(page.editBtn.disabled).toBe(true);

    page.setInputValue(page.entryOrGuidInput, 123);
    expect(page.editBtn.disabled).toBe(false);

    page.setInputValue(page.entryOrGuidInput, 'e');
    expect(page.editBtn.disabled).toBe(true);
  });

  it('changing sourceType should update the displayed label and selector', () => {
    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[0].value); // SAI_TYPE_CREATURE

    expect(page.entryOrGuidLabel.innerText).toContain('2) Select an Entry(+) or manually insert a GUID(-)');
    expect(page.creatureSelector).toBeTruthy();
    expect(page.gameobjectSelector).toBeFalsy();

    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[1].value); // SAI_TYPE_GAMEOBJECT

    expect(page.entryOrGuidLabel.innerText).toContain('2) Select an Entry(+) or manually insert a GUID(-)');
    expect(page.creatureSelector).toBeFalsy();
    expect(page.gameobjectSelector).toBeTruthy();

    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[2].value); // SAI_TYPE_AREATRIGGER

    expect(page.entryOrGuidLabel.innerText).toContain('Insert an ID');
    expect(page.creatureSelector).toBeFalsy();
    expect(page.gameobjectSelector).toBeFalsy();

    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[3].value); // SAI_TYPE_TIMED_ACTIONLIST

    expect(page.entryOrGuidLabel.innerText).toContain('Insert an ID');
    expect(page.creatureSelector).toBeFalsy();
    expect(page.gameobjectSelector).toBeFalsy();
  });

  it('clicking the edit button should correctly trigger the service', () => {
    const entry = 123;
    const selectFromEntitySpy = spyOn(TestBed.get(SaiHandlerService), 'selectFromEntity');

    page.setInputValue(page.sourceTypeSelect, page.sourceTypeSelect.options[0].value);
    page.setInputValue(page.entryOrGuidInput, entry);
    page.clickElement(page.editBtn);

    expect(selectFromEntitySpy).toHaveBeenCalledTimes(1);
    expect(selectFromEntitySpy).toHaveBeenCalledWith(0, entry);
  });
});
