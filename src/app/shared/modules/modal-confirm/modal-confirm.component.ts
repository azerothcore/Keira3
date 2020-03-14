import { BsModalRef } from 'ngx-bootstrap/modal';
import { OnInit, Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'keira-modal-confirm',
  templateUrl: './modal-confirm.component.html',
})
export class ModalConfirmComponent implements OnInit {

    public onClose: Subject <boolean>;
    title: string;
    content: string;

    constructor(private _bsModalRef: BsModalRef) {}

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
