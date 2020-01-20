import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-highlightjs-wrapper',
  templateUrl: './highlightjs-wrapper.component.html',
})
export class HighlightjsWrapperComponent {
  @Input() code: string;
}
