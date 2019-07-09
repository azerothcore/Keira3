import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import Spy = jasmine.Spy;

import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { MysqlService } from '../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../test-utils/mocks';
import { CommonEditorTestModule } from '../../../../test-utils/common-editor-test-module';
import { LootTemplateComponent } from './loot-template.component';
import { CreatureLootTemplate } from '../../../../types/creature-loot-template.type';
import { CreatureLootTemplateComponent } from '../../creature/creature-loot-template/creature-loot-template.component';
import { CreatureLootTemplateService } from '../../../../services/editors/creature/creature-loot-template.service';
import { LootEditorService } from '../../../../services/editors/loot-editor.service';

describe('LootTemplateComponent', () => {
  let component: LootTemplateComponent<CreatureLootTemplate>;
  let fixture: ComponentFixture<CreatureLootTemplateComponent>;
  let editorService: LootEditorService<CreatureLootTemplate>;
  let getLootIdSpy: Spy;
  let reloadSpy: Spy;

  const lootId = 1230;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreatureLootTemplateComponent,
      ],
      imports: [
        CommonTestModule,
        CommonEditorTestModule,
      ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedMysqlService.query(anything(), anything())).thenReturn(of());
    editorService = TestBed.get(CreatureLootTemplateService);
    reloadSpy = spyOn(editorService, 'reload');
    getLootIdSpy = spyOn(editorService, 'getLootId');
    getLootIdSpy.and.returnValue(of({ results: [ { lootId } ]}));

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
    getLootIdSpy.and.returnValue(of({ results: [ { lootId: 0 } ]}));

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
