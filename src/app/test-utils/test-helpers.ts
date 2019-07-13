import { TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap';

export function closeModalsAfterEach(upToLevel: number = 1) {
  afterEach(() => {
    const modalService: BsModalService = TestBed.get(BsModalService);

    for (let level = 1; level <= upToLevel; level++) {
      modalService.hide(level);
    }
  });
}
