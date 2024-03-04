import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FactionSelectorModule, FlagsSelectorModule, QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

@NgModule({
  declarations: [GameobjectTemplateAddonComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    FlagsSelectorModule,
    FactionSelectorModule,
    TranslateModule,
  ],
  exports: [GameobjectTemplateAddonComponent],
  providers: [GameobjectTemplateAddonService],
})
export class GameobjectTemplateAddonModule {}
