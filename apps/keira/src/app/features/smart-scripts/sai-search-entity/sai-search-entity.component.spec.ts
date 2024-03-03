import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { TranslateTestingModule } from '@keira/test-utils';
import { PageObject } from '@keira/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SaiSearchEntityComponent } from './sai-search-entity.component';
import { SaiSearchEntityModule } from './sai-search-entity.module';

class SaiSearchEntityComponentPage extends PageObject<SaiSearchEntityComponent> {
  get entryOrGuidInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#entryorguid', false);
  }
  get entryOrGuidLabel(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label[for="entryorguid"]', false);
  }
  get editBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#edit-btn', false);
  }
  get creatureSelector(): HTMLElement {
    return this.query<HTMLElement>('keira-creature-selector-btn', false);
  }
  get gameobjectSelector(): HTMLElement {
    return this.query<HTMLElement>('keira-gameobject-selector-btn', false);
  }
  get sourceTypeCreature(): HTMLSelectElement {
    return this.query<HTMLSelectElement>('.radio-container label#SAI_TYPE_CREATURE');
  }
  get sourceTypeGameobject(): HTMLSelectElement {
    return this.query<HTMLSelectElement>('.radio-container label#SAI_TYPE_GAMEOBJECT');
  }
  get sourceTypeAreatrigger(): HTMLSelectElement {
    return this.query<HTMLSelectElement>('.radio-container label#SAI_TYPE_AREATRIGGER');
  }
  get sourceTypeTimedActionlist(): HTMLSelectElement {
    return this.query<HTMLSelectElement>('.radio-container label#SAI_TYPE_TIMED_ACTIONLIST');
  }
}

describe('SaiSearchEntityComponent', () => {
  let fixture: ComponentFixture<SaiSearchEntityComponent>;
  let page: SaiSearchEntityComponentPage;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SaiSearchEntityModule, RouterTestingModule, TranslateTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaiSearchEntityComponent);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    page = new SaiSearchEntityComponentPage(fixture);
  });

  it('initially should only display the sourceType', () => {
    expect(page.sourceTypeCreature).toBeTruthy();
    expect(page.sourceTypeGameobject).toBeTruthy();
    expect(page.sourceTypeAreatrigger).toBeTruthy();
    expect(page.sourceTypeTimedActionlist).toBeTruthy();
    expect(page.entryOrGuidInput).toBeFalsy();
    expect(page.entryOrGuidLabel).toBeFalsy();
    expect(page.editBtn).toBeFalsy();
  });

  it('selecting a sourceType should show everything else', () => {
    page.clickElement(page.sourceTypeCreature);

    expect(page.entryOrGuidInput).toBeTruthy();
    expect(page.entryOrGuidLabel).toBeTruthy();
    expect(page.editBtn).toBeTruthy();
  });

  it('the btn should be disabled when entryOrGuid has an invalid value', () => {
    page.clickElement(page.sourceTypeCreature);
    expect(page.editBtn.disabled).toBe(true);

    page.setInputValue(page.entryOrGuidInput, 123);
    expect(page.editBtn.disabled).toBe(false);

    page.setInputValue(page.entryOrGuidInput, 'e');
    expect(page.editBtn.disabled).toBe(true);
  });

  it('changing sourceType should update the displayed label and selector', () => {
    page.clickElement(page.sourceTypeCreature);

    expect(page.entryOrGuidLabel.innerText).toContain(
      'Insert a negative number to select a GUID(-) or a positive number to select an Entry(+)',
    );
    expect(page.creatureSelector).toBeTruthy();
    expect(page.gameobjectSelector).toBeFalsy();

    page.clickElement(page.sourceTypeGameobject);

    expect(page.entryOrGuidLabel.innerText).toContain(
      'Insert a negative number to select a GUID(-) or a positive number to select an Entry(+)',
    );
    expect(page.creatureSelector).toBeFalsy();
    expect(page.gameobjectSelector).toBeTruthy();

    page.clickElement(page.sourceTypeAreatrigger);

    expect(page.entryOrGuidLabel.innerText).toContain('Insert the Areatrigger ID');
    expect(page.creatureSelector).toBeFalsy();
    expect(page.gameobjectSelector).toBeFalsy();

    page.clickElement(page.sourceTypeTimedActionlist);

    expect(page.entryOrGuidLabel.innerText).toContain(
      `TimedActionlists IDs are composed by the Creature's Entry followed by a 2-digits number`,
    );
    expect(page.creatureSelector).toBeFalsy();
    expect(page.gameobjectSelector).toBeFalsy();
  });

  it('clicking the edit button should correctly trigger the service', () => {
    const entry = 123;
    const selectFromEntitySpy = spyOn(TestBed.inject(SaiHandlerService), 'selectFromEntity');

    page.clickElement(page.sourceTypeCreature);
    page.setInputValue(page.entryOrGuidInput, entry);
    page.clickElement(page.editBtn);

    expect(selectFromEntitySpy).toHaveBeenCalledTimes(1);
    expect(selectFromEntitySpy).toHaveBeenCalledWith(0, entry);
  });
});
