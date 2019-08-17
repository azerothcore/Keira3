import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { QuestRequestItemsComponent } from './quest-request-items.component';
import { FlagsSelectorModule } from '../../shared/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';

@NgModule({
  declarations: [
    QuestRequestItemsComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
  ],
  exports: [
    QuestRequestItemsComponent,
  ],
})
export class QuestRequestItemsModule {}
