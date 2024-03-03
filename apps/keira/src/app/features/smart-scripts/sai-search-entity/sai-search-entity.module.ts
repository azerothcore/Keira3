import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreatureSelectorModule, GameobjectSelectorModule, HighlightjsWrapperModule, QueryOutputModule, TopBarModule } from '@keira/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SaiSearchEntityComponent } from './sai-search-entity.component';

@NgModule({
  declarations: [SaiSearchEntityComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    CreatureSelectorModule,
    GameobjectSelectorModule,
  ],
  exports: [SaiSearchEntityComponent],
})
export class SaiSearchEntityModule {}
