import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CreatureTemplateAddonService } from './creature-template-addon.service';

@NgModule({
  declarations: [CreatureTemplateAddonComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    TranslateModule,
  ],
  exports: [CreatureTemplateAddonComponent],
  providers: [CreatureTemplateAddonService],
})
export class CreatureTemplateAddonModule {}
