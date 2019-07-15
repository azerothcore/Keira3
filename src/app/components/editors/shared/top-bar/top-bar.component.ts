import { Component, Input } from '@angular/core';

import { HandlerService } from '../../../../services/handlers/handler.service';
import { TableRow } from '../../../../types/general';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent<T extends TableRow> {

  @Input() handler: HandlerService<T>;
}
