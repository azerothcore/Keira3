import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-full-editor',
  templateUrl: './sai-full-editor.component.html',
  styleUrls: ['./sai-full-editor.component.scss'],
  standalone: true,
  imports: [SaiEditorComponent],
})
export class SaiFullEditorComponent {}
