import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { DTCFG } from '@keira/shared/config';
import { SubscriptionHandler } from '@keira/shared/utils';
import { TableRow } from '@keira/shared/constants';
import { QueryError } from 'mysql2';
import { SqlEditorService } from './sql-editor.service';
import { SqlEditorFileService } from './sql-editor-file.service';
import { SqlEditorGitService } from './sql-editor-git.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QueryErrorComponent } from '@keira/shared/base-editor-components';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { CodeEditor } from '@acrodata/code-editor';
import { SqlTab } from './sql-tab.model';
import { TopBarComponent } from './top-bar.component';
import { FileExplorerComponent } from './file-explorer.component';
import { GitPanelComponent } from './git-panel.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.scss'],
  imports: [
    CodeEditor,
    TooltipModule,
    FormsModule,
    QueryErrorComponent,
    NgxDatatableModule,
    TranslateModule,
    TopBarComponent,
    FileExplorerComponent,
    GitPanelComponent,
  ],
})
export class SqlEditorComponent extends SubscriptionHandler implements OnInit {
  private readonly mysqlQueryService = inject(MysqlQueryService);
  protected readonly service = inject(SqlEditorService);
  protected readonly fileService = inject(SqlEditorFileService);
  protected readonly gitService = inject(SqlEditorGitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly DTCFG = DTCFG;
  private readonly MAX_COL_SHOWN = 20;
  private tabCounter = 0;

  private readonly initialTab: SqlTab = {
    id: crypto.randomUUID(),
    title: `filename${++this.tabCounter}.sql`,
    code: this.service.code,
    dirty: false,
    isNew: true,
    savedCode: this.service.code,
  };

  ngOnInit(): void {
    this.service.loadSchema();
  }

  //#region Split Panels
  protected explorerWidth = 260;
  protected explorerGitSplit = 200;
  protected codeHeight = 300;
  private dragging: { type: 'col' | 'row' | 'explorer'; startX: number; startY: number; startSize: number } | null = null;

  protected startSplitDrag(event: MouseEvent, type: 'col' | 'row'): void {
    event.preventDefault();
    this.dragging = {
      type,
      startX: event.clientX,
      startY: event.clientY,
      startSize: type === 'col' ? this.explorerWidth : this.codeHeight,
    };
    this.setBodyCursor(type === 'col' ? 'col-resize' : 'row-resize');
  }

  protected startExplorerSplitDrag(event: MouseEvent): void {
    event.preventDefault();
    this.dragging = { type: 'explorer', startX: event.clientX, startY: event.clientY, startSize: this.explorerGitSplit };
    this.setBodyCursor('row-resize');
  }

  @HostListener('document:mousemove', ['$event'])
  protected onSplitDrag(event: MouseEvent): void {
    if (!this.dragging) return;
    if (this.dragging.type === 'col') {
      const delta = event.clientX - this.dragging.startX;
      this.explorerWidth = Math.max(180, Math.min(600, this.dragging.startSize + delta));
    } else if (this.dragging.type === 'explorer') {
      const delta = event.clientY - this.dragging.startY;
      this.explorerGitSplit = Math.max(80, Math.min(1000, this.dragging.startSize + delta));
    } else {
      const delta = event.clientY - this.dragging.startY;
      this.codeHeight = Math.max(100, Math.min(800, this.dragging.startSize + delta));
    }
    this.changeDetectorRef.markForCheck();
  }

  @HostListener('document:mouseup')
  protected onSplitDragEnd(): void {
    if (this.dragging) {
      this.setBodyCursor('');
      this.dragging = null;
    }
  }

  private setBodyCursor(cursor: string): void {
    document.body.style.cursor = cursor;
    document.body.style.userSelect = cursor ? 'none' : '';
  }
  //#endregion

  //#region Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  protected handleKeyboardEvent(event: KeyboardEvent): void {
    const ctrl = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (ctrl && key === 'n') {
      event.preventDefault();
      this.newTab();
      return;
    }
    if (ctrl && !event.shiftKey && key === 's') {
      event.preventDefault();
      this.save();
      return;
    }
    if (ctrl && event.shiftKey && key === 's') {
      event.preventDefault();
      this.saveAs();
      return;
    }
    if (ctrl && !event.shiftKey && key === 'o') {
      event.preventDefault();
      this.openFileDialog();
      return;
    }
    if (ctrl && event.shiftKey && key === 'o') {
      event.preventDefault();
      this.fileService.addFolder();
      return;
    }
  }
  //#endregion

  //#region Tabs
  protected tabs: SqlTab[] = [this.initialTab];
  protected selectedTabId = this.initialTab.id;

  protected get activeTab(): SqlTab {
    return this.tabs.find((t) => t.id === this.selectedTabId)!;
  }

  protected newTab(): void {
    this.tabCounter++;
    const tab: SqlTab = {
      id: crypto.randomUUID(),
      title: `filename${this.tabCounter}.sql`,
      code: '',
      dirty: false,
      isNew: true,
      savedCode: '',
    };
    this.tabs.push(tab);
    this.selectedTabId = tab.id;
    this.changeDetectorRef.markForCheck();
  }

  protected get dirtyFilePaths(): Set<string> {
    return new Set(this.tabs.filter((t) => t.dirty && t.path).map((t) => t.path!));
  }

  protected async closeTab(id: string): Promise<void> {
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index === -1) return;

    const tab = this.tabs[index];
    if (tab.dirty) {
      const result = confirm(`"${tab.title}" has unsaved changes. Do you want to save before closing?`);
      if (result) {
        if (tab.path) {
          this.fileService.writeFile(tab.path, tab.code);
          tab.dirty = false;
        } else {
          const filePath = await this.fileService.saveAs(tab.title, tab.code);
          if (!filePath) {
            this.changeDetectorRef.markForCheck();
            return;
          }
          tab.path = filePath;
          tab.title = filePath.replace(/\\/g, '/').split('/').pop() || tab.title;
          tab.dirty = false;
          tab.isNew = false;
        }
      }
    }

    this.tabs.splice(index, 1);
    if (this.selectedTabId === id && this.tabs.length > 0) {
      this.selectedTabId = this.tabs[0].id;
    }
    if (this.tabs.length === 0) {
      this.newTab();
    }
    this.changeDetectorRef.markForCheck();
  }

  protected onCodeChange(tab: SqlTab, code: string): void {
    const normalized = code.replace(/\r\n/g, '\n');
    tab.code = normalized;
    const isDirty = normalized !== tab.savedCode;
    if (tab.dirty !== isDirty) {
      tab.dirty = isDirty;
    }
  }
  //#endregion

  //#region Results (per tab)
  protected get resultError(): QueryError | undefined {
    return this.activeTab.result?.error;
  }

  protected get resultRows(): TableRow[] {
    return this.activeTab.result?.rows || [];
  }

  protected get resultColumns(): string[] {
    return this.activeTab.result?.columns || [];
  }

  protected get resultAffectedRows(): number {
    return this.activeTab.result?.affectedRows ?? -1;
  }

  protected get resultMessage(): string {
    return this.activeTab.result?.message || '';
  }
  //#endregion

  //#region File Operations
  protected onFileOpen(filePath: string): void {
    const content = this.fileService.readFile(filePath).replace(/\r\n/g, '\n');
    const fileName = filePath.replace(/\\/g, '/').split('/').pop() || 'file.sql';

    const existingTab = this.tabs.find((t) => t.path === filePath);
    if (existingTab) {
      this.selectedTabId = existingTab.id;
      return;
    }

    const tab: SqlTab = {
      id: crypto.randomUUID(),
      title: fileName,
      code: content,
      dirty: false,
      path: filePath,
      isNew: false,
      savedCode: content,
    };
    this.tabs.push(tab);
    this.selectedTabId = tab.id;
    this.changeDetectorRef.markForCheck();
  }

  protected async openFileDialog(): Promise<void> {
    const filePath = await this.fileService.openFileDialog();
    if (filePath) {
      this.onFileOpen(filePath);
    }
  }

  protected save(): void {
    const tab = this.activeTab;
    if (!tab) return;

    if (tab.path) {
      this.fileService.writeFile(tab.path, tab.code);
      tab.savedCode = tab.code;
      tab.dirty = false;
    } else {
      this.saveAs();
    }
  }

  protected async saveAs(): Promise<void> {
    const tab = this.activeTab;
    if (!tab) return;

    const defaultName = tab.isNew ? tab.title : tab.path?.replace(/\\/g, '/').split('/').pop() || tab.title;
    const filePath = await this.fileService.saveAs(defaultName, tab.code);

    if (filePath) {
      tab.path = filePath;
      tab.title = filePath.replace(/\\/g, '/').split('/').pop() || tab.title;
      tab.savedCode = tab.code;
      tab.dirty = false;
      tab.isNew = false;
      this.changeDetectorRef.markForCheck();
    }
  }
  //#endregion

  //#region Button Actions
  protected execute(): void {
    const tab = this.activeTab;
    const query = tab.code;
    if (!query || !query.trim()) return;

    this.subscriptions.push(
      this.mysqlQueryService.query(query).subscribe({
        next: (rows: TableRow[] | { affectedRows: number; message: string }) => {
          const result: SqlTab['result'] = {
            error: undefined,
            affectedRows: -1,
            rows: [],
            columns: [],
            message: '',
          };
          if (!Array.isArray(rows)) {
            result.affectedRows = rows.affectedRows;
            result.message = rows.message;
          } else if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            result.columns = columns.length > this.MAX_COL_SHOWN ? columns.slice(0, this.MAX_COL_SHOWN) : columns;
            result.rows = rows;
          }
          tab.result = result;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          tab.result = { error, rows: [], columns: [], affectedRows: -1, message: '' };
          this.changeDetectorRef.markForCheck();
        },
      }),
    );
  }
  //#endregion
}
