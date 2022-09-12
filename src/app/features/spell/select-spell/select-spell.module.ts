import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectSpellComponent } from './select-spell.component';
import { SelectSpellService } from './select-spell.service';

@NgModule({
  declarations: [SelectSpellComponent],
  imports: [
    CommonModule,
    TopBarModule,
    CreateModule,
    ReactiveFormsModule,
    SearchButtonsModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    TranslateModule,
  ],
  providers: [SelectSpellService],
})
export class SelectSpellModule {}
