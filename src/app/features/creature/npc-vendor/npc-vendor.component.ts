import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { NpcVendorService } from './npc-vendor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcVendor } from '@keira-types/npc-vendor.type';

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
