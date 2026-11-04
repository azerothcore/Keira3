import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { WowClientService, WowDataSettingsService } from '@keira/shared/wow-data';
import { DisplaySearchComponent } from './display-search.component';
import { WORLD_RENDERER_FACTORY } from './world-renderer';

class DisplaySearchPage extends PageObject<DisplaySearchComponent> {
  async click(selector: string): Promise<void> {
    this.query<HTMLElement>(selector).click();
    await this.settle();
  }
  async settle(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }
    this.fixture.detectChanges();
  }
}

describe(DisplaySearchComponent.name, () => {
  const setup = (supported = true, findDisplays = vi.fn().mockResolvedValue([{ id: 5, model: 'World\\Mailbox.m2' }])) => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [DisplaySearchComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: WowClientService,
          useValue: {
            isSupported: () => supported,
            findDisplays,
            getGameObjectDisplay: vi.fn().mockResolvedValue(undefined),
            getTexture: vi.fn(),
          },
        },
        {
          provide: WORLD_RENDERER_FACTORY,
          useValue: () => ({ setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() }),
        },
      ],
    });
    TestBed.inject(WowDataSettingsService).save({ clientPath: '/wow', serverDataPath: '' });
    const control = new FormControl(0);
    const page = new DisplaySearchPage(TestBed.createComponent(DisplaySearchComponent));
    page.fixture.componentRef.setInput('kind', 'gameobject');
    page.fixture.componentRef.setInput('control', control);
    page.fixture.detectChanges();
    return { page, control, findDisplays };
  };

  it('finds a display by its model name, shows it and puts its id in the field', async () => {
    const { page, control, findDisplays } = setup();

    await page.click('#display-search-toggle');
    const text = page.query<HTMLInputElement>('#display-search-text');
    text.value = 'mailbox';
    text.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await page.settle();
    expect(findDisplays).toHaveBeenCalledWith('gameobject', 'mailbox');

    await page.click('[data-testid="display-5"]');
    expect(page.query('keira-local-model-viewer')).toBeTruthy();
    await page.click('#display-search-use');

    expect(control.value).toBe(5);
    expect(control.dirty).toBe(true);
    expect(page.query('#display-search', false)).toBeFalsy();
  });

  it('says when nothing has it, or the game data cannot be read', async () => {
    const findDisplays = vi.fn().mockResolvedValue([]);
    const { page } = setup(true, findDisplays);
    await page.click('#display-search-toggle');
    await page.click('#display-search-btn');
    expect(page.query('#display-search-none')).toBeTruthy();

    findDisplays.mockRejectedValue(new Error('no archive'));
    await page.click('#display-search-btn');
    expect(page.query('#display-search-error').textContent).toContain('no archive');
    findDisplays.mockRejectedValue('down');
    await page.click('#display-search-btn');
    expect(page.query('#display-search-error').textContent).toContain('down');
  });

  it('is not offered without the game data', () => {
    const { page } = setup(false);
    expect(page.query('#display-search-toggle', false)).toBeFalsy();
  });
});
