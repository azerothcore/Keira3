import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { DTCFG } from '@keira-config/datatable.config';
import { LOOT_MODE } from '@keira-constants/flags/loot-mode';
import { WIKI_BASE_URL } from '@keira-constants/general';
import { LootTemplate } from '@keira-types/loot-template.type';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-loot-editor',
  templateUrl: './loot-editor.component.html',
  styleUrls: ['./loot-editor.component.scss'],
})
export class LootEditorComponent<T extends LootTemplate> {
  @Input() editorService: MultiRowEditorService<T>;

  readonly LOOT_MODE = LOOT_MODE;
  readonly DTCFG = DTCFG;

  get docUrl(): string {
    // all loot tables have the same documentation page
    return WIKI_BASE_URL + 'loot_template';
  }

  get referenceIds(): number[] {
    return this.editorService.newRows.filter((row) => row.Reference > 0).map((row) => row.Reference);
  }

  isReference(row): boolean {
    return row.Reference !== 0;
  }
}
