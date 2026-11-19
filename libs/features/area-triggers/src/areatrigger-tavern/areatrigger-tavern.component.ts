import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AreatriggerTavern } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerTavernService } from './areatrigger-tavern.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-areatrigger-tavern',
  templateUrl: './areatrigger-tavern.component.html',
  imports: [TopBarComponent, TranslateDirective, TranslatePipe, ReactiveFormsModule, QueryOutputComponent],
})
export class AreatriggerTavernComponent extends SingleRowEditorComponent<AreatriggerTavern> {
  protected override readonly editorService = inject(AreatriggerTavernService);
  protected readonly handlerService = inject(AreaTriggerHandlerService);
}
