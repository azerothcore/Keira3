import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/core';
import { GAMEOBJECT_FLAGS, GameobjectTemplateAddon } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { FactionSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-template-addon',
  templateUrl: './gameobject-template-addon.component.html',
  styleUrls: ['./gameobject-template-addon.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
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

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectTemplateAddonService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
