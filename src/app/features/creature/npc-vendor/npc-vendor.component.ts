import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { NpcVendor } from '@keira-types/npc-vendor.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcVendorService } from './npc-vendor.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-npc-vendor',
  templateUrl: './npc-vendor.component.html',
  styleUrls: ['./npc-vendor.component.scss'],
})
export class NpcVendorComponent extends MultiRowEditorComponent<NpcVendor> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: NpcVendorService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
