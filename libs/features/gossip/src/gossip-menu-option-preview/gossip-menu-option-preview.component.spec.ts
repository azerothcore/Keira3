import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { GossipMenuOption } from '@keira/shared/acore-world-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GossipMenuOptionPreviewComponent } from './gossip-menu-option-preview.component';

@Component({
  template: `<keira-gossip-menu-option-preview [options]="options()" [show]="show()" />`,
  imports: [GossipMenuOptionPreviewComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(GossipMenuOptionPreviewComponent);
  readonly options = signal<GossipMenuOption[]>([]);
  readonly show = signal(true);
}

class GossipMenuOptionPreviewPage extends PageObject<TestHostComponent> {
  get container(): HTMLElement {
    return this.query<HTMLElement>('.preview-container');
  }
  get gossipPreview(): HTMLElement {
    return this.query<HTMLElement>('.gossip-preview');
  }
  get paragraphs(): NodeListOf<HTMLParagraphElement> {
    return this.gossipPreview.querySelectorAll('p');
  }
  imagesInParagraph(index: number): NodeListOf<HTMLImageElement> {
    return this.paragraphs[index].querySelectorAll('img');
  }
}

describe('GossipMenuOptionPreviewComponent', () => {
  const makeOption = (overrides: Partial<GossipMenuOption> = {}): GossipMenuOption => {
    const opt = new GossipMenuOption();
    Object.assign(opt, overrides);
    return opt;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GossipMenuOptionPreviewComponent, TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new GossipMenuOptionPreviewPage(fixture);
    fixture.detectChanges();
    return { fixture, host, page };
  }

  it('renders one paragraph per option', () => {
    const { host, page, fixture } = setup();
    host.options.set([makeOption({ OptionIcon: 0, OptionText: 'A' }), makeOption({ OptionIcon: 1, OptionText: 'B' })]);
    fixture.detectChanges();

    expect(page.paragraphs.length).toBe(2);
  });

  it('renders an <img> when the option icon is mapped in OPTION_IMG', () => {
    const { host, page, fixture } = setup();
    host.options.set([makeOption({ OptionIcon: 0, OptionText: 'mock' })]);
    fixture.detectChanges();

    const imgs = page.imagesInParagraph(0);
    expect(imgs.length).toBe(1);
    expect(imgs[0].getAttribute('src')).toBe('assets/img/gossip/chat.png');
  });

  it('does NOT render an <img> when the option icon is unmapped (null entry)', () => {
    const { host, page, fixture } = setup();
    // Index 14 is `null` in OPTION_IMG -> falsy -> @if branch skipped
    host.options.set([makeOption({ OptionIcon: 14, OptionText: 'mock' })]);
    fixture.detectChanges();

    expect(page.imagesInParagraph(0).length).toBe(0);
  });

  it('renders the OptionText content', () => {
    const { host, page, fixture } = setup();
    host.options.set([makeOption({ OptionIcon: 0, OptionText: 'Hello world' })]);
    fixture.detectChanges();

    expect(page.paragraphs[0].textContent).toContain('Hello world');
  });

  it('applies the hide-preview class when show is false', () => {
    const { host, page, fixture } = setup();
    host.show.set(false);
    fixture.detectChanges();

    expect(page.container.classList.contains('hide-preview')).toBe(true);
    expect(page.container.classList.contains('show-preview')).toBe(false);
  });
});
