import { async, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { of } from 'rxjs';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { PageObject } from '@keira-testing/page-object';
import { ReferenceViewerService } from '@keira-shared/modules/loot-editor/reference-viewer.service';
import { LootTemplate } from '@keira-types/loot-template.type';

class ReferenceViewerComponentPage extends PageObject<TestHostComponent> {
  get referenceViewers() { return this.queryAll('keira-reference-viewer'); }
}

@Component({
  template: '<keira-reference-viewer [referenceId]="referenceId"></keira-reference-viewer>'
})
class TestHostComponent {
  @ViewChild(ReferenceViewerComponent) child: ReferenceViewerComponent;
  referenceId: number;
}

describe('ReferenceViewerComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, ReferenceViewerComponent],
      imports: [LootEditorModule],
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new ReferenceViewerComponentPage(fixture);
    const host = fixture.componentInstance;
    const service = TestBed.inject(ReferenceViewerService);

    return { page, fixture, host, service };
  };

  it('should correctly show the nested references', () => {
    const { page, host, fixture, service } = setup();
    const id = 1234;
    host.referenceId = id;
    const mockLootRows: LootTemplate[] = [ new LootTemplate(), new LootTemplate(), new LootTemplate() ];
    mockLootRows[0].Reference = 111;
    mockLootRows[1].Reference = 222;
    const getReferenceByIdSpy = spyOn(service, 'getReferenceById').and.returnValues(of(mockLootRows), of([]));

    fixture.detectChanges();

    expect(getReferenceByIdSpy).toHaveBeenCalledWith(id);
    expect(getReferenceByIdSpy).toHaveBeenCalledTimes(3); // because of recursion 1 with mockLootRows, 1 with [], 1 undefined
    expect(page.referenceViewers.length).toEqual(3);
  });
});
