import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { anything, instance, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import Spy = jasmine.Spy;

import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { LootTemplateComponent } from './loot-template.component';
import { CreatureLootTemplate } from '@keira-types/creature-loot-template.type';
import { CreatureLootTemplateComponent } from '../../../../../features/creature/creature-loot-template/creature-loot-template.component';
import { CreatureLootTemplateService } from '../../../../../features/creature/creature-loot-template/creature-loot-template.service';
import { LootEditorService } from '../../../service/editors/loot-editor.service';
import { CreatureLootTemplateModule } from '../../../../../features/creature/creature-loot-template/creature-loot-template.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { MysqlQueryService } from '../../../../services/mysql-query.service';
import { CreatureHandlerService } from '../../../../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../../../features/creature/sai-creature-handler.service';

describe('LootTemplateComponent', () => {
  let component: LootTemplateComponent<CreatureLootTemplate>;
  let fixture: ComponentFixture<CreatureLootTemplateComponent>;
  let editorService: LootEditorService<CreatureLootTemplate>;
  let getLootIdSpy: Spy;
  let reloadSpy: Spy;

  const lootId = 1230;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureLootTemplateModule,
        RouterTestingModule,
        TooltipModule.forRoot(),
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide : MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlQueryService.query(anything(), anything())).thenReturn(of());
    editorService = TestBed.inject(CreatureLootTemplateService);
    reloadSpy = spyOn(editorService, 'reload');
    getLootIdSpy = spyOn(editorService, 'getLootId');
    getLootIdSpy.and.returnValue(of([ { lootId } ]));

    fixture = TestBed.createComponent(CreatureLootTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should correctly initialise', () => {
    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('it should not reload if the lootId is 0', () => {
    getLootIdSpy.calls.reset();
    reloadSpy.calls.reset();
    getLootIdSpy.and.returnValue(of([ { lootId: 0 } ]));

    component.ngOnInit();

    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });

  it('it should not reload if the same entity has already been loaded', () => {
    getLootIdSpy.calls.reset();
    reloadSpy.calls.reset();
    editorService['_loadedEntityId'] = lootId;

    component.ngOnInit();

    expect(getLootIdSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(0);
  });

  it('should properly handle error', () => {
    const errorSpy = spyOn(console, 'error');
    const error = 'some error';
    getLootIdSpy.and.returnValue(throwError(error));

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(error);
  });
});
