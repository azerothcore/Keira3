import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { GAMEOBJECT_FLAGS } from '@keira-constants/flags/gameobject-flags';
import { GameobjectTemplateAddon } from '@keira-types/gameobject-template-addon.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-gameobject-template-addon',
  templateUrl: './gameobject-template-addon.component.html',
  styleUrls: ['./gameobject-template-addon.component.scss'],
})
export class GameobjectTemplateAddonComponent extends SingleRowEditorComponent<GameobjectTemplateAddon> {
  readonly GAMEOBJECT_FLAGS = GAMEOBJECT_FLAGS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GameobjectTemplateAddonService, public handlerService: GameobjectHandlerService) {
    super(editorService, handlerService);
  }
}
