import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GAMEOBJECT_TYPE,
  GameobjectTemplate,
} from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SelectGameobjectService } from './select-gameobject.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-gameobject.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
  ],
})
export class SelectGameobjectComponent extends SelectComponent<GameobjectTemplate> {
  readonly entityTable = GAMEOBJECT_TEMPLATE_TABLE;
  readonly entityIdField = GAMEOBJECT_TEMPLATE_ID;
  readonly customStartingId = GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectGameobjectService);
  readonly handlerService = inject(GameobjectHandlerService);

  protected readonly GAMEOBJECT_TYPE = [{ value: null, name: 'Select Type' }, ...GAMEOBJECT_TYPE];
}
