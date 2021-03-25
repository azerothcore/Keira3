import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';

import { EditorService } from '../../abstract/service/editors/editor.service';
import { TableRow } from '../../types/general';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'keira-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss']
})
export class QueryOutputComponent<T extends TableRow> extends SubscriptionHandler {
  @Input() docUrl: string;
  @Input() editorService: EditorService<T>;
  @Output() executeQuery = new EventEmitter<string>();
  selectedQuery: 'diff'|'full' = 'diff';
  private modalRef: BsModalRef;

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
      this.editorService.reloadSameEntity();
      return;
    }

    const initialState = {
      title: 'Confirm reset?',
      content: 'Are you sure you want to discard the changes and reload the data from the database?'
    };
    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });

    this.subscriptions.push(
      this.modalRef.content.onClose.pipe(
        filter(result => !!result)
      ).subscribe(this.editorService.reloadSameEntity.bind(this.editorService)),
    );
  }
}
