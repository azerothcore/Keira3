import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MysqlQueryService, SelectComponent } from '@keira/shared/core';
import {
  GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SelectGameobjectService } from './select-gameobject.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/core';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-gameobject',
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
    NgIf,
    NgxDatatableModule,
  ],
})
export class SelectGameobjectComponent extends SelectComponent<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectGameobjectService,
    public handlerService: GameobjectHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
