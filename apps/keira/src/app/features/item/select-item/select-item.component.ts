import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MysqlQueryService, SelectComponent } from '@keira/shared/core';
import { ITEM_TEMPLATE_CUSTOM_STARTING_ID, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { SelectItemService } from './select-item.service';
import { IconComponent } from '@keira/shared/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf, NgClass } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/core';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.scss'],
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
    IconComponent,
    NgClass,
  ],
})
export class SelectItemComponent extends SelectComponent<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectItemService,
    public handlerService: ItemHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
