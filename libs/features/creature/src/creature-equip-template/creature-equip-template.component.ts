import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureEquipTemplate } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { ItemSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureEquipTemplateService } from './creature-equip-template.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-equip-template',
  templateUrl: './creature-equip-template.component.html',
  styleUrls: ['./creature-equip-template.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ItemSelectorBtnComponent,
    TooltipModule,
  ],
})
export class CreatureEquipTemplateComponent extends SingleRowEditorComponent<CreatureEquipTemplate> {
  protected override readonly editorService = inject(CreatureEquipTemplateService);
  readonly handlerService = inject(CreatureHandlerService);
}
