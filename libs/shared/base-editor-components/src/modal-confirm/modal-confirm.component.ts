import { BsModalRef } from 'ngx-bootstrap/modal';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  imports: [TranslateModule],
})
export class ModalConfirmComponent implements OnInit {
  private readonly _bsModalRef = inject(BsModalRef);

  public onClose!: Subject<boolean>;
  title!: string;
  content!: string;

  public ngOnInit(): void {
    this.onClose = new Subject();
  }

  public onConfirm(): void {
    this.onClose.next(true);
    this._bsModalRef.hide();
  }

  public onCancel(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }
}
