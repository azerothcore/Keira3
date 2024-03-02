import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { DTCFG } from '@keira-config/datatable.config';
import { LOOT_MODE } from '@keira-constants/flags/loot-mode';
import { WIKI_BASE_URL } from '@keira-constants/general';
import { LootTemplate } from '@keira/acore-world-model';
import { compareObjFn } from '@keira-shared/utils/helpers';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-loot-editor',
  templateUrl: './loot-editor.component.html',
  styleUrls: ['./loot-editor.component.scss'],
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
