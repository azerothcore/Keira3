import '@angular/compiler';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed();

if (typeof HTMLElement !== 'undefined') {
  const BLK = '\x01';
  const blockTags = new Set([
    'DIV',
    'P',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'LI',
    'TR',
    'BLOCKQUOTE',
    'SECTION',
    'ARTICLE',
    'HEADER',
    'FOOTER',
    'NAV',
    'UL',
    'OL',
    'DL',
    'TABLE',
    'HR',
    'FIGCAPTION',
    'FIGURE',
    'DETAILS',
    'SUMMARY',
  ]);
  function getInnerTextPoly(node: Node, insidePre: boolean): string {
    if (node.nodeType === 3) return node.nodeValue || '';
    if (node.nodeType !== 1) return '';
    const el = node as Element;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE') return '';
    if (tag === 'BR') return '\n';
    const isPre = tag === 'PRE';
    const isBlock = blockTags.has(tag) || isPre;
    const childPre = insidePre || isPre;
    let text = '';
    for (const child of Array.from(node.childNodes)) {
      text += getInnerTextPoly(child, childPre);
    }
    if (!insidePre && !isPre) {
      text = text.replace(/[ \t]+/g, ' ');
    }
    if (isBlock) {
      text = BLK + text + BLK;
    }
    return text;
  }
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    get(this: HTMLElement) {
      let text = '';
      for (const child of Array.from(this.childNodes)) {
        text += getInnerTextPoly(child, false);
      }
      text = text.replace(new RegExp(BLK + '+', 'g'), '\n');
      const lines = text.split('\n');
      const trimmed = lines.map((l) => l.trim()).join('\n');
      return trimmed.replace(/^\n+/, '').replace(/\n$/, '');
    },
    set(this: HTMLElement, value: string) {
      this.textContent = value;
    },
    configurable: true,
  });
}
