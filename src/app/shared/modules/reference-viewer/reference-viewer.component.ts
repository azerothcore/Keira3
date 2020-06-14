import { Component, Input } from '@angular/core';
import { ReferenceViewerService } from '@keira-shared/modules/reference-viewer/reference-viewer.service';

@Component({
  selector: 'keira-reference-viewer',
  templateUrl: './reference-viewer.component.html',
  styleUrls: ['./reference-viewer.component.scss'],
})
export class ReferenceViewerComponent {

  @Input() referenceId: number;

  constructor(public service: ReferenceViewerService) { }
}
