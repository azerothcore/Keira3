import { Component } from '@angular/core';
import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';

@Component({
  selector: 'app-sai-editor',
  templateUrl: './sai-editor.component.html',
  styleUrls: ['./sai-editor.component.scss']
})
export class SaiEditorComponent {

  constructor(
    public handler: SaiHandlerService,
  ) { }

}
