import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { filter } from 'rxjs';
import { TableRow } from '@keira/shared/constants';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { TranslateModule } from '@ngx-translate/core';
import { QueryErrorComponent } from './query-error/query-error.component';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { EditorService } from '@keira/shared/base-abstract-classes';
import { SubscriptionHandler } from '@keira/shared/utils';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss'],
  standalone: true,
  imports: [NgIf, FormsModule, HighlightjsWrapperComponent, QueryErrorComponent, TranslateModule],
})
export class QueryOutputComponent<T extends TableRow> extends SubscriptionHandler {
  @Input() docUrl: string;
  @Input() editorService: EditorService<T>;
  @Output() executeQuery = new EventEmitter<string>();
  selectedQuery: 'diff' | 'full' = 'diff';
  private modalRef: BsModalRef;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor(
    private clipboardService: ClipboardService,
    private modalService: BsModalService,
  ) {
    super();
  }

  showFullQuery(): boolean {
    if (this.editorService.isNew) {
      return true;
    }
    return this.selectedQuery === 'full';
  }

  copy(): void {
    if (this.showFullQuery()) {
      this.clipboardService.copyFromContent(this.editorService.fullQuery);
    } else {
      this.clipboardService.copyFromContent(this.editorService.diffQuery);
    }
  }

  execute(): void {
    if (this.showFullQuery()) {
      this.executeQuery.emit(this.editorService.fullQuery);
    } else {
      this.executeQuery.emit(this.editorService.diffQuery);
    }
  }

  reload(): void {
    if (!this.editorService.diffQuery) {
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
