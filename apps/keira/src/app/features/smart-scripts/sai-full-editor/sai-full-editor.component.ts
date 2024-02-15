import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-full-editor',
  templateUrl: './sai-full-editor.component.html',
  styleUrls: ['./sai-full-editor.component.scss'],
})
export class SaiFullEditorComponent {}
