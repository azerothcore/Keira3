import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarService } from './sidebar.service';

import { MysqlService } from '@keira-shared/services/mysql.service';
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';
import { QuestHandlerService } from '../../../features/quest/quest-handler.service';
import { GameobjectHandlerService } from '../../../features/gameobject/gameobject-handler.service';
import { ItemHandlerService } from '../../../features/item/item-handler.service';
import { GossipHandlerService } from '../../../features/gossip/gossip-handler.service';
import { ConditionsHandlerService } from '../../../features/conditions/conditions-handler.service';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { LocationService } from '@keira-shared/services/location.service';
import { ReferenceLootHandlerService } from '../../../features/other-loots/reference-loot/reference-loot-handler.service';
import { SpellLootHandlerService } from '../../../features/other-loots/spell-loot/spell-loot-handler.service';
import { FishingLootHandlerService } from '../../../features/other-loots/fishing-loot/fishing-loot-handler.service';
import { MailLootHandlerService } from '../../../features/other-loots/mail-loot/mail-loot-handler.service';

const animationTime = 200;

@Component({
  selector: 'keira-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slide', [
      state('up', style({ height: 0 })),
      state('down', style({ height: '*' })),
      transition('up <=> down', animate(animationTime))
    ])
  ]
})
export class SidebarComponent {

  menuStates: { [key: string]: 'down'|'up' } = {
    creature: 'up',
    quest: 'up',
    gameobject: 'up',
    item: 'up',
    otherLoot: 'up',
    smartAi: 'up',
    conditions: 'up',
    gossip: 'up',
  };
  private readonly IMAGES_COUNT = 7;
  private readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  readonly style = `background-image: url(assets/img/sidebar-backgrounds/bg${this.RANDOM_IMAGE}.jpg);`;

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
    public referenceLootHandlerService: ReferenceLootHandlerService,
    public spellLootHandlerService: SpellLootHandlerService,
    public fishingLootHandlerService: FishingLootHandlerService,
    public mailLootHandlerService: MailLootHandlerService,
    private locationService: LocationService,
  ) { }

  getSideBarState() {
    return this.sidebarService.getSidebarState();
  }

  toggleSidebar() {
    this.sidebarService.setSidebarState(!this.sidebarService.getSidebarState());

    /* istanbul ignore next */
    setTimeout(() => {
      // fix ngx-datatable(s) size
      window.dispatchEvent(new Event('resize'));
    }, animationTime + 100);
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
