import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';
import { SpellDbcService } from './spell-dbc.service';
import { SpellDbcMiscComponent } from './misc/spell-dbc-misc.component';
import { SpellDbcTextsComponent } from './texts/spell-dbc-texts.component';
import { SpellDbcFlagsComponent } from './flags/spell-dbc-flags.component';
import { SpellDbcItemsComponent } from './items/spell-dbc-items.component';
import { SpellDbcEffectsComponent } from './effects/spell-dbc-effects.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpellDbcBaseComponent } from './base/spell-dbc-base.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TranslateModule } from '@ngx-translate/core';

import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc',
  templateUrl: './spell-dbc.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    TabsModule,
    SpellDbcBaseComponent,
    FormsModule,
    ReactiveFormsModule,
    SpellDbcEffectsComponent,
    SpellDbcItemsComponent,
    SpellDbcFlagsComponent,
    SpellDbcTextsComponent,
    SpellDbcMiscComponent,
  ],
})
export class SpellDbcComponent extends SingleRowEditorComponent<SpellDbc> {
  readonly editorService = inject(SpellDbcService);
  readonly handlerService = inject(SpellHandlerService);
}
