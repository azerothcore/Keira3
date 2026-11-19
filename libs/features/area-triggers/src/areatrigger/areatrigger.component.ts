import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Areatrigger } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { AreatriggerService } from './areatrigger.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-areatrigger',
  templateUrl: './areatrigger.component.html',
  imports: [TopBarComponent, TranslateDirective, TranslatePipe, ReactiveFormsModule, QueryOutputComponent],
})
export class AreatriggerComponent extends SingleRowEditorComponent<Areatrigger> {
  protected override readonly editorService = inject(AreatriggerService);
  protected readonly handlerService = inject(AreaTriggerHandlerService);
}
