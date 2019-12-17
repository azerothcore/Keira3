import { Component, } from '@angular/core';
import { SaiEditorComponent } from '../../shared/sai-editor/sai-editor.component';

@Component({
  selector: 'app-sai-full-editor',
  templateUrl: './sai-full-editor.component.html',
  styleUrls: ['./sai-full-editor.component.scss']
})
export class SaiFullEditorComponent extends SaiEditorComponent { }
