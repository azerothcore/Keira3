import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComplexKeyComponent } from '@keira/shared/base-abstract-classes';
import { CONDITION_SOURCE_TYPES, GameTele } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionsSearchService } from '@keira/shared/selectors';
import { getEnumKeys } from '@keira/shared/utils';
import { GameTeleHandlerService } from '../game-tele-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, NgxDatatableModule],
})
export class SelectGameTeleComponent extends SelectComplexKeyComponent<GameTele> {
  public readonly selectService = inject(ConditionsSearchService);
  protected override readonly handlerService = inject(GameTeleHandlerService);
}
