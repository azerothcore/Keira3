import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureSelectorModule } from '@keira-shared/modules/selectors/creature-selector/creature-selector.module';
import { GameobjectSelectorModule } from '@keira-shared/modules/selectors/gameobject-selector/gameobject-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
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
