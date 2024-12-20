import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AcoreString } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AcoreTextHandlerService } from './acore-text-handler.service';
import { AcoreTextService } from './acore-text.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './acore-text.component.html',
  standalone: true,
  imports: [TopBarComponent, TranslateModule, QueryOutputComponent, ReactiveFormsModule, TooltipModule],
})
export class AcoreTextComponent extends SingleRowEditorComponent<AcoreString> {
  override readonly editorService = inject(AcoreTextService);
  protected override readonly handlerService = inject(AcoreTextHandlerService);
}
