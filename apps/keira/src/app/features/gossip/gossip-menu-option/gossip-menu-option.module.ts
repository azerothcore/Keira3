import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GossipMenuOptionPreviewModule } from '../gossip-menu-option-preview/gossip-menu-option-preview.module';
import { GossipMenuOptionComponent } from './gossip-menu-option.component';
import { GossipMenuOptionService } from './gossip-menu-option.service';

@NgModule({
  declarations: [GossipMenuOptionComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    SingleValueSelectorModule,
    EditorButtonsModule,
    GossipMenuOptionPreviewModule,
    TranslateModule,
  ],
  exports: [GossipMenuOptionComponent],
  providers: [GossipMenuOptionService],
})
export class GossipMenuOptionModule {}
