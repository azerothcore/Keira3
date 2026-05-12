import { inject, Injectable, signal } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';

export interface GitChange {
  status: string;
  file: string;
  staged: boolean;
}

export interface GitCommit {
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitStatus {
  branch: string;
  changes: GitChange[];
  hasRemote: boolean;
  behind: number;
  ahead: number;
}

@Injectable({
  providedIn: 'root',
})
export class SqlEditorGitService {
  private readonly electronService = inject(ElectronService);

  private get childProcess() {
    return this.electronService.childProcess;
  }

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly gitAvailable = signal(true);

  constructor() {
    this.checkGitAvailable();
  }

  private checkGitAvailable(): void {
    try {
      this.childProcess.execFileSync('git', ['--version'], { encoding: 'utf8', timeout: 5000 });
      this.gitAvailable.set(true);
    } catch {
      this.gitAvailable.set(false);
    }
  }

  private findGitRoot(repoPath: string): string | null {
    try {
      const result = this.childProcess.execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: repoPath,
        encoding: 'utf8',
        timeout: 5000,
      });
      return result.trim();
    } catch {
      return null;
    }
  }

  private runGit(args: string[], cwd: string): string {
    const result = this.childProcess.execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      timeout: 15000,
    });
    return result.trim();
  }

  getStatus(repoPath: string): GitStatus | null {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return null;

    let branch: string;
    try {
      branch = this.runGit(['rev-parse', '--abbrev-ref', 'HEAD'], gitRoot);
    } catch {
      branch = 'main';
    }

    let hasRemote = false;
    try {
      const remoteOutput = this.runGit(['remote', '-v'], gitRoot);
      hasRemote = remoteOutput.length > 0;
    } catch {
      hasRemote = false;
    }

    let behind = 0;
    let ahead = 0;
    if (hasRemote && branch !== 'HEAD') {
      try {
        const countOutput = this.runGit(['rev-list', '--left-right', '--count', `HEAD...${branch}@{upstream}`], gitRoot);
        const parts = countOutput.split('\t');
        if (parts.length === 2) {
          ahead = parseInt(parts[0], 10) || 0;
          behind = parseInt(parts[1], 10) || 0;
        }
      } catch {
        behind = 0;
        ahead = 0;
      }
    }

    try {
      const statusOutput = this.runGit(['status', '--porcelain'], gitRoot);
      const changes: GitChange[] = [];
      if (statusOutput) {
        for (const line of statusOutput.split('\n')) {
          if (!line.trim()) continue;
          const x = line[0];
          const y = line[1];
          const file = line.substring(3);
          if (x === '?' && y === '?') {
            changes.push({ status: '??', file, staged: false });
          } else {
            if (x !== ' ' && x !== '?') {
              changes.push({ status: x, file, staged: true });
            }
            if (y !== ' ' && y !== '?') {
              changes.push({ status: y, file, staged: false });
            }
          }
        }
      }
      return { branch, changes, hasRemote, behind, ahead };
    } catch {
      return null;
    }
  }

  getLog(repoPath: string, count = 20): GitCommit[] {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return [];
    try {
      const output = this.runGit(['log', `--max-count=${count}`, '--format=%h|%s|%an|%ar'], gitRoot);
      if (!output) return [];
      return output
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const parts = line.split('|');
          return {
            shortHash: parts[0] || '',
            message: parts[1] || '',
            author: parts[2] || '',
            date: parts[3] || '',
          };
        });
    } catch {
      return [];
    }
  }

  stageFile(repoPath: string, file: string): void {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return;
    try {
      this.runGit(['add', '--', file], gitRoot);
    } catch {}
  }

  unstageFile(repoPath: string, file: string): void {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return;
    try {
      this.runGit(['reset', 'HEAD', '--', file], gitRoot);
    } catch {}
  }

  getHeadContent(repoPath: string, file: string): string {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return '';
    try {
      return this.runGit(['show', `HEAD:${file}`], gitRoot);
    } catch {
      return '';
    }
  }

  getFullPath(repoPath: string, relativeFile: string): string | null {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return null;
    return gitRoot.replace(/\\/g, '/').replace(/\/$/, '') + '/' + relativeFile;
  }

  fetch(repoPath: string): string | null {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return null;
    try {
      return this.runGit(['fetch'], gitRoot);
    } catch {
      return null;
    }
  }

  commit(repoPath: string, message: string): boolean {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return false;
    try {
      this.runGit(['commit', '-m', message], gitRoot);
      return true;
    } catch {
      return false;
    }
  }

  pull(repoPath: string): string | null {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return null;
    try {
      return this.runGit(['pull'], gitRoot);
    } catch {
      return null;
    }
  }

  push(repoPath: string): string | null {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return null;
    try {
      return this.runGit(['push'], gitRoot);
    } catch {
      return null;
    }
  }

  init(repoPath: string): boolean {
    try {
      this.runGit(['init'], repoPath);
      return true;
    } catch {
      return false;
    }
  }

  sync(repoPath: string): string | null {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return null;
    try {
      const pullResult = this.runGit(['pull'], gitRoot);
      const pushResult = this.runGit(['push'], gitRoot);
      return `${pullResult}\n${pushResult}`;
    } catch {
      return null;
    }
  }
}
