import { ChangeDetectionStrategy, Component, effect, inject, output, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SqlEditorGitService, GitStatus, GitCommit, GitChange } from './sql-editor-git.service';
import { SqlEditorFileService } from './sql-editor-file.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-git-panel',
  template: `
    <div class="git-panel">
      <div class="git-header">Source Control</div>

      @if (!repoPath()) {
        <div class="git-empty">Open a folder to use source control</div>
      } @else if (!gitStatus()) {
        <div class="git-empty">Not a git repository</div>
        <div class="git-init-area">
          <button class="btn btn-sm btn-outline-primary git-init-btn" (click)="doInit()">Initialize Repository</button>
        </div>
      } @else {
        <div class="git-branch">
          <i class="fa fa-code-fork"></i> {{ gitStatus()!.branch }}
          @if (gitStatus()!.hasRemote && (gitStatus()!.behind > 0 || gitStatus()!.ahead > 0)) {
            <span class="git-behind-ahead">
              @if (gitStatus()!.behind > 0) {
                <span class="git-behind">-{{ gitStatus()!.behind }}</span>
              }
              @if (gitStatus()!.ahead > 0) {
                <span class="git-ahead">+{{ gitStatus()!.ahead }}</span>
              }
            </span>
          }
        </div>

        <div class="git-section-header" (click)="stagedCollapsed.set(!stagedCollapsed())">
          <i class="fa" [class.fa-caret-right]="stagedCollapsed()" [class.fa-caret-down]="!stagedCollapsed()"></i>
          Staged Changes ({{ stagedChanges.length }})
        </div>
        @if (!stagedCollapsed()) {
          <div class="git-changes">
            @for (change of stagedChanges; track change.file) {
              <div class="git-change" (click)="onClickChange(change)">
                <span
                  class="git-change-status"
                  [class.git-added]="change.status === 'A' || change.status === '??'"
                  [class.git-modified]="change.status === 'M'"
                  [class.git-deleted]="change.status === 'D'"
                >
                  {{ change.status === '??' || change.status === 'A' ? '??' : change.status }}
                </span>
                <span class="git-change-file">{{ change.file }}</span>
                <button class="git-stage-btn" (click)="unstageChange(change); $event.stopPropagation()" title="Unstage">−</button>
              </div>
            } @empty {
              <div class="git-no-changes">No staged changes</div>
            }
          </div>
        }

        <div class="git-section-header" (click)="unstagedCollapsed.set(!unstagedCollapsed())">
          <i class="fa" [class.fa-caret-right]="unstagedCollapsed()" [class.fa-caret-down]="!unstagedCollapsed()"></i>
          Changes ({{ unstagedChanges.length }})
        </div>
        @if (!unstagedCollapsed()) {
          <div class="git-changes">
            @for (change of unstagedChanges; track change.file) {
              <div class="git-change" (click)="onClickChange(change)">
                <span
                  class="git-change-status"
                  [class.git-added]="change.status === 'A' || change.status === '??'"
                  [class.git-modified]="change.status === 'M'"
                  [class.git-deleted]="change.status === 'D'"
                >
                  {{ change.status === '??' || change.status === 'A' ? '??' : change.status }}
                </span>
                <span class="git-change-file">{{ change.file }}</span>
                <button class="git-stage-btn" (click)="stageChange(change); $event.stopPropagation()" title="Stage">+</button>
              </div>
            } @empty {
              <div class="git-no-changes">No changes</div>
            }
          </div>
        }

        <div class="git-commit-area">
          <input class="git-commit-input" [(ngModel)]="commitMessage" (keydown.enter)="doCommit()" placeholder="Commit message..." />
          <button
            class="btn btn-sm btn-primary git-commit-btn"
            (click)="doCommit()"
            [disabled]="!commitMessage.trim() || stagedChanges.length === 0"
          >
            Commit
          </button>
        </div>

        <div class="git-actions">
          <button
            class="btn btn-sm git-action-btn"
            [class.btn-outline-secondary]="gitStatus()!.hasRemote"
            [class.btn-outline-secondary.disabled]="!gitStatus()!.hasRemote"
            (click)="doFetch()"
            [disabled]="!gitStatus()!.hasRemote"
            title="Fetch"
          >
            <i class="fa fa-download"></i> Fetch
          </button>
          <button
            class="btn btn-sm git-action-btn"
            [class.btn-outline-secondary]="gitStatus()!.hasRemote"
            [class.btn-outline-secondary.disabled]="!gitStatus()!.hasRemote"
            (click)="doPull()"
            [disabled]="!gitStatus()!.hasRemote"
            title="Pull"
          >
            <i class="fa fa-arrow-down"></i> Pull
          </button>
          <button
            class="btn btn-sm git-action-btn"
            [class.btn-outline-secondary]="gitStatus()!.hasRemote"
            [class.btn-outline-secondary.disabled]="!gitStatus()!.hasRemote"
            (click)="doPush()"
            [disabled]="!gitStatus()!.hasRemote"
            title="Push"
          >
            <i class="fa fa-arrow-up"></i> Push
          </button>
          <button
            class="btn btn-sm git-action-btn"
            [class.btn-outline-secondary]="gitStatus()!.hasRemote"
            [class.btn-outline-secondary.disabled]="!gitStatus()!.hasRemote"
            (click)="doSync()"
            [disabled]="!gitStatus()!.hasRemote"
            title="Sync"
          >
            <i class="fa fa-refresh"></i> Sync
          </button>
        </div>

        @if (gitOutput) {
          <div class="git-output">{{ gitOutput }}</div>
        }

        <div class="git-log-header">Recent Commits</div>
        <div class="git-log">
          @for (commit of gitLog(); track commit.shortHash) {
            <div class="git-log-entry" title="{{ commit.message }}">
              <span class="git-log-hash">{{ commit.shortHash }}</span>
              <span class="git-log-msg">{{ commit.message }}</span>
              <span class="git-log-meta">{{ commit.author }} &bull; {{ commit.date }}</span>
            </div>
          } @empty {
            <div class="git-no-changes">No commits yet</div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .git-panel {
        font-size: 12px;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .git-header {
        padding: 0.4rem 0.6rem;
        border-bottom: 1px solid #dee2e6;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.5px;
        font-weight: 600;
        color: #666;
      }
      .git-empty {
        padding: 0.75rem;
        color: #999;
        text-align: center;
        font-size: 12px;
      }
      .git-branch {
        padding: 0.35rem 0.6rem;
        font-weight: 600;
        font-size: 12px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
      .git-behind-ahead {
        margin-left: auto;
        display: flex;
        gap: 0.3rem;
        font-size: 11px;
      }
      .git-behind {
        color: #dc3545;
      }
      .git-ahead {
        color: #28a745;
      }
      .git-section-header {
        padding: 0.35rem 0.6rem;
        font-size: 11px;
        color: #666;
        border-bottom: 1px solid #dee2e6;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
      .git-section-header:hover {
        background: #e9ecef;
      }
      .git-changes {
        overflow: auto;
        padding: 0.15rem 0;
      }
      .git-change {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.2rem 0.6rem;
        cursor: pointer;
      }
      .git-change:hover {
        background: #e9ecef;
      }
      .git-change-status {
        width: 20px;
        font-weight: 700;
        font-size: 11px;
        flex-shrink: 0;
      }
      .git-added {
        color: #28a745;
      }
      .git-modified {
        color: #856404;
      }
      .git-deleted {
        color: #dc3545;
      }
      .git-change-file {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
      }
      .git-stage-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 700;
        color: #007bff;
        padding: 0 2px;
        line-height: 1;
      }
      .git-stage-btn:hover {
        color: #0056b3;
      }
      .git-no-changes {
        padding: 0.5rem 0.6rem;
        color: #999;
        font-size: 11px;
      }
      .git-commit-area {
        padding: 0.4rem 0.6rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        gap: 0.3rem;
      }
      .git-commit-input {
        flex: 1;
        font-size: 12px;
        padding: 0.25rem 0.4rem;
        border: 1px solid #ced4da;
        border-radius: 3px;
        outline: none;
        min-width: 0;
      }
      .git-commit-input:focus {
        border-color: #007bff;
      }
      .git-commit-btn {
        flex-shrink: 0;
      }
      .git-actions {
        display: flex;
        gap: 0.3rem;
        padding: 0.3rem 0.6rem;
        border-top: 1px solid #dee2e6;
      }
      .git-action-btn {
        font-size: 11px;
        padding: 0.15rem 0.2rem;
        flex: 1;
        min-width: 0;
      }
      .git-output {
        padding: 0.3rem 0.6rem;
        border-top: 1px solid #dee2e6;
        color: #666;
        font-family: monospace;
        font-size: 11px;
        max-height: 60px;
        overflow: auto;
        white-space: pre-wrap;
      }
      .git-init-area {
        padding: 0.5rem 0.6rem;
        text-align: center;
      }
      .git-init-btn {
        font-size: 12px;
      }
      .git-log-header {
        padding: 0.35rem 0.6rem;
        font-size: 11px;
        color: #666;
        border-top: 1px solid #dee2e6;
        border-bottom: 1px solid #dee2e6;
      }
      .git-log {
        overflow: auto;
        padding: 0.15rem 0;
        max-height: 200px;
      }
      .git-log-entry {
        display: flex;
        flex-wrap: wrap;
        gap: 0.2rem 0.4rem;
        padding: 0.2rem 0.6rem;
        cursor: default;
        font-size: 11px;
      }
      .git-log-entry:hover {
        background: #e9ecef;
      }
      .git-log-hash {
        color: #007bff;
        font-family: monospace;
        flex-shrink: 0;
      }
      .git-log-msg {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
        color: #333;
      }
      .git-log-meta {
        color: #999;
        flex-shrink: 0;
      }
    `,
  ],
  standalone: true,
  imports: [FormsModule],
})
export class GitPanelComponent implements OnInit, OnDestroy {
  private readonly gitService = inject(SqlEditorGitService);
  private readonly fileService = inject(SqlEditorFileService);

  readonly fileOpen = output<string>();

  protected commitMessage = '';
  protected gitOutput = '';
  protected stagedCollapsed = signal(false);
  protected unstagedCollapsed = signal(false);

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

  private fetchInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.syncRepoPath();
    this.refreshAll();
    this.startAutoFetch();
  }

  ngOnDestroy(): void {
    this.stopAutoFetch();
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

  private startAutoFetch(): void {
    this.stopAutoFetch();
    this.fetchInterval = setInterval(() => {
      const path = this._repoPath();
      if (!path) return;
      const status = this._gitStatus();
      if (!status || !status.hasRemote) return;
      this.gitService.fetch(path);
      this.refreshAll();
    }, 60000);
  }

  private stopAutoFetch(): void {
    if (this.fetchInterval !== null) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }
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

  protected doFetch(): void {
    const path = this._repoPath();
    if (!path) return;
    this.gitOutput = 'Fetching...';
    const result = this.gitService.fetch(path);
    this.gitOutput = result ?? 'Fetch failed';
    this.refreshAll();
  }

  protected doPull(): void {
    const path = this._repoPath();
    if (!path) return;
    const result = this.gitService.pull(path);
    this.gitOutput = result ?? 'Pull failed';
    this.refreshAll();
  }

  protected doPush(): void {
    const path = this._repoPath();
    if (!path) return;
    const result = this.gitService.push(path);
    this.gitOutput = result ?? 'Push failed';
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

  protected doSync(): void {
    const path = this._repoPath();
    if (!path) return;
    const result = this.gitService.sync(path);
    this.gitOutput = result ?? 'Sync failed';
    this.refreshAll();
  }
}
