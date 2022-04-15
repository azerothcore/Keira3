import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { PageObject } from '@keira-testing/page-object';
import { LootTemplate } from '@keira-types/loot-template.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';
import { CreatureLootTemplateService } from '../../../features/creature/creature-loot-template/creature-loot-template.service';
import { SaiCreatureHandlerService } from '../../../features/creature/sai-creature-handler.service';
import { LootEditorComponent } from './loot-editor.component';

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
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHostComponent],
        imports: [ToastrModule.forRoot(), ModalModule.forRoot(), LootEditorModule, RouterTestingModule],
        providers: [CreatureLootTemplateService, CreatureHandlerService, SaiCreatureHandlerService],
      }).compileComponents();
    }),
  );

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
