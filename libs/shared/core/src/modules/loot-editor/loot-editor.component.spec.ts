import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PageObject, TranslateTestingModule } from '@keira/test-utils';
import { LootTemplate } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { LootEditorComponent } from './loot-editor.component';
import { LootEditorModule } from './loot-editor.module';
import { CreatureLootTemplateService } from '../../../../../../apps/keira/src/app/features/creature/creature-loot-template/creature-loot-template.service';
import { CreatureHandlerService } from '../../../../../../apps/keira/src/app/features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../../../../apps/keira/src/app/features/creature/sai-creature-handler.service';

class LootEditorComponentPage extends PageObject<TestHostComponent> {
  get referenceViewers() {
    return this.queryAll('keira-reference-viewer');
  }
}

@Component({
  template: '<keira-loot-editor [editorService]="editorService"></keira-loot-editor>',
})
class TestHostComponent {
  @ViewChild(LootEditorComponent) child: LootEditorComponent<any>;
  constructor(public editorService: CreatureLootTemplateService) {}
}

describe('LootEditorComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), LootEditorModule, RouterTestingModule, TranslateTestingModule],
      providers: [CreatureLootTemplateService, CreatureHandlerService, SaiCreatureHandlerService],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new LootEditorComponentPage(fixture);
    const editorService = TestBed.inject(CreatureLootTemplateService);

    return { page, fixture, editorService };
  };

  it('should correctly show the references', () => {
    const { page, fixture, editorService } = setup();
    const mockLootRows: LootTemplate[] = [new LootTemplate(), new LootTemplate(), new LootTemplate()];
    mockLootRows[0].Reference = 111;
    mockLootRows[1].Reference = 222;
    spyOnProperty(editorService, 'newRows').and.returnValue(mockLootRows);

    fixture.detectChanges();

    expect(page.referenceViewers.length).toEqual(2);
  });
});
