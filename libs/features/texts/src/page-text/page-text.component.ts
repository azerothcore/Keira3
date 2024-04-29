import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { PageTextService } from './page-text.service';
import { PageTextHandlerService } from 'texts';
import { ReactiveFormsModule } from '@angular/forms';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PageText } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-text.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    ReactiveFormsModule,
    EditorButtonsComponent,
    SingleValueSelectorBtnComponent,
    TooltipModule,
  ],
})
export class PageTextComponent extends SingleRowEditorComponent<PageText> {
  readonly editorService = inject(PageTextService);
  protected readonly handlerService = inject(PageTextHandlerService);
}
