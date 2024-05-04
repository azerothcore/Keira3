import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { ReactiveFormsModule } from '@angular/forms';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './npc-text-fields-group.component.html',
  selector: 'keira-npc-text-fields-group',
  standalone: true,
  imports: [TranslateModule, QueryOutputComponent, ReactiveFormsModule, SingleValueSelectorBtnComponent, TooltipModule],
})
export class NpcTextFieldsGroupComponent {
  @Input({ required: true }) groupID: number;

  protected readonly EM_FIELDS = [0, 1, 2, 3, 4, 5];
}
