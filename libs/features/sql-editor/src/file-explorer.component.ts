import { ChangeDetectionStrategy, Component, HostListener, inject, input, output, ElementRef, viewChild } from '@angular/core';
import { SqlEditorFileService, FileNode } from './sql-editor-file.service';
import { TreeNodeComponent } from './tree-node.component';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: FileNode | null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  imports: [TreeNodeComponent],
  standalone: true,
})
export class FileExplorerComponent {
  private readonly fileService = inject(SqlEditorFileService);
  protected readonly fileSvc = this.fileService;

  readonly fileOpen = output<string>();
  readonly dirtyFiles = input<Set<string>>(new Set());

  protected contextMenu: ContextMenuState = { visible: false, x: 0, y: 0, node: null };
  protected closeTargetFolder: string | null = null;
  protected renameTarget: FileNode | null = null;
  protected renameValue = '';
  private menuOpen = false;

  protected newItemType: 'file' | 'folder' | null = null;
  protected newItemName = '';
  private newItemParentDir = '';
  readonly newItemInputEl = viewChild<ElementRef<HTMLInputElement>>('newItemInputEl');

  @HostListener('document:click')
  protected onDocumentClick(): void {
    if (!this.menuOpen) {
      this.contextMenu = { visible: false, x: 0, y: 0, node: null };
      this.closeTargetFolder = null;
    }
    this.menuOpen = false;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.contextMenu = { visible: false, x: 0, y: 0, node: null };
    this.closeTargetFolder = null;
  }

  protected toggleNode(node: FileNode): void {
    if (node.isDirectory) {
      this.fileService.toggleExpand(node);
    }
  }

  protected openFile(node: FileNode): void {
    if (!node.isDirectory) {
      this.fileOpen.emit(node.path);
    }
  }

  protected getFolderName(folderPath: string): string {
    const parts = folderPath.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || folderPath;
  }

  protected onRootFolderClick(folderPath: string): void {
    this.fileService.setActiveFolder(folderPath);
  }

  protected onRootFolderContextMenu(event: MouseEvent, folderPath: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.menuOpen = true;
    this.closeTargetFolder = folderPath;
    this.contextMenu = { visible: true, x: event.clientX, y: event.clientY, node: null };
  }

  protected onEmptyAreaContextMenu(event: MouseEvent): void {
    event.preventDefault();
    const targetFolder = this.fileSvc.activeFolder();
    if (!targetFolder) return;
    this.menuOpen = true;
    this.closeTargetFolder = targetFolder;
    this.contextMenu = { visible: true, x: event.clientX, y: event.clientY, node: null };
  }

  protected onNodeContextMenu(event: { event: MouseEvent; node: FileNode }): void {
    this.menuOpen = true;
    this.contextMenu = { visible: true, x: event.event.clientX, y: event.event.clientY, node: event.node };
  }

  protected closeContextMenu(): void {
    this.contextMenu = { visible: false, x: 0, y: 0, node: null };
    this.closeTargetFolder = null;
    this.menuOpen = false;
  }

  protected createFile(): void {
    const node = this.contextMenu.node;
    const dir = node?.isDirectory ? node.path : this.closeTargetFolder;
    if (!dir) {
      this.closeContextMenu();
      return;
    }
    this.closeContextMenu();
    this.startNewItem(dir, 'file');
  }

  protected createFolder(): void {
    const node = this.contextMenu.node;
    const dir = node?.isDirectory ? node.path : this.closeTargetFolder;
    if (!dir) {
      this.closeContextMenu();
      return;
    }
    this.closeContextMenu();
    this.startNewItem(dir, 'folder');
  }

  protected deleteEntry(): void {
    const node = this.contextMenu.node;
    if (!node) {
      this.closeContextMenu();
      return;
    }
    if (confirm(`Delete "${node.name}"?`)) {
      this.fileService.deleteEntry(node.path);
      this.fileService.refreshAll();
    }
    this.closeContextMenu();
  }

  protected startRename(node: FileNode): void {
    this.closeContextMenu();
    this.renameTarget = node;
    this.renameValue = node.name;
  }

  protected submitRename(): void {
    if (!this.renameTarget || !this.renameValue.trim()) {
      this.renameTarget = null;
      return;
    }
    this.fileService.renameEntry(this.renameTarget.path, this.renameValue.trim());
    this.renameTarget = null;
    this.fileService.refreshAll();
  }

  protected cancelRename(): void {
    this.renameTarget = null;
  }

  protected startNewItem(parentDir: string, type: 'file' | 'folder'): void {
    this.newItemParentDir = parentDir;
    this.newItemType = type;
    this.newItemName = '';
    setTimeout(() => {
      this.newItemInputEl()?.nativeElement.focus();
    });
  }

  protected submitNewItem(): void {
    if (!this.newItemType || !this.newItemName.trim()) {
      this.newItemType = null;
      return;
    }
    if (this.newItemType === 'file') {
      this.fileService.createFile(this.newItemParentDir, this.newItemName.trim());
    } else {
      this.fileService.createFolder(this.newItemParentDir, this.newItemName.trim());
    }
    this.newItemType = null;
    this.newItemName = '';
    this.fileService.refreshAll();
  }

  protected cancelNewItem(): void {
    this.newItemType = null;
    this.newItemName = '';
  }

  protected showInExplorer(): void {
    const node = this.contextMenu.node;
    if (!node) {
      this.closeContextMenu();
      return;
    }
    this.fileService.showInExplorer(node.path);
    this.closeContextMenu();
  }

  protected openFileFromNode(): void {
    const node = this.contextMenu.node;
    if (!node || node.isDirectory) {
      this.closeContextMenu();
      return;
    }
    this.fileOpen.emit(node.path);
    this.closeContextMenu();
  }
}
