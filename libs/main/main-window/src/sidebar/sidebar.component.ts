import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ConditionsHandlerService } from '@keira/features/conditions';
import { CreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { GossipHandlerService } from '@keira/features/gossip';
import { ItemHandlerService } from '@keira/features/item';
import { FishingLootHandlerService } from '@keira/features/other-loots';
import { MailLootHandlerService } from '@keira/features/other-loots';
import { ReferenceLootHandlerService } from '@keira/features/other-loots';
import { SpellLootHandlerService } from '@keira/features/other-loots';
import { QuestHandlerService } from '@keira/features/quest';
import { SpellHandlerService } from '@keira/features/spell';
import { SidebarService } from './sidebar.service';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { SwitchLanguageComponent } from '@keira/shared/switch-language';
import { MysqlService } from '@keira/shared/db-layer';
import { LocationService } from '@keira/shared/common-services';

const animationTime = 200;

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
    NgIf,
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
