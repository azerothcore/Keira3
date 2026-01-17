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
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { filter } from 'rxjs';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryError } from 'mysql2';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss'],
  imports: [FormsModule, HighlightjsWrapperComponent, QueryErrorComponent, TranslateModule],
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
