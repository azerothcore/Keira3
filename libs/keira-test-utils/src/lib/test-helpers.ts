import { TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';

export function closeModalsAfterEach() {
  afterEach(() => {
    const modalService: BsModalService = TestBed.inject(BsModalService);
    modalService?.hide();
  });
}

export type Spied<T> = {
  [Method in keyof T]: jasmine.Spy;
};
