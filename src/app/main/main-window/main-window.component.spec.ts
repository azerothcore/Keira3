import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, reset } from 'ts-mockito';

import { MainWindowComponent } from './main-window.component';
import { ElectronService } from '../../shared/services/electron.service';
import { MockedElectronService, MockedMysqlService } from '@keira-testing/mocks';
import { MysqlService } from '../../shared/services/mysql.service';
import { MainWindowModule } from './main-window.module';
import { CreatureHandlerService } from '../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../features/creature/sai-creature-handler.service';
import { QuestHandlerService } from '../../features/quest/quest-handler.service';
import { ItemHandlerService } from '../../features/item/item-handler.service';
import { GameobjectHandlerService } from '../../features/gameobject/gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../../features/gameobject/sai-gameobject-handler.service';
import { GossipHandlerService } from '../../features/gossip/gossip-handler.service';
import { ConditionsHandlerService } from '../../features/conditions/conditions-handler.service';
import { ReferenceLootHandlerService } from '../../features/other-loots/reference-loot/reference-loot-handler.service';

describe('MainWindowComponent', () => {
  let component: MainWindowComponent;
  let fixture: ComponentFixture<MainWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MainWindowModule,
        RouterTestingModule,
      ],
      providers: [
        { provide : ElectronService, useValue: instance(MockedElectronService) },
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        QuestHandlerService,
        ItemHandlerService,
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GossipHandlerService,
        ConditionsHandlerService,
        ReferenceLootHandlerService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
