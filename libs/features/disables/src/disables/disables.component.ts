import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Disables } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { DisablesHandlerService } from '../disables-handler.service';
import { DisablesService } from './disables.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-disables',
  templateUrl: './disables.component.html',
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
export class DisablesComponent extends MultiRowEditorComponent<Disables> {
  protected override readonly editorService = inject(DisablesService);
  readonly handlerService = inject(DisablesHandlerService);
}
