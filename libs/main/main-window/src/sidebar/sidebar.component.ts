import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ConditionsHandlerService } from '@keira/features/conditions';
import { CreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { GossipHandlerService } from '@keira/features/gossip';
import { ItemHandlerService } from '@keira/features/item';
import {
  FishingLootHandlerService,
  MailLootHandlerService,
  ReferenceLootHandlerService,
  SpellLootHandlerService,
} from '@keira/features/other-loots';
import { QuestHandlerService } from '@keira/features/quest';
import { SpellHandlerService } from '@keira/features/spell';
import { SidebarService } from './sidebar.service';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { NgClass, TitleCasePipe } from '@angular/common';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { SwitchLanguageComponent } from '@keira/shared/switch-language';
import { MysqlService } from '@keira/shared/db-layer';
import { LocationService } from '@keira/shared/common-services';
import { BroadcastTextHandlerService, PageTextHandlerService } from '@keira/features/texts';

const animationTime = 200;

type ToggleType = 'up' | 'down';
interface MenuStats {
  creature: ToggleType;
  quest: ToggleType;
  gameobject: ToggleType;
  item: ToggleType;
  otherLoot: ToggleType;
  smartAi: ToggleType;
  conditions: ToggleType;
  texts: ToggleType;
  gossip: ToggleType;
  spell: ToggleType;
}

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  // TODO: make the unsaved icons feature work with OnPush
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
  standalone: true,
  imports: [
    NgClass,
    SwitchLanguageComponent,
    LogoutBtnComponent,
    RouterLink,
    TranslateModule,
    RouterLinkActive,
    UnsavedIconComponent,
    TitleCasePipe,
  ],
})
export class SidebarComponent {
  menuStates: MenuStats = {
    creature: 'up',
    quest: 'up',
    gameobject: 'up',
    item: 'up',
    otherLoot: 'up',
    smartAi: 'up',
    conditions: 'up',
    texts: 'up',
    gossip: 'up',
    spell: 'up',
  };
  private readonly IMAGES_COUNT = 7;
  private readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  readonly style = `background-image: url(assets/img/sidebar-backgrounds/bg${this.RANDOM_IMAGE}.jpg);`;

  protected readonly sidebarService = inject(SidebarService);
  protected readonly mysqlService = inject(MysqlService);
  protected readonly creatureHandlerService = inject(CreatureHandlerService);
  protected readonly questHandlerService = inject(QuestHandlerService);
  protected readonly gameobjectHandlerService = inject(GameobjectHandlerService);
  protected readonly itemHandlerService = inject(ItemHandlerService);
  protected readonly gossipHandlerService = inject(GossipHandlerService);
  protected readonly conditionsHandlerService = inject(ConditionsHandlerService);
  protected readonly saiHandlerService = inject(SaiHandlerService);
  protected readonly referenceLootHandlerService = inject(ReferenceLootHandlerService);
  protected readonly spellLootHandlerService = inject(SpellLootHandlerService);
  protected readonly fishingLootHandlerService = inject(FishingLootHandlerService);
  protected readonly mailLootHandlerService = inject(MailLootHandlerService);
  protected readonly spellHandlerService = inject(SpellHandlerService);
  protected readonly pageTextHandlerService = inject(PageTextHandlerService);
  protected readonly broadcastTextHandlerService = inject(BroadcastTextHandlerService);
  private readonly locationService = inject(LocationService);

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

  toggleState(key: keyof MenuStats): void {
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
