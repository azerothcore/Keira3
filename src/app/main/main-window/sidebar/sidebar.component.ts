import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { LocationService } from '@keira-shared/services/location.service';
import { MysqlService } from '@keira-shared/services/mysql.service';
import { ConditionsHandlerService } from '../../../features/conditions/conditions-handler.service';
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';
import { GameobjectHandlerService } from '../../../features/gameobject/gameobject-handler.service';
import { GossipHandlerService } from '../../../features/gossip/gossip-handler.service';
import { ItemHandlerService } from '../../../features/item/item-handler.service';
import { FishingLootHandlerService } from '../../../features/other-loots/fishing-loot/fishing-loot-handler.service';
import { MailLootHandlerService } from '../../../features/other-loots/mail-loot/mail-loot-handler.service';
import { ReferenceLootHandlerService } from '../../../features/other-loots/reference-loot/reference-loot-handler.service';
import { SpellLootHandlerService } from '../../../features/other-loots/spell-loot/spell-loot-handler.service';
import { QuestHandlerService } from '../../../features/quest/quest-handler.service';
import { SpellHandlerService } from '../../../features/spell/spell-handler.service';
import { SidebarService } from './sidebar.service';

const animationTime = 200;

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slide', [
      state('up', style({ height: 0 })),
      state('down', style({ height: '*' })),
      transition('up <=> down', animate(animationTime)),
    ]),
  ],
})
export class SidebarComponent {
  menuStates: { [key: string]: 'down' | 'up' } = {
    creature: 'up',
    quest: 'up',
    gameobject: 'up',
    item: 'up',
    otherLoot: 'up',
    smartAi: 'up',
    conditions: 'up',
    gossip: 'up',
    spell: 'up',
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
    public spellHandlerService: SpellHandlerService,
    private locationService: LocationService,
  ) {}

  getSideBarState(): boolean {
    return this.sidebarService.getSidebarState();
  }

  toggleSidebar(): void {
    this.sidebarService.setSidebarState(!this.sidebarService.getSidebarState());

    /* istanbul ignore next */
    setTimeout(() => {
      // fix ngx-datatable(s) size
      window.dispatchEvent(new Event('resize'));
    }, animationTime + 100);
  }

  hasBackgroundImage(): boolean {
    return this.sidebarService.hasBackgroundImage;
  }

  toggleState(key: string): void {
    this.menuStates[key] = this.menuStates[key] === 'up' ? 'down' : 'up';
  }

  collapseAll(): void {
    for (const key of Object.keys(this.menuStates)) {
      this.menuStates[key] = 'up';
    }
  }

  logout(): void {
    this.locationService.reload();
  }
}
