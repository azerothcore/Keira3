import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarService } from './sidebar.service';

import { MysqlService } from '../../../shared/services/mysql.service';
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';
import { QuestHandlerService } from '../../../features/quest/quest-handler.service';
import { GameobjectHandlerService } from '../../../features/gameobject/gameobject-handler.service';
import { ItemHandlerService } from '../../../features/item/item-handler.service';
import { GossipHandlerService } from '../../../features/gossip/gossip-handler.service';
import { ConditionsHandlerService } from '../../../features/conditions/conditions-handler.service';
import { SaiHandlerService } from '../../../shared/modules/sai-editor/sai-handler.service';
import { LocationService } from '../../../shared/services/location.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slide', [
      state('up', style({ height: 0 })),
      state('down', style({ height: '*' })),
      transition('up <=> down', animate(200))
    ])
  ]
})
export class SidebarComponent {

  menuStates: { [key: string]: 'down'|'up' } = {
    creature: 'up',
    quest: 'up',
    gameobject: 'up',
    item: 'up',
    smartAi: 'up',
    conditions: 'up',
    gossip: 'up',
  };

  constructor(
    public sidebarService: SidebarService,
    public mysqlService: MysqlService,
    public creatureHandlerService: CreatureHandlerService,
    public questHandlerService: QuestHandlerService,
    public gameobjectHandlerService: GameobjectHandlerService,
    public itemHandlerService: ItemHandlerService,
    public gossipHandlerService: GossipHandlerService,
    public conditionsHandlerService: ConditionsHandlerService,
    public saiHandlerService: SaiHandlerService,
    private locationService: LocationService,
  ) {
   }

  getSideBarState() {
    return this.sidebarService.getSidebarState();
  }

  toggleSidebar() {
    this.sidebarService.setSidebarState(!this.sidebarService.getSidebarState());
  }

  hasBackgroundImage() {
    return this.sidebarService.hasBackgroundImage;
  }

  toggleState(key: string) {
    this.menuStates[key] = this.menuStates[key] === 'up' ? 'down' : 'up';
  }

  collapseAll() {
    for (const key in this.menuStates) {
      /* istanbul ignore else */
      if (this.menuStates.hasOwnProperty(key)) {
        this.menuStates[key] = 'up';
      }
    }
  }

  logout() {
    this.locationService.reload();
  }
}
