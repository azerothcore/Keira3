import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DISABLE_SOURCE_TYPE, DISABLES_ID, DISABLES_TABLE, Disables } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { DisablesHandlerService } from '../disables-handler.service';
import { SelectDisablesService } from './select-disables.service';

/** Opens the disables of a source type (all its entries in one editor), or finds them by entry or comment. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-disables',
  templateUrl: './select-disables.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    NgxDatatableModule,
    HighlightjsWrapperComponent,
    TopBarComponent,
  ],
})
export class SelectDisablesComponent extends SelectComponent<Disables> {
  protected override readonly entityTable = DISABLES_TABLE;
  protected override readonly entityIdField = DISABLES_ID;
  readonly customStartingId = 0;
  protected readonly selectService = inject(SelectDisablesService);
  readonly handlerService = inject(DisablesHandlerService);
  protected readonly SOURCE_TYPES = DISABLE_SOURCE_TYPE;

  protected sourceTypeName(value: number): string {
    return DISABLE_SOURCE_TYPE.find((option) => option.value === Number(value))?.name ?? `${value}`;
  }

  protected open(sourceType: number): void {
    this.handlerService.select(false, sourceType, this.sourceTypeName(sourceType));
  }
}
