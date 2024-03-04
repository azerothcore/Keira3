import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { NpcVendor } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcVendorService } from './npc-vendor.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-vendor',
  templateUrl: './npc-vendor.component.html',
  styleUrls: ['./npc-vendor.component.scss'],
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
