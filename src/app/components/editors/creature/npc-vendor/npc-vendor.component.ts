import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { NpcVendorService } from '../../../../services/editors/creature/npc-vendor.service';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { NpcVendor } from '../../../../types/npc-vendor.type';

@Component({
  selector: 'app-npc-vendor',
  templateUrl: './npc-vendor.component.html',
  styleUrls: ['./npc-vendor.component.scss']
})
export class NpcVendorComponent extends MultiRowEditorComponent<NpcVendor> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: NpcVendorService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
