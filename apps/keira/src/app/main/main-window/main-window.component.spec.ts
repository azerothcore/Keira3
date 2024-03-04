import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedElectronService, MockedMysqlService, TranslateTestingModule } from '@keira/shared/test-utils';
import { instance } from 'ts-mockito';
import { ConditionsHandlerService } from '../../features/conditions/conditions-handler.service';
import { CreatureHandlerService } from '../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../features/creature/sai-creature-handler.service';
import { GameobjectHandlerService } from '../../features/gameobject/gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../../features/gameobject/sai-gameobject-handler.service';
import { GossipHandlerService } from '../../features/gossip/gossip-handler.service';
import { ItemHandlerService } from '../../features/item/item-handler.service';
import { FishingLootHandlerService } from '../../features/other-loots/fishing-loot/fishing-loot-handler.service';
import { MailLootHandlerService } from '../../features/other-loots/mail-loot/mail-loot-handler.service';
import { ReferenceLootHandlerService } from '../../features/other-loots/reference-loot/reference-loot-handler.service';
import { SpellLootHandlerService } from '../../features/other-loots/spell-loot/spell-loot-handler.service';
import { QuestHandlerService } from '../../features/quest/quest-handler.service';
import { SpellHandlerService } from '../../features/spell/spell-handler.service';
import { MainWindowComponent } from './main-window.component';
import { MainWindowModule } from './main-window.module';
import { ElectronService, MysqlService } from '@keira/shared/core';

describe('MainWindowComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MainWindowModule, RouterTestingModule, TranslateTestingModule],
      providers: [
        { provide: ElectronService, useValue: instance(MockedElectronService) },
        { provide: MysqlService, useValue: instance(MockedMysqlService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        QuestHandlerService,
        ItemHandlerService,
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GossipHandlerService,
        ConditionsHandlerService,
        ReferenceLootHandlerService,
        SpellLootHandlerService,
        FishingLootHandlerService,
        MailLootHandlerService,
        SpellHandlerService,
      ],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(MainWindowComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  };

  it('should create', () => {
    const { fixture, component } = setup();
    expect(component).toBeTruthy();
    fixture.debugElement.nativeElement.remove();
  });
});
