import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ElectronService } from '@keira/shared/common-services';
import {
  WowClientService,
  WowDataCacheService,
  WowDataSettingsService,
  StartupFolder,
  StartupLoadService,
  ModelViewerSettingService,
  ModelViewerSource,
} from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';

/** A folder of the form, in the order shown. */
type FolderKey = 'clientPath' | 'serverDataPath' | 'sourcePath' | 'cacheFolder';

/**
 * The game data folders (the WoW client, the server's data, the AzerothCore source, the cache), kept on this
 * computer: in Keira's settings, and in the World Editor's (`locked` there: greyed until Modify).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-data-folders',
  templateUrl: './game-data-folders.component.html',
  styleUrls: ['./game-data-folders.component.scss'],
  imports: [ReactiveFormsModule, TranslatePipe],
})
export class GameDataFoldersComponent {
  private readonly settings = inject(WowDataSettingsService);
  protected readonly cache = inject(WowDataCacheService);
  private readonly injector = inject(Injector);
  private readonly clipboard = inject(ClipboardService);
  protected readonly electron = inject(ElectronService);
  protected readonly startupLoad = inject(StartupLoadService);
  protected readonly modelViewer = inject(ModelViewerSettingService);
  protected readonly modelSources: ModelViewerSource[] = ['wowhead', 'game-data'];

  /** The folder read when Keira starts, for a folder field (none for the cache's). */
  protected startupFolder(key: FolderKey): StartupFolder | undefined {
    return ({ clientPath: 'client', serverDataPath: 'server', sourcePath: 'source' } as Partial<Record<FolderKey, StartupFolder>>)[key];
  }
  private readonly toastr = inject(ToastrService);

  /** Greyed until Modify (once the client folder is set). */
  readonly locked = input(false);
  /** The title of the error notes (where the form is). */
  readonly title = input('World Editor');
  /** The folders saved (the client's archives closed: they're opened again from the new ones). */
  readonly saved = output<void>();

  private readonly modifying = signal(false);
  /** Whether the folders can't be changed (locked, not modifying, and set). */
  protected readonly readOnly = computed(() => this.locked() && !this.modifying() && this.settings.isConfigured());

  protected readonly form = new FormGroup({
    clientPath: new FormControl(this.settings.paths().clientPath, { nonNullable: true }),
    serverDataPath: new FormControl(this.settings.paths().serverDataPath, { nonNullable: true }),
    sourcePath: new FormControl(this.settings.paths().sourcePath, { nonNullable: true }),
    cacheFolder: new FormControl(this.cache.folder(), { nonNullable: true }),
  });

  protected readonly folders: { key: FolderKey; id: string; label: string; help: string; info: string; placeholder: string }[] = [
    {
      key: 'clientPath',
      id: 'client-path',
      label: 'WORLD_EDITOR.CLIENT_PATH',
      help: 'WORLD_EDITOR.CLIENT_PATH_HELP',
      info: 'WORLD_EDITOR.CLIENT_PATH_INFO',
      placeholder: 'C:\\Games\\World of Warcraft 3.3.5a',
    },
    {
      key: 'serverDataPath',
      id: 'server-data-path',
      label: 'WORLD_EDITOR.SERVER_DATA_PATH',
      help: 'WORLD_EDITOR.SERVER_DATA_PATH_HELP',
      info: 'WORLD_EDITOR.SERVER_DATA_PATH_INFO',
      placeholder: 'C:\\AzerothCore\\bin\\Data',
    },
    {
      key: 'sourcePath',
      id: 'source-path',
      label: 'WORLD_EDITOR.SOURCE_PATH',
      help: 'WORLD_EDITOR.SOURCE_PATH_HELP',
      info: 'WORLD_EDITOR.SOURCE_PATH_INFO',
      placeholder: 'C:\\AzerothCore\\azerothcore-wotlk',
    },
    {
      key: 'cacheFolder',
      id: 'cache-folder',
      label: 'WORLD_EDITOR.CACHE_FOLDER',
      help: 'WORLD_EDITOR.CACHE_FOLDER_HELP',
      info: 'WORLD_EDITOR.CACHE_FOLDER_INFO',
      placeholder: '',
    },
  ];

  /** The folder a field stands for: the cache's in use when none is chosen. */
  protected folderOf(key: FolderKey): string {
    const value = this.form.getRawValue()[key];
    return key === 'cacheFolder' ? value || (this.cache.root() ?? '') : value;
  }

  protected modify(): void {
    this.modifying.set(true);
  }

  protected copyPath(path: string): void {
    this.clipboard.copyFromContent(path);
  }

  /** Shows a folder in the system's file manager (Explorer, Finder…). */
  protected openFolder(path: string): void {
    const opener = navigator.userAgent.includes('Windows') ? 'explorer' : navigator.userAgent.includes('Mac') ? 'open' : 'xdg-open';
    try {
      this.electron.childProcess.spawn(opener, [path], { detached: true, stdio: 'ignore' }).unref();
    } catch (error) {
      this.toastr.error((error as Error).message, this.title());
    }
  }

  protected async save(): Promise<void> {
    if (this.readOnly()) {
      return;
    }
    const { clientPath, serverDataPath, sourcePath, cacheFolder } = this.form.getRawValue();
    this.settings.save({ clientPath, serverDataPath, sourcePath });
    this.cache.setFolder(cacheFolder);
    // (made only now: not when Keira starts)
    await this.injector.get(WowClientService).close();
    this.modifying.set(false);
    this.saved.emit();
  }
}
