import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from './modal-confirm.component';
import { KeiraPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import Spy = jasmine.Spy;

class ModalConfirmComponentPage extends KeiraPageObject<ModalConfirmComponent> {
  get yesBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#yes');
  }
  get noBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#no');
  }
}

describe('ModalConfirmComponent', () => {
  let component: ModalConfirmComponent;
  let fixture: ComponentFixture<ModalConfirmComponent>;
  let hideSpy: Spy;
  let page: ModalConfirmComponentPage;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalConfirmComponent, TranslateTestingModule],
      providers: [BsModalRef],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new ModalConfirmComponentPage(fixture);

    hideSpy = spyOn(TestBed.inject(BsModalRef), 'hide');
  });

  it('onConfirm() should correctly hide the modal', () => {
    const nextSpy = spyOn(component.onClose, 'next');

    page.yesBtn.click();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });

  it('onCancel() should correctly hide the modal', () => {
    const nextSpy = spyOn(component.onClose, 'next');

    page.noBtn.click();

    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });
});
