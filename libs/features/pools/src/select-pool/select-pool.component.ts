import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { POOL_TEMPLATE_CUSTOM_STARTING_ID, POOL_TEMPLATE_ID, POOL_TEMPLATE_TABLE, PoolTemplate } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { PoolHandlerService } from '../pool-handler.service';
import { SelectPoolService } from './select-pool.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-pool.component.html',
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateDirective,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectPoolComponent extends SelectComponent<PoolTemplate> {
  readonly entityTable = POOL_TEMPLATE_TABLE;
  readonly entityIdField = POOL_TEMPLATE_ID;
  readonly customStartingId = POOL_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectPoolService);
  readonly handlerService = inject(PoolHandlerService);
}
