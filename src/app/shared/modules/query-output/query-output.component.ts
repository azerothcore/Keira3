import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { filter } from 'rxjs';
import { EditorService } from '../../abstract/service/editors/editor.service';
import { TableRow } from '../../types/general';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss'],
})
export class QueryOutputComponent<T extends TableRow> extends SubscriptionHandler {
  @Input() docUrl: string;
  @Input() editorService: EditorService<T>;
  @Output() executeQuery = new EventEmitter<string>();
  selectedQuery: 'diff' | 'full' = 'diff';
  private modalRef: BsModalRef;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor(private clipboardService: ClipboardService, private modalService: BsModalService) {
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
      this.editorService.reloadSameEntity(this.changeDetectorRef);
      return;
    }

    const initialState = {
      title: 'Confirm reset?',
      content: 'Are you sure you want to discard the changes and reload the data from the database?',
    };
    this.modalRef = this.modalService.show(ModalConfirmComponent, { initialState });

    this.subscriptions.push(
      this.modalRef.content.onClose
        .pipe(filter((result) => !!result))
        .subscribe(this.editorService.reloadSameEntity.bind(this.editorService)),
    );
  }
}
