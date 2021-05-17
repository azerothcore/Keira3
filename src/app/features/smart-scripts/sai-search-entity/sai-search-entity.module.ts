import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { SaiSearchEntityComponent } from './sai-search-entity.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { highlightOptions } from '@keira-config/highlight.config';
import { CreatureSelectorModule } from '@keira-shared/modules/selectors/creature-selector/creature-selector.module';
import { GameobjectSelectorModule } from '@keira-shared/modules/selectors/gameobject-selector/gameobject-selector.module';

@NgModule({
  declarations: [SaiSearchEntityComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    HighlightModule.forRoot(highlightOptions),
    NgxDatatableModule,
    CreatureSelectorModule,
    GameobjectSelectorModule,
  ],
  exports: [SaiSearchEntityComponent],
})
export class SaiSearchEntityModule {}
