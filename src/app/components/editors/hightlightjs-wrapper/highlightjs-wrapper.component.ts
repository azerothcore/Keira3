import { Component, Input } from '@angular/core';

// TODO:
//  Because of this bug: https://github.com/MurhafSousli/ngx-highlightjs/issues/79
//  any component that uses ngx-highlightjs directly becomes untestable, so we use a wrapper.

@Component({
  selector: 'app-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
})
export class HighlightjsWrapperComponent {
  @Input() code: string;
}
