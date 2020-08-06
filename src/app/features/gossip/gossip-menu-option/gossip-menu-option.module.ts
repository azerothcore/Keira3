import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GossipMenuOptionComponent } from './gossip-menu-option.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GossipMenuOptionService } from './gossip-menu-option.service';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { GossipMenuOptionPreviewModule } from '../gossip-menu-option-preview/gossip-menu-option-preview.module';

@NgModule({
  declarations: [
    GossipMenuOptionComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    SingleValueSelectorModule,
    EditorButtonsModule,
    PerfectScrollbarModule,
    GossipMenuOptionPreviewModule,
  ],
  exports: [
    GossipMenuOptionComponent,
  ],
  providers: [
    GossipMenuOptionService,
  ],
})
export class GossipMenuOptionModule {}
