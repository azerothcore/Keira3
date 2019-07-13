import Spy = jasmine.Spy;

import { EditorComponent } from './editor.component';
import { MockEntity } from '../../../test-utils/mock-services';
import { EditorService } from '../../../services/editors/editor.service';
import { HandlerService } from '../../../services/handlers/handler.service';

class MockComponent extends EditorComponent<MockEntity> {}

describe('EditorComponent', () => {
  let component: EditorComponent<MockEntity>;
  let reloadSpy: Spy;

  const editorService = { loadedEntityId: 0, reload: () => {} };
  const handlerService = { selected: 0 };

  beforeEach(() => {
    reloadSpy = spyOn(editorService, 'reload');

    component = new MockComponent(
      editorService as unknown as EditorService<MockEntity>,
      handlerService as unknown as HandlerService<MockEntity>,
    );
  });

  it('ngOnInit() should reload if the selected entity has not been loaded yet', () => {
    const id = 123;
    handlerService.selected = id;
    editorService.loadedEntityId = id + 1;

    component.ngOnInit();

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledWith(id);
  });

  it('ngOnInit() should NOT reload if the selected entity has already been loaded', () => {
    const id = 123;
    handlerService.selected = id;
    editorService.loadedEntityId = id;

    component.ngOnInit();

    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });
});
