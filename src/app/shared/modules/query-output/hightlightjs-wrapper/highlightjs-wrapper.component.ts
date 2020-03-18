import { Component, Input } from '@angular/core';

@Component({
  selector: 'keira-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
})
export class HighlightjsWrapperComponent {
  @Input() code: string;
}
