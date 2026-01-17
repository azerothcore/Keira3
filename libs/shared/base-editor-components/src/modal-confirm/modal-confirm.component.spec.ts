import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from './modal-confirm.component';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';

class ModalConfirmComponentPage extends PageObject<ModalConfirmComponent> {
  get yesBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#yes');
  }
  get noBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#no');
  }
}

describe('ModalConfirmComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalConfirmComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), BsModalRef],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(ModalConfirmComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const page = new ModalConfirmComponentPage(fixture);
    const hideSpy = spyOn(TestBed.inject(BsModalRef), 'hide');
    return { fixture, component, page, hideSpy };
  }

  it('onConfirm() should correctly hide the modal', () => {
    const { component, page, hideSpy } = setup();
    const nextSpy = spyOn(component.onClose, 'next');

    page.yesBtn.click();

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });

  it('onCancel() should correctly hide the modal', () => {
    const { component, page, hideSpy } = setup();
    const nextSpy = spyOn(component.onClose, 'next');

    page.noBtn.click();

    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });
});
