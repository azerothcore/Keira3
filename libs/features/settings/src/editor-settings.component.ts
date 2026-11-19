import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EditorSettings, EditorSettingsService, SEARCH_TABLES, SearchSettings } from '@keira/shared/common-services';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * How the editors behave: "Execute & copy" copying only a query that ran, flags updated by their bits, and how each
 * table's search matches (exactly or as a part, numbers and names apart) and how many rows it gives.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-editor-settings',
  template: `
    <section class="card mb-3" data-testid="editor-settings">
      <div class="card-header">{{ 'SETTINGS.EDITORS' | translate }}</div>
      <div class="card-body">
        @let settings = editor.settings();
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="copy-only-on-success"
            data-testid="copy-only-on-success"
            [checked]="settings.copyOnlyOnSuccess"
            (change)="setOption('copyOnlyOnSuccess', $event)"
          />
          <label class="form-check-label" for="copy-only-on-success">{{ 'SETTINGS.COPY_ONLY_ON_SUCCESS' | translate }}</label>
        </div>
        <div class="form-check form-switch mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            id="bitwise-flags"
            data-testid="bitwise-flags"
            [checked]="settings.bitwiseFlags"
            (change)="setOption('bitwiseFlags', $event)"
          />
          <label class="form-check-label" for="bitwise-flags">{{ 'SETTINGS.BITWISE_FLAGS' | translate }}</label>
        </div>
        <p class="small mb-1">{{ 'SETTINGS.SEARCH_HELP' | translate }}</p>
        <table class="table table-sm small align-middle mb-0 editor-settings-search">
          <thead>
            <tr>
              <th>{{ 'SETTINGS.SEARCH_TABLE' | translate }}</th>
              <th class="text-center">{{ 'SETTINGS.EXACT_NUMBERS' | translate }}</th>
              <th class="text-center">{{ 'SETTINGS.EXACT_NAMES' | translate }}</th>
              <th>{{ 'SETTINGS.SEARCH_LIMIT' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (table of tables; track table) {
              @let own = settings.search[table] ?? {};
              @let shown = editor.search(table);
              <tr [attr.data-testid]="'search-' + table">
                <td>
                  @if (table === 'default') {
                    <strong>{{ 'SETTINGS.SEARCH_DEFAULT' | translate }}</strong>
                  } @else {
                    <code>{{ table }}</code>
                  }
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    [attr.data-testid]="'search-' + table + '-numbers'"
                    [checked]="shown.exactNumbers"
                    [class.opacity-50]="table !== 'default' && own.exactNumbers === undefined"
                    (change)="setSearch(table, { exactNumbers: $any($event.target).checked })"
                  />
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    [attr.data-testid]="'search-' + table + '-names'"
                    [checked]="shown.exactNames"
                    [class.opacity-50]="table !== 'default' && own.exactNames === undefined"
                    (change)="setSearch(table, { exactNames: $any($event.target).checked })"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    class="form-control form-control-sm editor-settings-limit"
                    [attr.data-testid]="'search-' + table + '-limit'"
                    [value]="own.limit ?? ''"
                    [placeholder]="shown.limit"
                    (change)="setLimit(table, $any($event.target).value)"
                  />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `
    .editor-settings-search {
      max-width: 640px;
    }
    .editor-settings-limit {
      width: 90px;
    }
  `,
  imports: [TranslatePipe],
})
export class EditorSettingsComponent {
  protected readonly editor = inject(EditorSettingsService);
  protected readonly tables = ['default', ...SEARCH_TABLES];

  protected setOption(key: keyof Omit<EditorSettings, 'search'>, event: Event): void {
    this.editor.save({ [key]: (event.target as HTMLInputElement).checked });
  }

  protected setSearch(table: string, changes: SearchSettings): void {
    this.editor.saveSearch(table, changes);
  }

  /** A table's rows at first; empty: as "default" (which falls back to 50). */
  protected setLimit(table: string, value: string): void {
    const limit = Math.trunc(Number(value));
    this.editor.saveSearch(table, { limit: value.trim() && limit > 0 ? limit : undefined });
  }
}
