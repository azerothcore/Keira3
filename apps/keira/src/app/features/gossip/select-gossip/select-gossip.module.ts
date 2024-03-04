import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule, HighlightjsWrapperModule, QueryOutputModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectGossipComponent } from './select-gossip.component';
import { SelectGossipService } from './select-gossip.service';

@NgModule({
  declarations: [SelectGossipComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    CreateModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    TranslateModule,
  ],
  exports: [SelectGossipComponent],
  providers: [SelectGossipService],
})
export class SelectGossipModule {}
