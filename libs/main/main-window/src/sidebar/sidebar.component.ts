import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TitleCasePipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
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
import {
  BroadcastTextHandlerService,
  NpcTextHandlerService,
  PageTextHandlerService,
  AcoreStringHandlerService,
} from '@keira/features/texts';
import { GameTeleHandlerService } from '@keira/features/game-tele';
import { TrainerHandlerService } from '@keira/features/trainer';
import { LocationService } from '@keira/shared/common-services';
import { MysqlService } from '@keira/shared/db-layer';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { SwitchLanguageComponent } from '@keira/shared/switch-language';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { MenuStats, ROUTE_MENUS } from './sidebar.model';
import { SidebarService } from './sidebar.service';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';

const animationTime = 200;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  imports: [
    SwitchLanguageComponent,
    LogoutBtnComponent,
    RouterLink,
    TranslateDirective,
    TranslatePipe,
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
    gameTele: 'up',
    trainer: 'up',
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
  protected readonly npcTextHandlerService = inject(NpcTextHandlerService);
  protected readonly acoreStringHandlerService = inject(AcoreStringHandlerService);
  protected readonly gameTeleHandlerService = inject(GameTeleHandlerService);
  protected readonly trainerHandlerService = inject(TrainerHandlerService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    this.expandMenuOf(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(({ urlAfterRedirects }) => {
        this.expandMenuOf(urlAfterRedirects);
        this.changeDetectorRef.markForCheck();
      });
  }

  private expandMenuOf(url: string): void {
    const [firstSegment] = url.split('?')[0].split('/').filter(Boolean);
    const menu = ROUTE_MENUS[firstSegment];

    if (menu) {
      this.menuStates[menu] = 'down';
    }
  }

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
    this.menuStates.creature = 'up';
    this.menuStates.quest = 'up';
    this.menuStates.gameobject = 'up';
    this.menuStates.item = 'up';
    this.menuStates.otherLoot = 'up';
    this.menuStates.smartAi = 'up';
    this.menuStates.conditions = 'up';
    this.menuStates.gossip = 'up';
    this.menuStates.spell = 'up';
    this.menuStates.gameTele = 'up';
    this.menuStates.trainer = 'up';
    this.menuStates.gameTele = 'up';
  }

  logout(): void {
    this.locationService.reload();
  }
}
