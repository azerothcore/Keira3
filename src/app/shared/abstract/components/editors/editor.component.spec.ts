import { EditorComponent } from './editor.component';
import { MockEntity } from '@keira-testing/mock-services';
import { EditorService } from '../../service/editors/editor.service';
import { HandlerService } from '../../service/handlers/handler.service';
import { Component } from '@angular/core';

@Component({})
class MockComponent extends EditorComponent<MockEntity> {}

describe('EditorComponent', () => {
  const setup = () => {
    const editorService = {
      loadedEntityId: 0,
      reload: jasmine.createSpy('reload'),
      clearCache: jasmine.createSpy('clearCache'),
    };
    const handlerService = { selected: 0 };

    const component = new MockComponent(
      editorService as unknown as EditorService<MockEntity>,
      handlerService as unknown as HandlerService<MockEntity>,
    );

    return { component, editorService, handlerService };
  };

  it('ngOnInit() should reload if the selected entity has not been loaded yet', () => {
    const { component, handlerService, editorService } = setup();
    const id = 123;
    handlerService.selected = id;
    editorService.loadedEntityId = id + 1;

    component.ngOnInit();

    expect(editorService.clearCache).toHaveBeenCalledTimes(1);
    expect(editorService.reload).toHaveBeenCalledTimes(1);
    expect(editorService.reload).toHaveBeenCalledWith(id);
  });

  it('ngOnInit() should NOT reload if the selected entity has already been loaded', () => {
    const { component, handlerService, editorService } = setup();
    const id = 123;
    handlerService.selected = id;
    editorService.loadedEntityId = id;

    component.ngOnInit();

    expect(editorService.reload).toHaveBeenCalledTimes(0);
  });
});
