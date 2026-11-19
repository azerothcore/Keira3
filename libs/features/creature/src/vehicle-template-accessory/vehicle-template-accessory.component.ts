import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleTemplateAccessory } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureHandlerService } from '../creature-handler.service';
import { VehicleTemplateAccessoryService } from './vehicle-template-accessory.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-vehicle-template-accessory',
  templateUrl: './vehicle-template-accessory.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class VehicleTemplateAccessoryComponent extends MultiRowEditorComponent<VehicleTemplateAccessory> {
  protected override readonly editorService = inject(VehicleTemplateAccessoryService);
  readonly handlerService = inject(CreatureHandlerService);
}
