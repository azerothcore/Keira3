import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { LootTemplate } from '@keira/shared/acore-world-model';
import { PageObject } from '@keira/shared/test-utils';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { of } from 'rxjs';
import { ReferenceViewerComponent } from './reference-viewer.component';
import { ReferenceViewerService } from './reference-viewer.service';

import { SqliteService } from '@keira/shared/db-layer';
import { instance, mock } from 'ts-mockito';

class ReferenceViewerComponentPage extends PageObject<TestHostComponent> {
  get referenceViewers() {
    return this.queryAll('keira-reference-viewer');
  }
}

@Component({
  template: '<keira-reference-viewer [referenceId]="referenceId" />',
  imports: [ReferenceViewerComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(ReferenceViewerComponent);
  referenceId!: number;
}

describe('ReferenceViewerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot(), TestHostComponent, ReferenceViewerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

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

  describe('Chance calculation logic', () => {
    it('should not modify Chance when GroupId is 0', () => {
      const { host, fixture, service } = setup();
      const id = 1234;
      host.referenceId = id;
      const mockLootRows: LootTemplate[] = [new LootTemplate(), new LootTemplate()];
      mockLootRows[0].Chance = 50;
      mockLootRows[0].GroupId = 0;
      mockLootRows[1].Chance = 75;
      mockLootRows[1].GroupId = 0;
      spyOn(service, 'getReferenceById').and.returnValue(of(mockLootRows));

      fixture.detectChanges();

      const component = host.child();
      expect(component['referenceLootRows']![0].Chance).toBe(50);
      expect(component['referenceLootRows']![1].Chance).toBe(75);
    });

    it('should calculate Chance as 100/groupCount when Chance is 0 and GroupId is not 0', () => {
      const { host, fixture, service } = setup();
      const id = 1234;
      host.referenceId = id;
      const mockLootRows: LootTemplate[] = [new LootTemplate(), new LootTemplate(), new LootTemplate()];
      mockLootRows[0].Chance = 0;
      mockLootRows[0].GroupId = 1;
      mockLootRows[1].Chance = 0;
      mockLootRows[1].GroupId = 1;
      mockLootRows[2].Chance = 0;
      mockLootRows[2].GroupId = 1;
      spyOn(service, 'getReferenceById').and.returnValue(of(mockLootRows));

      fixture.detectChanges();

      const component = host.child();
      // 100 / 3 = 33.33
      expect(component['referenceLootRows']![0].Chance).toBe('33.33' as unknown as number);
      expect(component['referenceLootRows']![1].Chance).toBe('33.33' as unknown as number);
      expect(component['referenceLootRows']![2].Chance).toBe('33.33' as unknown as number);
    });

    it('should calculate Chance as Chance/groupCount when Chance is not 0 and GroupId is not 0', () => {
      const { host, fixture, service } = setup();
      const id = 1234;
      host.referenceId = id;
      const mockLootRows: LootTemplate[] = [new LootTemplate(), new LootTemplate()];
      mockLootRows[0].Chance = 80;
      mockLootRows[0].GroupId = 2;
      mockLootRows[1].Chance = 60;
      mockLootRows[1].GroupId = 2;
      spyOn(service, 'getReferenceById').and.returnValue(of(mockLootRows));

      fixture.detectChanges();

      const component = host.child();
      // 80 / 2 = 40.00
      expect(component['referenceLootRows']![0].Chance).toBe('40.00' as unknown as number);
      // 60 / 2 = 30.00
      expect(component['referenceLootRows']![1].Chance).toBe('30.00' as unknown as number);
    });

    it('should handle multiple different groups correctly', () => {
      const { host, fixture, service } = setup();
      const id = 1234;
      host.referenceId = id;
      const mockLootRows: LootTemplate[] = [
        new LootTemplate(),
        new LootTemplate(),
        new LootTemplate(),
        new LootTemplate(),
        new LootTemplate(),
      ];
      // Group 1: 2 items
      mockLootRows[0].Chance = 90;
      mockLootRows[0].GroupId = 1;
      mockLootRows[1].Chance = 0;
      mockLootRows[1].GroupId = 1;
      // Group 2: 3 items
      mockLootRows[2].Chance = 75;
      mockLootRows[2].GroupId = 2;
      mockLootRows[3].Chance = 0;
      mockLootRows[3].GroupId = 2;
      mockLootRows[4].Chance = 60;
      mockLootRows[4].GroupId = 2;
      spyOn(service, 'getReferenceById').and.returnValue(of(mockLootRows));

      fixture.detectChanges();

      const component = host.child();
      // Group 1
      expect(component['referenceLootRows']![0].Chance).toBe('45.00' as unknown as number); // 90 / 2
      expect(component['referenceLootRows']![1].Chance).toBe('50.00' as unknown as number); // 100 / 2
      // Group 2
      expect(component['referenceLootRows']![2].Chance).toBe('25.00' as unknown as number); // 75 / 3
      expect(component['referenceLootRows']![3].Chance).toBe('33.33' as unknown as number); // 100 / 3
      expect(component['referenceLootRows']![4].Chance).toBe('20.00' as unknown as number); // 60 / 3
    });

    it('should handle mixed GroupId 0 and non-zero groups', () => {
      const { host, fixture, service } = setup();
      const id = 1234;
      host.referenceId = id;
      const mockLootRows: LootTemplate[] = [new LootTemplate(), new LootTemplate(), new LootTemplate()];
      mockLootRows[0].Chance = 100;
      mockLootRows[0].GroupId = 0;
      mockLootRows[1].Chance = 80;
      mockLootRows[1].GroupId = 1;
      mockLootRows[2].Chance = 0;
      mockLootRows[2].GroupId = 1;
      spyOn(service, 'getReferenceById').and.returnValue(of(mockLootRows));

      fixture.detectChanges();

      const component = host.child();
      expect(component['referenceLootRows']![0].Chance).toBe(100); // GroupId 0, unchanged
      expect(component['referenceLootRows']![1].Chance).toBe('40.00' as unknown as number); // 80 / 2
      expect(component['referenceLootRows']![2].Chance).toBe('50.00' as unknown as number); // 100 / 2
    });
  });
});
