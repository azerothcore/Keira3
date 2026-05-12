import { ChangeDetectionStrategy, Component, input, output, model } from '@angular/core';
import { FileNode } from './sql-editor-file.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  standalone: true,
})
export class TreeNodeComponent {
  readonly node = input.required<FileNode>();
  readonly depth = input(0);
  readonly dirtyFiles = input<Set<string>>(new Set());
  readonly renameTarget = input<FileNode | null>(null);
  readonly renameValue = model('');

  readonly toggleNode = output<FileNode>();
  readonly openFile = output<FileNode>();
  readonly contextMenu = output<{ event: MouseEvent; node: FileNode }>();
  readonly startRename = output<FileNode>();
  readonly submitRename = output<void>();
  readonly cancelRename = output<void>();

  protected isDirty(node: FileNode): boolean {
    return this.dirtyFiles().has(node.path);
  }

  protected onNodeContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.emit({ event, node: this.node() });
  }
}
