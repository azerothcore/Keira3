import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { FileNode } from './sql-editor-file.service';
import { TreeNodeComponent } from './tree-node.component';
import { take } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-db-explorer',
  templateUrl: './db-explorer.component.html',
  styleUrls: ['./db-explorer.component.scss'],
  standalone: true,
  imports: [TreeNodeComponent],
})
export class DbExplorerComponent {
  private readonly mysqlQueryService = inject(MysqlQueryService);

  readonly selectQuery = output<string>();

  private readonly _dbNodes = signal<FileNode[]>([]);
  protected readonly dbNodes = this._dbNodes.asReadonly();

  private readonly nodeMeta = new Map<string, 'database' | 'table'>();

  constructor() {
    this.loadDatabases();
  }

  private loadDatabases(): void {
    this.mysqlQueryService
      .query('SHOW DATABASES')
      .pipe(take(1))
      .subscribe({
        next: (rows) => {
          const nodes: FileNode[] = rows.map((r) => {
            const name = Object.values(r)[0] as string;
            this.nodeMeta.set(name, 'database');
            return { name, path: name, isDirectory: true, children: [], expanded: false, icon: 'fa-database' };
          });
          this._dbNodes.set(nodes);
        },
      });
  }

  protected onToggleNode(node: FileNode): void {
    const type = this.nodeMeta.get(node.path);
    if (!type) return;

    if (node.expanded) {
      this.setNodeExpanded(node.path, false);
      return;
    }

    if (type === 'database') {
      this.loadTables(node);
    } else if (type === 'table') {
      this.loadColumns(node);
      this.emitSelectQuery(node);
    }
  }

  protected onOpenNode(node: FileNode): void {
    // clicked a column (leaf node) — open the parent table's SELECT query
    const parts = node.path.split('.');
    if (parts.length === 3) {
      this.selectQuery.emit(`SELECT * FROM \`${parts[0]}\`.\`${parts[1]}\` LIMIT 100`);
    }
  }

  private emitSelectQuery(node: FileNode): void {
    const [db, table] = this.getDbAndTable(node);
    if (db && table) {
      this.selectQuery.emit(`SELECT * FROM \`${db}\`.\`${table}\` LIMIT 100`);
    }
  }

  private loadTables(dbNode: FileNode): void {
    this.mysqlQueryService
      .query(`SHOW TABLES FROM \`${dbNode.name}\``)
      .pipe(take(1))
      .subscribe({
        next: (rows) => {
          const tableNodes: FileNode[] = rows.map((r) => {
            const tableName = Object.values(r)[0] as string;
            const path = `${dbNode.name}.${tableName}`;
            this.nodeMeta.set(path, 'table');
            return { name: tableName, path, isDirectory: true, children: [], expanded: false, icon: 'fa-table' };
          });
          this._dbNodes.update((nodes) =>
            nodes.map((db) => (db.path === dbNode.path ? { ...db, expanded: true, children: tableNodes } : db)),
          );
        },
      });
  }

  private loadColumns(tableNode: FileNode): void {
    const [db, table] = this.getDbAndTable(tableNode);
    if (!db || !table) return;

    this.mysqlQueryService
      .query(`SHOW COLUMNS FROM \`${db}\`.\`${table}\``)
      .pipe(take(1))
      .subscribe({
        next: (rows) => {
          const colNodes: FileNode[] = rows.map((r) => {
            const row = r as Record<string, unknown>;
            return {
              name: `${row['Field'] as string} (${row['Type'] as string})`,
              path: `${tableNode.path}.${row['Field'] as string}`,
              isDirectory: false,
            };
          });
          this._dbNodes.update((nodes) =>
            this.updateInTree(nodes, tableNode.path, (node) => ({ ...node, expanded: true, children: colNodes })),
          );
        },
      });
  }

  private setNodeExpanded(path: string, expanded: boolean): void {
    this._dbNodes.update((nodes) => this.updateInTree(nodes, path, (node) => ({ ...node, expanded })));
  }

  private updateInTree(nodes: FileNode[], targetPath: string, update: (node: FileNode) => FileNode): FileNode[] {
    return nodes.map((node) => {
      if (node.path === targetPath) return update(node);
      if (node.children) return { ...node, children: this.updateInTree(node.children, targetPath, update) };
      return node;
    });
  }

  private getDbAndTable(node: FileNode): [string, string] | [null, null] {
    const parts = node.path.split('.');
    if (parts.length === 2) return [parts[0], parts[1]];
    return [null, null];
  }
}
