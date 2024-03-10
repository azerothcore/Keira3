import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { ItemEnchantmentTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-enchantment-template',
  templateUrl: './item-enchantment-template.component.html',
  styleUrls: ['./item-enchantment-template.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class ItemEnchantmentTemplateComponent extends MultiRowEditorComponent<ItemEnchantmentTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemEnchantmentTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
