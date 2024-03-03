import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  CreatureSelectorModule,
  FactionSelectorModule,
  FlagsSelectorModule,
  QueryOutputModule,
  SingleValueSelectorModule,
  SpellSelectorModule,
  TopBarModule,
} from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateComponent } from './creature-template.component';
import { CreatureTemplateService } from './creature-template.service';
import { Model3DViewerModule } from '../../model-3d-viewer/model-3d-viewer.module';

@NgModule({
  declarations: [CreatureTemplateComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    FlagsSelectorModule,
    SpellSelectorModule,
    FactionSelectorModule,
    CreatureSelectorModule,
    TranslateModule,
    Model3DViewerModule,
  ],
  exports: [CreatureTemplateComponent],
  providers: [CreatureTemplateService],
})
export class CreatureTemplateModule {}
