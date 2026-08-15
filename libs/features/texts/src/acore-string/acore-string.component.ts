import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AcoreString } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { AcoreStringService } from './acore-string.service';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './acore-string.component.html',
  imports: [TranslateDirective, TranslatePipe, ReactiveFormsModule, TooltipDirective, QueryOutputComponent, TopBarComponent],
})
export class AcoreStringComponent extends SingleRowEditorComponent<AcoreString> {
  override readonly editorService = inject(AcoreStringService);
  protected override readonly handlerService = inject(AcoreStringHandlerService);
}
