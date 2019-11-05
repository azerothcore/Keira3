import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiSearchEntityComponent } from './sai-search-entity.component';
import { SaiSearchEntityModule } from './sai-search-entity.module';
import { PageObject } from '../../../../test-utils/page-object';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
