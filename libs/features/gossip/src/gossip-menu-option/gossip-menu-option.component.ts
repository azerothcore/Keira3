import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { GossipMenuOption, OPTION_ICON, OPTION_TYPE } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionService } from './gossip-menu-option.service';
import { GossipMenuOptionPreviewComponent } from '../gossip-menu-option-preview/gossip-menu-option-preview.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/base-editor-components';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option',
  templateUrl: './gossip-menu-option.component.html',
  styleUrls: ['./gossip-menu-option.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
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

  readonly editorService = inject(GossipMenuOptionService);
  readonly handlerService = inject(GossipHandlerService);

  showGossipPreview = true;
}
