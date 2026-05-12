import { inject, Injectable, NgZone, signal } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import * as fs from 'fs';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  expanded?: boolean;
  icon?: string;
}

export interface FolderEntry {
  path: string;
  tree: FileNode[];
  collapsed?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SqlEditorFileService {
  private readonly electronService = inject(ElectronService);
  private readonly zone = inject(NgZone);
  private watchers = new Map<string, ReturnType<typeof fs.watch>>();
  private watchTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  readonly folders = signal<FolderEntry[]>([]);
  readonly activeFolder = signal<string | null>(null);

  private get ipcRenderer() {
    return this.electronService.ipcRenderer;
  }

  private get fsModule(): typeof fs {
    return this.electronService.fs;
  }

  async openFileDialog(): Promise<string | null> {
    if (!this.electronService.isElectron()) {
      return null;
    }
    try {
      return await this.ipcRenderer.invoke('dialog:openFile');
    } catch {
      return null;
    }
  }

  async pickFolder(): Promise<string | null> {
    if (!this.electronService.isElectron()) {
      return null;
    }
    try {
      return await this.ipcRenderer.invoke('dialog:openFolder');
    } catch {
      return null;
    }
  }

  async addFolder(): Promise<void> {
    const path = await this.pickFolder();
    if (!path) return;
    const current = this.folders();
    if (current.some((f) => f.path === path)) return;
    this.folders.set([...current, { path, tree: this.readDirectory(path) }]);
    this.activeFolder.set(path);
    this.startWatcher(path);
  }

  setActiveFolder(path: string): void {
    this.activeFolder.set(path);
  }

  toggleFolderCollapse(path: string): void {
    this.folders.update((folders) => folders.map((f) => (f.path === path ? { ...f, collapsed: !f.collapsed } : f)));
  }

  removeFolder(path: string): void {
    this.folders.set(this.folders().filter((f) => f.path !== path));
    if (this.activeFolder() === path) {
      const remaining = this.folders();
      this.activeFolder.set(remaining.length > 0 ? remaining[0].path : null);
    }
    this.stopWatcher(path);
  }

  private preserveExpanded(oldNodes: FileNode[], newNodes: FileNode[]): void {
    for (const newNode of newNodes) {
      if (!newNode.isDirectory) continue;
      const oldNode = oldNodes.find((n) => n.path === newNode.path);
      if (oldNode && oldNode.expanded) {
        newNode.expanded = true;
        newNode.children = this.readDirectory(newNode.path);
        this.preserveExpanded(oldNode.children || [], newNode.children);
      }
    }
  }

  refreshFolder(path: string): void {
    const current = this.folders();
    const idx = current.findIndex((f) => f.path === path);
    if (idx !== -1) {
      const oldTree = current[idx].tree;
      const newTree = this.readDirectory(path);
      this.preserveExpanded(oldTree, newTree);
      const updated = [...current];
      updated[idx] = { ...updated[idx], tree: newTree };
      this.folders.set(updated);
    }
  }

  refreshAll(): void {
    const current = this.folders();
    for (const folder of current) {
      this.refreshFolder(folder.path);
    }
  }

  private startWatcher(dirPath: string): void {
    this.stopWatcher(dirPath);
    try {
      const watcher = this.fsModule.watch(dirPath, { recursive: true });
      watcher.on('change', () => {
        let timeout = this.watchTimeouts.get(dirPath);
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.zone.run(() => this.refreshFolder(dirPath));
        }, 500);
        this.watchTimeouts.set(dirPath, timeout);
      });
      this.watchers.set(dirPath, watcher);
    } catch {
      // file watching not available
    }
  }

  private stopWatcher(dirPath: string): void {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      try {
        watcher.close();
      } catch {
        /* ignore */
      }
      this.watchers.delete(dirPath);
    }
    const timeout = this.watchTimeouts.get(dirPath);
    if (timeout) {
      clearTimeout(timeout);
      this.watchTimeouts.delete(dirPath);
    }
  }

  readDirectory(dirPath: string): FileNode[] {
    try {
      const entries = this.fsModule.readdirSync(dirPath);
      const nodes: FileNode[] = [];
      for (const entry of entries) {
        if (entry.startsWith('.')) continue;
        const fullPath = dirPath.replace(/\\/g, '/').replace(/\/$/, '') + '/' + entry;
        let isDirectory = false;
        try {
          isDirectory = this.fsModule.statSync(fullPath).isDirectory();
        } catch {
          continue;
        }
        const node: FileNode = {
          name: entry,
          path: fullPath,
          isDirectory,
          expanded: false,
        };
        if (isDirectory) {
          node.children = [];
        }
        nodes.push(node);
      }
      nodes.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      return nodes;
    } catch {
      return [];
    }
  }

  toggleExpand(node: FileNode): void {
    if (node.isDirectory) {
      node.expanded = !node.expanded;
      if (node.expanded && (!node.children || node.children.length === 0)) {
        node.children = this.readDirectory(node.path);
      }
    }
  }

  readFile(filePath: string): string {
    return this.fsModule.readFileSync(filePath, 'utf8');
  }

  writeFile(filePath: string, content: string): void {
    this.fsModule.writeFileSync(filePath, content, 'utf8');
  }

  async saveAs(defaultName: string, content: string): Promise<string | null> {
    if (!this.electronService.isElectron()) {
      return null;
    }
    try {
      const filePath = await this.ipcRenderer.invoke('dialog:saveFile', defaultName);
      if (filePath) {
        this.writeFile(filePath, content);
        return filePath;
      }
    } catch {
      // silent fail
    }
    return null;
  }

  createFile(parentDir: string, fileName: string): void {
    const filePath = parentDir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + fileName;
    this.fsModule.writeFileSync(filePath, '', 'utf8');
  }

  createFolder(parentDir: string, folderName: string): void {
    const dirPath = parentDir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + folderName;
    this.fsModule.mkdirSync(dirPath, { recursive: true });
  }

  deleteEntry(targetPath: string): void {
    const stat = this.fsModule.statSync(targetPath);
    if (stat.isDirectory()) {
      this.fsModule.rmdirSync(targetPath, { recursive: true });
    } else {
      this.fsModule.unlinkSync(targetPath);
    }
  }

  renameEntry(oldPath: string, newName: string): string {
    const parts = oldPath.replace(/\\/g, '/').split('/');
    parts[parts.length - 1] = newName;
    const newPath = parts.join('/');
    this.fsModule.renameSync(oldPath, newPath);
    return newPath;
  }

  showInExplorer(targetPath: string): void {
    const shell = window.require('electron').shell;
    shell.showItemInFolder(targetPath.replace(/\//g, '\\'));
  }
}
