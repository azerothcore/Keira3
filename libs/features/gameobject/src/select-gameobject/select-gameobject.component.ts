import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SelectGameobjectService } from './select-gameobject.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-gameobject.component.html',
  styleUrls: ['./select-gameobject.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectGameobjectComponent extends SelectComponent<GameobjectTemplate> {
  readonly entityTable = GAMEOBJECT_TEMPLATE_TABLE;
  readonly entityIdField = GAMEOBJECT_TEMPLATE_ID;
  readonly customStartingId = GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectGameobjectService);
  readonly handlerService = inject(GameobjectHandlerService);
}
