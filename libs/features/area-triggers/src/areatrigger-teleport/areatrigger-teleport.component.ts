import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AreatriggerTeleport } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerTeleportService } from './areatrigger-teleport.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-areatrigger-teleport',
  templateUrl: './areatrigger-teleport.component.html',
  imports: [TopBarComponent, TranslateDirective, TranslatePipe, ReactiveFormsModule, QueryOutputComponent],
})
export class AreatriggerTeleportComponent extends SingleRowEditorComponent<AreatriggerTeleport> {
  protected override readonly editorService = inject(AreatriggerTeleportService);
  protected readonly handlerService = inject(AreaTriggerHandlerService);
}
