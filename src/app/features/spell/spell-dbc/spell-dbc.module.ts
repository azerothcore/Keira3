import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpellDbcComponent } from './spell-dbc.component';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SpellDbcBaseComponent } from './base/spell-dbc-base.component';
import { SpellDbcEffectsComponent } from './effects/spell-dbc-effects.component';
import { SpellDbcItemsComponent } from './items/spell-dbc-items.component';
import { SpellDbcFlagsComponent } from './flags/spell-dbc-flags.component';
import { SpellDbcTextsComponent } from './texts/spell-dbc-texts.component';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { SpellDbcLocaleComponent } from './texts/spell-dbc-locale/spell-dbc-locale.component';
import { SpellDbcSpellEffectComponent } from './effects/spell-dbc-spell-effect/spell-dbc-spell-effect.component';



@NgModule({
  declarations: [
    SpellDbcComponent,
    SpellDbcBaseComponent,
    SpellDbcEffectsComponent,
    SpellDbcItemsComponent,
    SpellDbcFlagsComponent,
    SpellDbcTextsComponent,
    SpellDbcLocaleComponent,
    SpellDbcSpellEffectComponent,
  ],
  imports: [
    CommonModule,
    TopBarModule,
    QueryOutputModule,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
  ]
})
export class SpellDbcModule { }
