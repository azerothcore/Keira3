import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { PageTextService } from './page-text.service';
import { PageTextHandlerService } from './page-text-handler.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PageText } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-text.component.html',
  imports: [TopBarComponent, TranslateModule, QueryOutputComponent, ReactiveFormsModule, TooltipModule],
})
export class PageTextComponent extends SingleRowEditorComponent<PageText> {
  protected override readonly editorService = inject(PageTextService);
  protected override readonly handlerService = inject(PageTextHandlerService);
}
