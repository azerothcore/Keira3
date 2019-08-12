import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateModule } from './gameobject-template.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { GameobjectTemplate } from '../../../../types/gameobject-template.type';
import { GameobjectHandlerService } from '../../../../services/handlers/gameobject-handler.service';

class GameobjectTemplatePage extends EditorPageObject<GameobjectTemplateComponent> {}

fdescribe('GameobjectTemplate integration tests', () => {
  let component: GameobjectTemplateComponent;
  let fixture: ComponentFixture<GameobjectTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectTemplatePage;

  const id = 1234;

  const originalEntity = new GameobjectTemplate();
  originalEntity.entry = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectTemplateModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(GameobjectTemplateComponent);
    component = fixture.componentInstance;
    page = new GameobjectTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

});

/* TODO: complete this integration */

