import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleAccessory } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureHandlerService } from '../creature-handler.service';
import { VehicleAccessoryService } from './vehicle-accessory.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-vehicle-accessory',
  templateUrl: './vehicle-accessory.component.html',
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
export class VehicleAccessoryComponent extends MultiRowEditorComponent<VehicleAccessory> {
  protected override readonly editorService = inject(VehicleAccessoryService);
  readonly handlerService = inject(CreatureHandlerService);
}
