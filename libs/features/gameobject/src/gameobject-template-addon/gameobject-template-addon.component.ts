import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GAMEOBJECT_FLAGS, GameobjectTemplateAddon } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { FactionSelectorBtnComponent, FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-template-addon',
  templateUrl: './gameobject-template-addon.component.html',
  styleUrls: ['./gameobject-template-addon.component.scss'],
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    FactionSelectorBtnComponent,
    FlagsSelectorBtnComponent,
  ],
})
export class GameobjectTemplateAddonComponent extends SingleRowEditorComponent<GameobjectTemplateAddon> {
  readonly GAMEOBJECT_FLAGS = GAMEOBJECT_FLAGS;

  protected override readonly editorService = inject(GameobjectTemplateAddonService);
  readonly handlerService = inject(GameobjectHandlerService);
}
