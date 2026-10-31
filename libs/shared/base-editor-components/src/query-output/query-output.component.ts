import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { EditorService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { SubscriptionHandler } from '@keira/shared/utils';
import { TranslatePipe } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { filter } from 'rxjs';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryError } from 'mysql2';
import { reloadCommand, SoapService } from '@keira/shared/common-services';
import { CompareResult, compareEntities, EntityCompareService, EntitySnapshot } from './entity-compare';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss'],
  imports: [FormsModule, HighlightjsWrapperComponent, QueryErrorComponent, TranslatePipe],
})
export class QueryOutputComponent<T extends TableRow> extends SubscriptionHandler {
  private readonly clipboardService = inject(ClipboardService);
  private readonly modalService = inject(BsModalService);

  // TODO convert call to editorService.reloadSameEntity to output and remove this input
  @Input() editorService!: EditorService<T>;
  // TODO: convert to signal output
  @Output() executeQuery = new EventEmitter<string>();

  readonly isNew = input.required<boolean>();
  readonly diffQuery = input.required<string>();
  readonly fullQuery = input.required<string>();
  readonly error = input.required<QueryError>();
  readonly entityTable = input.required<string>();
  readonly docUrl = input<string>();
  readonly selectedQuery = signal<'diff' | 'full'>('diff');
  private modalRef!: BsModalRef;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private readonly soap = inject(SoapService);
  /** The worldserver's answer to the last `.reload` (and whether it failed), for the entity it was sent with. */
  private readonly reloadAnswer = signal<{ text: string; failed: boolean; entity: string } | undefined>(undefined);

  /** The answer to the last `.reload`, while the same entity is open. */
  protected shownReloadAnswer(): { text: string; failed: boolean } | undefined {
    const answer = this.reloadAnswer();
    return answer?.entity === this.editorService.loadedEntityId ? answer : undefined;
  }

  /** The `.reload` for this editor's table, when the server can be told (SOAP on) and has one. */
  reloadCommand(): string | undefined {
    return this.soap.available() ? reloadCommand(this.entityTable(), this.editorService.loadedEntityId) : undefined;
  }

  /** Tells the worldserver to read the table again (after the query was executed). */
  async reloadOnServer(command: string): Promise<void> {
    const entity = this.editorService.loadedEntityId;
    try {
      this.reloadAnswer.set({ text: (await this.soap.execute(command)) || command, failed: false, entity });
    } catch (error) {
      this.reloadAnswer.set({ text: (error as Error).message, failed: true, entity });
    }
  }

  private readonly compareService = inject(EntityCompareService);
  protected readonly pinned = this.compareService.pinned;
  protected readonly showCompare = signal(false);

  /** The entity shown, as rows (for comparing it with another). */
  private snapshot(): EntitySnapshot {
    const editor = this.editorService as EditorService<T> & { newRows?: T[]; entitySecondIdField?: string; entityExtraIdField?: string };
    return {
      table: this.entityTable(),
      id: editor.loadedEntityId,
      rows: editor.newRows ? [...editor.newRows] : [editor.form.getRawValue() as TableRow],
      ...(editor.newRows
        ? { key: editor.entitySecondIdField, ...(editor.entityExtraIdField ? { extraKey: editor.entityExtraIdField } : {}) }
        : {}),
    };
  }

  /** Pins the entity shown for comparison, or unpins it. */
  togglePin(): void {
    const pinned = this.pinned();
    this.compareService.pinned.set(pinned && this.isPinnedHere() ? undefined : this.snapshot());
    this.showCompare.set(false);
  }

  /** Whether the pinned entity is the one shown. */
  isPinnedHere(): boolean {
    const pinned = this.pinned();
    return !!pinned && pinned.table === this.entityTable() && pinned.id === this.editorService.loadedEntityId;
  }

  /** Whether another entity of this editor is pinned (to compare with). */
  canCompare(): boolean {
    const pinned = this.pinned();
    return !!pinned && pinned.table === this.entityTable() && pinned.id !== this.editorService.loadedEntityId;
  }

  /** How the entity shown differs from the pinned one. */
  comparison(): CompareResult {
    return compareEntities(this.pinned() as EntitySnapshot, this.snapshot());
  }

  readonly showFullQuery = computed<boolean>(() => this.isNew() || this.selectedQuery() === 'full');

  readonly getQuery = computed<string>(() => (this.showFullQuery() ? this.fullQuery() : this.diffQuery()));

  copy(): void {
    this.clipboardService.copyFromContent(this.getQuery());
  }

  execute(): void {
    this.executeQuery.emit(this.getQuery());
  }

  reload(): void {
    if (!this.diffQuery()) {
      // if no changes to discard, just reload without asking confirmation
      setTimeout(() => {
        // since the OnPush migration, for some reason we need to wrap this inside a setTimeout otherwise it does not work
        this.editorService.reloadSameEntity(this.changeDetectorRef);
      });

      return;
    }

    const initialState = {
      title: 'Confirm reset?',
      content: 'Are you sure you want to discard the changes and reload the data from the database?',
    };
    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });

    this.subscriptions.push(
      this.modalRef.content.onClose.pipe(filter((result) => !!result)).subscribe(() => {
        this.editorService.reloadSameEntity(this.changeDetectorRef);
      }),
    );
  }
}
