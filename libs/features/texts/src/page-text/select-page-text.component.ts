import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { PageText, PAGE_TEXT_CUSTOM_STARTING_ID, PAGE_TEXT_TABLE, PAGE_TEXT_ID } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SelectPageTextService } from './select-page-text.service';
import { PageTextHandlerService } from './page-text-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-page-text.component.html',
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
export class SelectPageTextComponent extends SelectComponent<PageText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectPageTextService,
    public readonly handlerService: PageTextHandlerService,
  ) {
    super(PAGE_TEXT_TABLE, PAGE_TEXT_ID, PAGE_TEXT_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
