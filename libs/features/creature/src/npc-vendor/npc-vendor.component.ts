import { NameCache } from '@keira/shared/utils';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NpcVendor } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { ItemExtendedCostSelectorBtnComponent, ItemSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcVendorService } from './npc-vendor.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-vendor',
  templateUrl: './npc-vendor.component.html',
  styleUrls: ['./npc-vendor.component.scss'],
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ItemSelectorBtnComponent,
    TooltipDirective,
    ItemExtendedCostSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    AsyncPipe,
  ],
})
export class NpcVendorComponent extends MultiRowEditorComponent<NpcVendor> {
  /** The names shown, read once each: the table sorts by them. */
  protected readonly itemNames = new NameCache(
    (id) => this.editorService.queryService.getItemNameById(id),
    () => this.changeDetectorRef.markForCheck(),
  );
  protected override readonly editorService = inject(NpcVendorService);
  readonly handlerService = inject(CreatureHandlerService);
}
