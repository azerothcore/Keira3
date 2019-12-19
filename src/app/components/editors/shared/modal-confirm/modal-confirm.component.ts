import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

export abstract class ModalConfirmComponent {

  protected result: boolean;

  constructor(
    protected modalService: BsModalService,
    protected bsModalRef: BsModalRef,
    public title: string,
    public content: string
  ) {}

  template = `
  <div class="modal-header">
    <h4 class="modal-title pull-left">{{ title }}</h4>
    <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
    {{ content }}
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-primary" (click)="confirm()">Yes</button>
    <button type="button" class="btn btn-secondary" (click)="decline()">No</button>
  </div>
`;

  openModal() {
    this.bsModalRef = this.modalService.show(this.template, { class: 'modal-sm' });
  }

  confirm(): void {
    this.result = true;
    this.bsModalRef.hide();
  }

  decline(): void {
    this.result = false;
    this.bsModalRef.hide();
  }
}
