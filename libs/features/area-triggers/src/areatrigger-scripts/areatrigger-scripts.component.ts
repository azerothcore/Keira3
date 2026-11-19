import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AreatriggerScripts } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerScriptsService } from './areatrigger-scripts.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-areatrigger-scripts',
  templateUrl: './areatrigger-scripts.component.html',
  imports: [TopBarComponent, TranslateDirective, TranslatePipe, ReactiveFormsModule, QueryOutputComponent],
})
export class AreatriggerScriptsComponent extends SingleRowEditorComponent<AreatriggerScripts> {
  protected override readonly editorService = inject(AreatriggerScriptsService);
  protected readonly handlerService = inject(AreaTriggerHandlerService);
}
