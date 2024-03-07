import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { PageObject } from '@keira/shared/test-utils';
import { LootTemplate } from '@keira/shared/acore-world-model';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { of } from 'rxjs';
import { ReferenceViewerComponent } from './reference-viewer.component';
import { LootEditorModule } from './loot-editor.module';
import { ReferenceViewerService } from './reference-viewer.service';
import { MockedSqliteService } from '../../services/services.mock';
import { SqliteService } from '../../services/sqlite.service';
import { instance } from 'ts-mockito';

class ReferenceViewerComponentPage extends PageObject<TestHostComponent> {
  get referenceViewers() {
    return this.queryAll('keira-reference-viewer');
  }
}

@Component({
  template: '<keira-reference-viewer [referenceId]="referenceId"></keira-reference-viewer>',
  standalone: true,
  imports: [ReferenceViewerComponent],
})
class TestHostComponent {
  @ViewChild(ReferenceViewerComponent) child: ReferenceViewerComponent;
  referenceId: number;
}

describe('ReferenceViewerComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot(), LootEditorModule, TestHostComponent, ReferenceViewerComponent],
      providers: [{ provide: SqliteService, useValue: instance(MockedSqliteService) }],
    }).compileComponents();
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
    const mockLootRows: LootTemplate[] = [new LootTemplate(), new LootTemplate(), new LootTemplate()];
    mockLootRows[0].Reference = 111;
    mockLootRows[1].Reference = 222;
    const getReferenceByIdSpy = spyOn(service, 'getReferenceById').and.returnValues(of(mockLootRows), of([]));

    fixture.detectChanges();

    expect(getReferenceByIdSpy).toHaveBeenCalledWith(id);
    expect(getReferenceByIdSpy).toHaveBeenCalledTimes(3); // because of recursion 1 with mockLootRows, 1 with [], 1 undefined
    expect(page.referenceViewers.length).toEqual(3);
  });
});
