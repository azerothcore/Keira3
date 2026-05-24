import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { SaiSearchEntityComponent } from './sai-search-entity.component';

class SaiSearchEntityComponentPage extends EditorPageObject<SaiSearchEntityComponent> {
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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SaiSearchEntityComponent, RouterTestingModule, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(SaiSearchEntityComponent);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    const page = new SaiSearchEntityComponentPage(fixture);

    return { fixture, page };
  }

  it('initially should only display the sourceType', () => {
    const { page } = setup();
    expect(page.sourceTypeCreature).toBeTruthy();
    expect(page.sourceTypeGameobject).toBeTruthy();
    expect(page.sourceTypeAreatrigger).toBeTruthy();
    expect(page.sourceTypeTimedActionlist).toBeTruthy();
    expect(page.entryOrGuidInput).toBeFalsy();
    expect(page.entryOrGuidLabel).toBeFalsy();
    expect(page.editBtn).toBeFalsy();
  });

  it('selecting a sourceType should show everything else', () => {
    const { page } = setup();
    page.clickElement(page.sourceTypeCreature);

    expect(page.entryOrGuidInput).toBeTruthy();
    expect(page.entryOrGuidLabel).toBeTruthy();
    expect(page.editBtn).toBeTruthy();
  });

  it('the btn should be disabled when entryOrGuid has an invalid value', () => {
    const { page } = setup();
    page.clickElement(page.sourceTypeCreature);
    expect(page.editBtn.disabled).toBe(true);

    page.setInputValue(page.entryOrGuidInput, 123);
    expect(page.editBtn.disabled).toBe(false);

    page.setInputValue(page.entryOrGuidInput, 'e');
    expect(page.editBtn.disabled).toBe(true);
  });

  it('changing sourceType should update the displayed label and selector', () => {
    const { page } = setup();
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

  it('the Edit SmartAI button is absent until a source type is chosen', () => {
    const { page } = setup();
    expect(page.editBtn).toBeFalsy();

    page.clickElement(page.sourceTypeCreature);
    expect(page.editBtn).toBeTruthy();
  });

  it('picking a creature from the selector modal sets entryorguid', async () => {
    const { page } = setup();
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(mysqlQueryService, 'query').mockReturnValue(of([{ entry: 1234, name: 'TestCreature' }]));

    page.clickElement(page.sourceTypeCreature);
    await page.whenReady();

    const picked = await page.openSelectorAndPickRow('entryorguid', 0, { clickSearch: true });

    expect(picked).toBe('1234');
    expect(page.entryOrGuidInput.value).toBe('1234');
  });

  it('picking a gameobject from the selector modal sets entryorguid', async () => {
    const { page } = setup();
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(mysqlQueryService, 'query').mockReturnValue(of([{ entry: 5678, name: 'TestGo' }]));

    page.clickElement(page.sourceTypeGameobject);
    await page.whenReady();

    const picked = await page.openSelectorAndPickRow('entryorguid', 0, { clickSearch: true });

    expect(picked).toBe('5678');
    expect(page.entryOrGuidInput.value).toBe('5678');
  });

  it('clicking the edit button should correctly trigger the service', () => {
    const { page } = setup();
    const entry = 123;
    const selectFromEntitySpy = vi.spyOn(TestBed.inject(SaiHandlerService), 'selectFromEntity').mockImplementation(() => undefined);

    page.clickElement(page.sourceTypeCreature);
    page.setInputValue(page.entryOrGuidInput, entry);
    page.clickElement(page.editBtn);

    expect(selectFromEntitySpy).toHaveBeenCalledTimes(1);
    expect(selectFromEntitySpy).toHaveBeenCalledWith(0, entry);
  });
});
