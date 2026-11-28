import { Component } from '@angular/core';
import { SaiEditorComponent } from '@keira/shared/sai-editor';

@Component({
  selector: 'keira-sai-full-editor',
  templateUrl: './sai-full-editor.component.html',
  styleUrls: ['./sai-full-editor.component.scss'],
  imports: [SaiEditorComponent],
})
export class SaiFullEditorComponent {}
