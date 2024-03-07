/* istanbul ignore file */ // TODO: fix coverage
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DTCFG } from '@keira/shared/config';
import { LOOT_MODE, LootTemplate } from '@keira/shared/acore-world-model';
import { WIKI_BASE_URL } from '@keira/shared/constants';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';
import { MultiRowEditorService } from '../../abstract/service/editors/multi-row-editor.service';
import { compareObjFn } from '../../utils/helpers';
import { TranslateModule } from '@ngx-translate/core';
import { ReferenceViewerComponent } from './reference-viewer.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '../editor-buttons/editor-buttons.component';
import { FlagsSelectorBtnComponent } from '../selectors/flags-selector/flags-selector-btn.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ItemSelectorBtnComponent } from '../selectors/item-selector/item-selector-btn.component';
import { IconComponent } from '../icon/icon.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '../query-output/query-output.component';
import { NgIf, NgClass, NgFor, AsyncPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-loot-editor',
  templateUrl: './loot-editor.component.html',
  styleUrls: ['./loot-editor.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ItemSelectorBtnComponent,
    TooltipModule,
    FlagsSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    NgClass,
    NgFor,
    ReferenceViewerComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class LootEditorComponent<T extends LootTemplate> extends SubscriptionHandler implements OnInit {
  @Input() editorService: MultiRowEditorService<T>;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly LOOT_MODE = LOOT_MODE;
  readonly DTCFG = DTCFG;

  get docUrl(): string {
    // all loot tables have the same documentation page
    return WIKI_BASE_URL + 'loot_template';
  }

  get referenceIds(): number[] {
    return this.editorService.newRows.filter((row) => row.Reference > 0).map((row) => row.Reference);
  }

  // TODO: this component was originally meant to avoid duplicating code
  //  but because of it now we need this duplication. Consider refactoring the architecture.
  /* istanbul ignore next */
  ngOnInit(): void {
    this.subscriptions.push(
      this.editorService.form.valueChanges.pipe(debounceTime(200), distinctUntilChanged(compareObjFn)).subscribe(() => {
        setTimeout(() => {
          this.changeDetectorRef.markForCheck();
        });
      }),
    );
  }

  isReference(row: LootTemplate): boolean {
    return row.Reference !== 0;
  }

  save(query: string): void {
    this.editorService.save(this.changeDetectorRef, query);
  }
}
