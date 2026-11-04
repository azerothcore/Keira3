import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { WowClientService, WowDataSettingsService } from '@keira/shared/wow-data';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { SpellInfoModalComponent } from './spell-info-modal.component';
import { SpellSelectorBtnComponent } from './spell-selector-btn.component';

describe('SpellSelectorBtnComponent', () => {
  const setup = (supported: boolean, clientPath: string, value = 133) => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ModalDirective, SpellSelectorBtnComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: WowClientService, useValue: { isSupported: () => supported } },
      ],
    });
    TestBed.inject(WowDataSettingsService).save({ clientPath, serverDataPath: '' });
    const show = vi.spyOn(TestBed.inject(BsModalService), 'show').mockReturnValue({} as never);
    const fixture = TestBed.createComponent(SpellSelectorBtnComponent);
    fixture.componentInstance.control = new FormControl(value);
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('config', { name: 'spell' });
    fixture.detectChanges();
    const infoButton = (): HTMLButtonElement | null => fixture.nativeElement.querySelector('#spell-spell-info-btn');
    return { fixture, show, infoButton };
  };

  afterEach(() => localStorage.clear());

  it("shows the spell's info from the game client", () => {
    const { show, infoButton } = setup(true, '/wow');

    infoButton()?.click();

    expect(show).toHaveBeenCalledWith(SpellInfoModalComponent, { class: 'modal-lg', initialState: { spellId: 133 } });
  });

  it('has no info without the game client, or without a spell', () => {
    expect(setup(false, '/wow').infoButton()).toBeNull();
    TestBed.resetTestingModule();
    expect(setup(true, '').infoButton()).toBeNull();
    TestBed.resetTestingModule();
    expect(setup(true, '/wow', 0).infoButton()).toBeNull();
  });
});
