import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../components/main-window/home/home.component';

import { SelectCreatureComponent } from '../components/editors/creature/select-creature/select-creature.component';
import { CreateComponent } from '../components/editors/create/create.component';
import { CreatureTemplateComponent } from '../components/editors/creature/creature-template/creature-template.component';
import { CreatureTemplateAddonComponent } from '../components/editors/creature/creature-template-addon/creature-template-addon.component';
import { NpcVendorComponent } from '../components/editors/creature/npc-vendor/npc-vendor.component';

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
      },
      {
        path: 'creature-template-addon',
        component: CreatureTemplateAddonComponent,
      },
      {
        path: 'npc-vendor',
        component: NpcVendorComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
