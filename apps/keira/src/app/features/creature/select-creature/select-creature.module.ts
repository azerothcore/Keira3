import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule, HighlightjsWrapperModule, QueryOutputModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectCreatureComponent } from './select-creature.component';
import { SelectCreatureService } from './select-creature.service';

@NgModule({
  declarations: [SelectCreatureComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    CreateModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    HighlightjsWrapperModule,
    TranslateModule,
  ],
  exports: [SelectCreatureComponent],
  providers: [SelectCreatureService],
})
export class SelectCreatureModule {}
