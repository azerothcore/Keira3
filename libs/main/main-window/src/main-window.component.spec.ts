import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { instance, mock } from 'ts-mockito';
import { ConditionsHandlerService } from '@keira/features/conditions';
import { CreatureHandlerService, SaiCreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService, SaiGameobjectHandlerService } from '@keira/features/gameobject';
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
import { MainWindowComponent } from './main-window.component';
import { ElectronService } from '@keira/shared/common-services';
import { MysqlService } from '@keira/shared/db-layer';

describe('MainWindowComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MainWindowComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
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
