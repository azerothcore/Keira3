import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';

import { SaiSearchEntityComponent } from './sai-search-entity.component';
import { SaiSearchEntityModule } from './sai-search-entity.module';
import { PageObject } from '../../../../test-utils/page-object';
import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';
import Spy = jasmine.Spy;
import { SAI_SEARCH_TYPES } from '../../../../types/smart-scripts.type';

class SaiSearchEntityComponentPage extends PageObject<SaiSearchEntityComponent> {
  get sourceTypeSelect() { return this.query<HTMLInputElement>('select#source_type'); }
  get entryOrGuidInput() { return this.query<HTMLInputElement>('input#entryorguid'); }
  get entryOrGuidLabel() { return this.query<HTMLLabelElement>('label[for="entryorguid"]'); }
  get editBtn() { return this.query<HTMLButtonElement>('#edit-btn'); }
}

describe('SaiSearchEntityComponent', () => {
  let component: SaiSearchEntityComponent;
  let fixture: ComponentFixture<SaiSearchEntityComponent>;

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
    fixture.detectChanges();
  });

  it('getter() should correctly works', () => {
    expect(component.typeCreatureSelected).toBe(component.sourceTypeControl.value === SAI_SEARCH_TYPES.SAI_TYPE_CREATURE);
    expect(component.typeGameobjectSelected).toBe(component.sourceTypeControl.value === SAI_SEARCH_TYPES.SAI_TYPE_GAMEOBJECT);
  });

  it('onSelectedTypeChange() should correctly works', () => {
    component.onSelectedTypeChange();

    expect(component.entryOrGuidControl.value).toEqual('');
  });

  it('onEdit() should correctly works', () => {
    const selectFromEntitySpy: Spy = spyOn(TestBed.get(SaiHandlerService), 'selectFromEntity');

    component.onEdit();

    expect(selectFromEntitySpy).toHaveBeenCalledTimes(1);
  });

});
