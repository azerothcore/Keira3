import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlagsSelectorModule, ItemSelectorModule, QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbcBaseComponent } from './base/spell-dbc-base.component';
import { SpellDbcEffectsComponent } from './effects/spell-dbc-effects.component';
import { SpellDbcSpellEffectComponent } from './effects/spell-dbc-spell-effect/spell-dbc-spell-effect.component';
import { SpellDbcFlagsComponent } from './flags/spell-dbc-flags.component';
import { SpellDbcItemsComponent } from './items/spell-dbc-items.component';
import { SpellDbcMiscComponent } from './misc/spell-dbc-misc.component';
import { SpellDbcComponent } from './spell-dbc.component';
import { SpellDbcLocaleComponent } from './texts/spell-dbc-locale/spell-dbc-locale.component';
import { SpellDbcTextsComponent } from './texts/spell-dbc-texts.component';

@NgModule({
  declarations: [
    SpellDbcComponent,
    SpellDbcBaseComponent,
    SpellDbcEffectsComponent,
    SpellDbcItemsComponent,
    SpellDbcFlagsComponent,
    SpellDbcTextsComponent,
    SpellDbcMiscComponent,
    SpellDbcLocaleComponent,
    SpellDbcSpellEffectComponent,
  ],
  imports: [
    TooltipModule.forRoot(),
    CommonModule,
    TopBarModule,
    QueryOutputModule,
    ReactiveFormsModule,
    TabsModule,
    TooltipModule,
    ToastrModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    ItemSelectorModule,
    TranslateModule,
  ],
})
export class SpellDbcModule {}
