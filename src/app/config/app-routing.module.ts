import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../components/main-window/home/home.component';

import { SelectCreatureComponent } from '../components/editors/creature/select-creature/select-creature.component';
import { CreatureTemplateComponent } from '../components/editors/creature/creature-template/creature-template.component';
import { CreatureTemplateAddonComponent } from '../components/editors/creature/creature-template-addon/creature-template-addon.component';
import { NpcVendorComponent } from '../components/editors/creature/npc-vendor/npc-vendor.component';
import { CreatureEquipTemplateComponent } from '../components/editors/creature/creature-equip-template/creature-equip-template.component';
import {
  CreatureOnkillReputationComponent
} from '../components/editors/creature/creature-onkill-reputation/creature-onkill-reputation.component';
import { CreatureHandlerService } from '../services/handlers/creature-handler.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'creature',
    children: [
      {
        path: 'select',
        component: SelectCreatureComponent,
      },
      {
        path: 'creature-template',
        component: CreatureTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-addon',
        component: CreatureTemplateAddonComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-onkill-reputation',
        component: CreatureOnkillReputationComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-equip-template',
        component: CreatureEquipTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'npc-vendor',
        component: NpcVendorComponent,
        canActivate: [CreatureHandlerService],
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
