import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AcoreString } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { AcoreStringService } from './acore-string.service';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './acore-string.component.html',
  imports: [TranslateModule, ReactiveFormsModule, TooltipModule, QueryOutputComponent, TopBarComponent],
})
export class AcoreStringComponent extends SingleRowEditorComponent<AcoreString> {
  override readonly editorService = inject(AcoreStringService);
  protected override readonly handlerService = inject(AcoreStringHandlerService);
}
