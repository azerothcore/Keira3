import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ITEM_TEMPLATE_CUSTOM_STARTING_ID, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, IconComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemHandlerService } from '../item-handler.service';
import { SelectItemService } from './select-item.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.scss'],
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
    IconComponent,
  ],
})
export class SelectItemComponent extends SelectComponent<ItemTemplate> {
  readonly entityTable = ITEM_TEMPLATE_TABLE;
  readonly entityIdField = ITEM_TEMPLATE_ID;
  readonly customStartingId = ITEM_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectItemService);
  readonly handlerService = inject(ItemHandlerService);
}
