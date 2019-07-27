import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CreatureTemplateAddonModule } from './creature-template-addon.module';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';

class CreatureTemplateAddonPage extends EditorPageObject<CreatureTemplateAddonComponent> {}

describe('CreatureTemplateAddonComponent', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateAddonPage;

  const id = '1234';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateAddonModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    handlerService = TestBed.get(CreatureHandlerService);
    handlerService['_selected'] = id;
    handlerService.isNew = false;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    // TODO: spyOn QueryService.selectAll and return a mock initial entity

    fixture = TestBed.createComponent(CreatureTemplateAddonComponent);
    component = fixture.componentInstance;
    page = new CreatureTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    // page.setInputValue(page.getInput('path_id'), '3');

    expect(component).toBeTruthy();
  });
});
