import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { instance, mock } from 'ts-mockito';
import { ConditionsHandlerService } from '@keira/features/conditions';
import { CreatureHandlerService } from '@keira/features/creature';
import { SaiCreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { SaiGameobjectHandlerService } from '@keira/features/gameobject';
import { GossipHandlerService } from '@keira/features/gossip';
import { ItemHandlerService } from '@keira/features/item';
import { FishingLootHandlerService } from '@keira/features/other-loots';
import { MailLootHandlerService } from '@keira/features/other-loots';
import { ReferenceLootHandlerService } from '@keira/features/other-loots';
import { SpellLootHandlerService } from '@keira/features/other-loots';
import { QuestHandlerService } from '@keira/features/quest';
import { SpellHandlerService } from '@keira/features/spell';
import { MainWindowComponent } from './main-window.component';
import { ElectronService, MysqlService } from '@keira/shared/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MainWindowComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MainWindowComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
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
