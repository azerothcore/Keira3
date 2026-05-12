import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { DTCFG } from '@keira/shared/config';
import { SubscriptionHandler } from '@keira/shared/utils';
import { TableRow } from '@keira/shared/constants';
import { QueryError } from 'mysql2';
import { EditorRouteService } from '@keira/shared/common-services';
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
import { DbExplorerComponent } from './db-explorer.component';

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
    DbExplorerComponent,
  ],
})
export class SqlEditorComponent extends SubscriptionHandler implements OnInit {
  private readonly mysqlQueryService = inject(MysqlQueryService);
  private readonly editorRouteService = inject(EditorRouteService);
  protected readonly service = inject(SqlEditorService);
  protected readonly fileService = inject(SqlEditorFileService);
  protected readonly gitService = inject(SqlEditorGitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly DTCFG = DTCFG;
  private readonly MAX_COL_SHOWN = 20;
  private tabCounter = 0;
  protected detectedTable = '';
  protected selectedRows: Record<string, unknown>[] = [];

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
  protected codeHeight = 300;
  private dragging: { type: 'col' | 'row'; startX: number; startY: number; startSize: number } | null = null;

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

  @HostListener('document:mousemove', ['$event'])
  protected onSplitDrag(event: MouseEvent): void {
    if (this.dragging) {
      if (this.dragging.type === 'col') {
        const delta = event.clientX - this.dragging.startX;
        this.explorerWidth = Math.max(180, Math.min(600, this.dragging.startSize + delta));
      } else {
        const delta = event.clientY - this.dragging.startY;
        this.codeHeight = Math.max(100, Math.min(800, this.dragging.startSize + delta));
      }
      this.changeDetectorRef.markForCheck();
    } else if (this.sectionDrag) {
      const delta = event.clientY - this.sectionDrag.startY;
      this.sectionHeights[this.sectionDrag.target] = Math.max(80, this.sectionDrag.startHeight + delta);
      this.changeDetectorRef.markForCheck();
    }
  }

  @HostListener('document:mouseup')
  protected onSplitDragEnd(): void {
    if (this.dragging) {
      this.setBodyCursor('');
      this.dragging = null;
    }
    if (this.sectionDrag) {
      this.setBodyCursor('');
      this.sectionDrag = null;
    }
  }

  private setBodyCursor(cursor: string): void {
    document.body.style.cursor = cursor;
    document.body.style.userSelect = cursor ? 'none' : '';
  }
  //#endregion

  //#region Collapsible Sections
  protected explorerCollapsed = signal(false);
  protected dbCollapsed = signal(false);
  protected gitCollapsed = signal(false);
  protected sectionHeights = { explorer: 200, db: 200 };

  protected get explorerFlex(): string {
    return this.explorerCollapsed() ? '0 0 auto' : `0 0 ${this.sectionHeights.explorer}px`;
  }
  protected get dbFlex(): string {
    return this.dbCollapsed() ? '0 0 auto' : `0 0 ${this.sectionHeights.db}px`;
  }
  protected get gitFlex(): string {
    return this.gitCollapsed() ? '0 0 auto' : '1 1 auto';
  }

  protected toggleSection(section: 'explorer' | 'db' | 'git'): void {
    if (section === 'explorer') this.explorerCollapsed.update((v) => !v);
    else if (section === 'db') this.dbCollapsed.update((v) => !v);
    else if (section === 'git') this.gitCollapsed.update((v) => !v);
  }

  protected startSectionDrag(event: MouseEvent, target: 'explorer' | 'db'): void {
    event.preventDefault();
    this.sectionDrag = {
      target,
      startY: event.clientY,
      startHeight: target === 'explorer' ? this.sectionHeights.explorer : this.sectionHeights.db,
    };
    this.setBodyCursor('row-resize');
  }

  private sectionDrag: { target: 'explorer' | 'db'; startY: number; startHeight: number } | null = null;

  protected onSelectQuery(query: string): void {
    const tab = this.activeTab;
    tab.code = query;
    tab.dirty = true;
    this.changeDetectorRef.markForCheck();
  }
  //#endregion

  //#region Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  protected handleKeyboardEvent(event: KeyboardEvent): void {
    const ctrl = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const alt = event.altKey;
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
    if (ctrl && key === 'w') {
      event.preventDefault();
      this.closeTab(this.selectedTabId);
      return;
    }
    if (alt && key === 'arrowleft') {
      event.preventDefault();
      this.selectPrevTab();
      return;
    }
    if (alt && key === 'arrowright') {
      event.preventDefault();
      this.selectNextTab();
      return;
    }
  }

  private selectPrevTab(): void {
    const idx = this.tabs.findIndex((t) => t.id === this.selectedTabId);
    if (idx > 0) {
      this.selectedTabId = this.tabs[idx - 1].id;
      this.changeDetectorRef.markForCheck();
    }
  }

  private selectNextTab(): void {
    const idx = this.tabs.findIndex((t) => t.id === this.selectedTabId);
    if (idx < this.tabs.length - 1) {
      this.selectedTabId = this.tabs[idx + 1].id;
      this.changeDetectorRef.markForCheck();
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

  protected onResultRowSelect(event: { selected: Record<string, unknown>[] }): void {
    if (event.selected.length > 0 && this.detectedTable) {
      this.editorRouteService.navigateToEditor(this.detectedTable, event.selected[0]);
    }
  }

  private detectTableFromQuery(query: string): string {
    const match = query.match(/\bFROM\s+[`'"]?(\w+)/i);
    return match ? match[1] : '';
  }

  //#region Button Actions
  protected execute(): void {
    const tab = this.activeTab;
    const query = tab.code;
    if (!query || !query.trim()) return;

    this.detectedTable = this.detectTableFromQuery(query);

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
