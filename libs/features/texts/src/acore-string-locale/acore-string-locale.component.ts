import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AcoreStringLocale, CLIENT_LOCALE } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { AcoreStringHandlerService } from '../acore-string/acore-string-handler.service';
import { AcoreStringLocaleService } from './acore-string-locale.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-acore-string-locale',
  templateUrl: './acore-string-locale.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    SingleValueSelectorBtnComponent,
  ],
})
export class AcoreStringLocaleComponent extends MultiRowEditorComponent<AcoreStringLocale> {
  protected override readonly editorService = inject(AcoreStringLocaleService);
  readonly handlerService = inject(AcoreStringHandlerService);
  protected readonly CLIENT_LOCALE = CLIENT_LOCALE;
}
