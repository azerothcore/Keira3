import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-sai-full-editor',
  templateUrl: './sai-full-editor.component.html',
  styleUrls: ['./sai-full-editor.component.scss'],
})
export class SaiFullEditorComponent {}
