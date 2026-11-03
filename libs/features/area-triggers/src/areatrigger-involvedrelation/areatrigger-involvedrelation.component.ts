import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AreatriggerInvolvedrelation } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerInvolvedrelationService } from './areatrigger-involvedrelation.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-areatrigger-involvedrelation',
  templateUrl: './areatrigger-involvedrelation.component.html',
  imports: [TopBarComponent, TranslateDirective, TranslatePipe, ReactiveFormsModule, QueryOutputComponent],
})
export class AreatriggerInvolvedrelationComponent extends SingleRowEditorComponent<AreatriggerInvolvedrelation> {
  protected override readonly editorService = inject(AreatriggerInvolvedrelationService);
  protected readonly handlerService = inject(AreaTriggerHandlerService);
}
