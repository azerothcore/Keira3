import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BUILT_IN_THEMES, isDatabaseName, ServerSettingsService, ThemeService } from '@keira/shared/common-services';
import { ClipboardService } from 'ngx-clipboard';
import { GameDataFoldersComponent } from '@keira/shared/world-viewer';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

/**
 * Keira's settings: how it behaves and looks on this computer: its theme (light, dark, the computer's, or one someone
 * made), and the game data folders (the World Editor's).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [GameDataFoldersComponent, TranslatePipe],
})
export class SettingsComponent {
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly clipboard = inject(ClipboardService);
  protected readonly theme = inject(ThemeService);
  protected readonly server = inject(ServerSettingsService);
  protected readonly databaseError = signal(false);

  /** The characters database's name (saved when it's one). */
  protected setCharactersDatabase(event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();
    this.databaseError.set(!isDatabaseName(name));
    if (isDatabaseName(name)) {
      this.server.save({ charactersDatabase: name });
    }
  }
  protected readonly builtIn = BUILT_IN_THEMES;
  /** The theme JSON pasted to import. */
  protected readonly themeJson = signal('');
  protected readonly themeError = signal('');

  protected selectTheme(event: Event): void {
    this.theme.select((event.target as HTMLSelectElement).value);
  }

  protected setThemeJson(event: Event): void {
    this.themeJson.set((event.target as HTMLTextAreaElement).value);
    this.themeError.set('');
  }

  /** Imports the theme pasted, or the one of a file picked. */
  protected async importTheme(file?: File): Promise<void> {
    try {
      const theme = this.theme.importTheme(file ? await file.text() : this.themeJson());
      this.themeJson.set('');
      this.themeError.set('');
      this.toastr.success(this.translate.instant('SETTINGS.THEME_IMPORTED', { name: theme.name }));
    } catch (error) {
      this.themeError.set((error as Error).message);
    }
  }

  protected importThemeFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      void this.importTheme(file);
    }
  }

  /** Copies the theme chosen as JSON (a built-in one: a template of every colour), to share it or start one. */
  protected copyTheme(): void {
    this.clipboard.copyFromContent(this.theme.exportTheme(this.theme.choice()));
    this.toastr.success(this.translate.instant('SETTINGS.THEME_COPIED'));
  }

  protected isCustom(name: string): boolean {
    return this.theme.custom().some((theme) => theme.name === name);
  }

  protected onSaved(): void {
    this.toastr.success(this.translate.instant('SETTINGS.SAVED'));
  }
}
