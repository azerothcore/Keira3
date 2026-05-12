import { ChangeDetectionStrategy, Component, effect, inject, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SqlEditorGitService, GitStatus, GitCommit, GitChange } from './sql-editor-git.service';
import { SqlEditorFileService } from './sql-editor-file.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-git-panel',
  templateUrl: './git-panel.component.html',
  styleUrls: ['./git-panel.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class GitPanelComponent implements OnInit {
  private readonly gitService = inject(SqlEditorGitService);
  private readonly fileService = inject(SqlEditorFileService);

  readonly fileOpen = output<string>();

  protected commitMessage = '';
  protected gitOutput = '';
  protected stagedCollapsed = signal(false);
  protected unstagedCollapsed = signal(false);

  protected contextMenu: { visible: boolean; x: number; y: number; change: GitChange | null } = {
    visible: false,
    x: 0,
    y: 0,
    change: null,
  };

  protected onChangeContextMenu(event: MouseEvent, change: GitChange): void {
    event.preventDefault();
    this.contextMenu = {
      visible: true,
      x: Math.min(event.clientX, window.innerWidth - 160),
      y: Math.min(event.clientY, window.innerHeight - 100),
      change,
    };
  }

  protected closeContextMenu(): void {
    this.contextMenu.visible = false;
    this.contextMenu.change = null;
  }

  protected onContextAction(action: 'stage' | 'unstage' | 'undo'): void {
    const change = this.contextMenu.change;
    this.closeContextMenu();
    if (!change) return;
    if (action === 'unstage') this.unstageChange(change);
    else if (action === 'stage') this.stageChange(change);
    else if (action === 'undo') this.discardChange(change);
  }

  private discardChange(change: GitChange): void {
    const path = this._repoPath();
    if (!path) return;
    this.gitService.discardFile(path, change.file);
    this.refreshAll();
  }

  protected get stagedChanges(): GitChange[] {
    return this._gitStatus()?.changes.filter((c) => c.staged) || [];
  }

  protected get unstagedChanges(): GitChange[] {
    return this._gitStatus()?.changes.filter((c) => !c.staged) || [];
  }

  private readonly _gitStatus = signal<GitStatus | null>(null);
  protected readonly gitStatus = this._gitStatus.asReadonly();

  private readonly _gitLog = signal<GitCommit[]>([]);
  protected readonly gitLog = this._gitLog.asReadonly();

  private readonly _repoPath = signal<string | null>(null);
  protected readonly repoPath = this._repoPath.asReadonly();

  ngOnInit(): void {
    this.syncRepoPath();
    this.refreshAll();
  }

  constructor() {
    effect(() => {
      this.fileService.activeFolder();
      this.fileService.folders();
      this.syncRepoPath();
      this.refreshAll();
    });
  }

  private syncRepoPath(): void {
    this._repoPath.set(this.fileService.activeFolder());
  }

  private refreshAll(): void {
    this.refreshStatus();
    this.refreshLog();
  }

  private refreshStatus(): void {
    const path = this._repoPath();
    if (!path) {
      this._gitStatus.set(null);
      return;
    }
    this._gitStatus.set(this.gitService.getStatus(path));
  }

  private refreshLog(): void {
    const path = this._repoPath();
    if (!path) {
      this._gitLog.set([]);
      return;
    }
    this._gitLog.set(this.gitService.getLog(path, 20));
  }

  protected onClickChange(change: GitChange): void {
    const path = this._repoPath();
    if (!path) return;

    if (change.status === 'D') {
      const content = this.gitService.getHeadContent(path, change.file);
      const fullPath = this.gitService.getFullPath(path, change.file);
      if (fullPath) {
        this.fileOpen.emit(fullPath);
      }
      this.gitOutput = content ? `Deleted file content loaded from HEAD` : '';
    } else {
      const fullPath = this.gitService.getFullPath(path, change.file);
      if (fullPath) {
        this.fileOpen.emit(fullPath);
      }
    }
  }

  protected stageChange(change: GitChange): void {
    const path = this._repoPath();
    if (!path) return;
    this.gitService.stageFile(path, change.file);
    this.refreshAll();
  }

  protected unstageChange(change: GitChange): void {
    const path = this._repoPath();
    if (!path) return;
    this.gitService.unstageFile(path, change.file);
    this.refreshAll();
  }

  protected stageAll(): void {
    const path = this._repoPath();
    if (!path) return;
    for (const change of this.unstagedChanges) {
      this.gitService.stageFile(path, change.file);
    }
    this.refreshAll();
  }

  protected unstageAll(): void {
    const path = this._repoPath();
    if (!path) return;
    for (const change of this.stagedChanges) {
      this.gitService.unstageFile(path, change.file);
    }
    this.refreshAll();
  }

  protected doCommit(): void {
    const path = this._repoPath();
    if (!path || !this.commitMessage.trim()) return;
    const staged = this._gitStatus()?.changes.filter((c) => c.staged) || [];
    if (staged.length === 0) {
      this.gitOutput = 'No staged changes to commit';
      return;
    }
    if (this.gitService.commit(path, this.commitMessage.trim())) {
      this.commitMessage = '';
      this.gitOutput = 'Committed successfully';
    } else {
      this.gitOutput = 'Commit failed';
    }
    this.refreshAll();
  }

  protected doInit(): void {
    const path = this._repoPath();
    if (!path) return;
    if (this.gitService.init(path)) {
      this.gitOutput = 'Git repository initialized';
    } else {
      this.gitOutput = 'Failed to initialize repository';
    }
    this.refreshAll();
  }
}
