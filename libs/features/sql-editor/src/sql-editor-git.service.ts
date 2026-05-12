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
}

@Injectable({
  providedIn: 'root',
})
export class SqlEditorGitService {
  private readonly electronService = inject(ElectronService);

  private get childProcess() {
    return this.electronService.childProcess;
  }

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
      return result.replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
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
    return result.replace(/\r\n/g, '\n').replace(/\r/g, '').replace(/\n+$/, '');
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

    try {
      const statusOutput = this.runGit(['status', '--porcelain'], gitRoot);
      const changes: GitChange[] = [];
      if (statusOutput) {
        for (const line of statusOutput.split('\n')) {
          const cln = line.replace(/\r$/, '');
          if (!cln.trim()) continue;
          const x = cln[0];
          const y = cln[1];
          const pathStart = cln[2] === ' ' ? 3 : 2;
          const file = cln.substring(pathStart);
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
      return { branch, changes };
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

  discardFile(repoPath: string, file: string): void {
    const gitRoot = this.findGitRoot(repoPath);
    if (!gitRoot) return;
    try {
      this.runGit(['checkout', '--', file], gitRoot);
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

  init(repoPath: string): boolean {
    try {
      this.runGit(['init'], repoPath);
      return true;
    } catch {
      return false;
    }
  }
}
