import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GossipMenuOption, OPTION_ICON, OPTION_TYPE } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionPreviewComponent } from '../gossip-menu-option-preview/gossip-menu-option-preview.component';
import { GossipMenuOptionService } from './gossip-menu-option.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option',
  templateUrl: './gossip-menu-option.component.html',
  styleUrls: ['./gossip-menu-option.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    GossipMenuOptionPreviewComponent,
  ],
})
export class GossipMenuOptionComponent extends MultiRowEditorComponent<GossipMenuOption> {
  readonly OPTION_ICON = OPTION_ICON;
  readonly OPTION_TYPE = OPTION_TYPE;

  protected override readonly editorService = inject(GossipMenuOptionService);
  readonly handlerService = inject(GossipHandlerService);

  showGossipPreview = true;
}
