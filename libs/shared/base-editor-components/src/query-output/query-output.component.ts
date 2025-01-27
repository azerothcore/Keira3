import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
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
import { ValidationService } from '@keira/shared/common-services';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss'],
  standalone: true,
  imports: [FormsModule, HighlightjsWrapperComponent, QueryErrorComponent, TranslateModule],
})
export class QueryOutputComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  private readonly clipboardService = inject(ClipboardService);
  private readonly modalService = inject(BsModalService);
  private readonly validationService = inject(ValidationService);

  @Input() docUrl!: string;
  @Input() editorService!: EditorService<T>;
  @Output() executeQuery = new EventEmitter<string>();
  selectedQuery: 'diff' | 'full' = 'diff';
  private modalRef!: BsModalRef;
  protected validationPassed: boolean = true;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.subscriptions.push(
      this.validationService.validationPassed$.subscribe((validationPassed: boolean) => {
        this.validationPassed = validationPassed;
        this.changeDetectorRef.detectChanges();
      }),
    );
  }

  showFullQuery(): boolean {
    return this.editorService.isNew || this.selectedQuery === 'full';
  }

  copy(): void {
    this.clipboardService.copyFromContent(this.getQuery());
  }

  execute(): void {
    this.executeQuery.emit(this.getQuery());
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

  private getQuery(): string {
    return this.showFullQuery() ? this.editorService.fullQuery : this.editorService.diffQuery;
  }
}
