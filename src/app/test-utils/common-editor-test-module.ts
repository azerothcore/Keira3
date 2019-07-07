import { NgModule } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';

import { TopBarComponent } from '../components/main-window/top-bar/top-bar.component';
import { HighlightjsWrapperComponent } from '../components/editors/shared/hightlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from '../components/editors/shared/query-output/query-error/query-error.component';
import { QueryOutputComponent } from '../components/editors/shared/query-output/query-output.component';
import { highlightOptions } from '../config/highlight.config';
import { CommonTestModule } from './common-test.module';
import { FlagsSelectorBtnComponent } from '../components/editors/shared/selectors/flags-selector/flags-selector-btn.component';
import { ItemSelectorBtnComponent } from '../components/editors/shared/selectors/item-selector/item-selector-btn.component';
import {
  SingleValueSelectorBtnComponent
} from '../components/editors/shared/selectors/single-value-selector/single-value-selector-btn.component';

@NgModule({
  declarations: [
    TopBarComponent,
    HighlightjsWrapperComponent,
    QueryErrorComponent,
    QueryOutputComponent,
    FlagsSelectorBtnComponent,
    SingleValueSelectorBtnComponent,
    ItemSelectorBtnComponent,
  ],
  imports: [
    CommonTestModule,
    HighlightModule.forRoot(highlightOptions),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    NgxDatatableModule,
  ],
  exports: [
    FlagsSelectorBtnComponent,
    SingleValueSelectorBtnComponent,
    ItemSelectorBtnComponent,
    TopBarComponent,
    HighlightjsWrapperComponent,
    QueryErrorComponent,
    QueryOutputComponent,
    TooltipModule,
    ModalModule,
    NgxDatatableModule,
  ]
})
export class CommonEditorTestModule {}
