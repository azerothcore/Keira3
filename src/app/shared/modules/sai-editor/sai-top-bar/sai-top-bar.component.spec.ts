import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { PageObject } from '@keira-testing/page-object';
import { SAI_TYPES } from '@keira-types/smart-scripts.type';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { SaiTopBarComponent } from './sai-top-bar.component';

describe('SaiTopBarComponent', () => {
  @Component({
    template: `
      <keira-sai-top-bar
        [selected]="selected"
        [selectedName]="selectedName"
        [isNew]="isNew"
      ></keira-sai-top-bar>
    `,
  })
  class TestHostComponent {
    @ViewChild(SaiTopBarComponent, { static: true }) child: SaiTopBarComponent;
    selected: string;
    selectedName: string;
    isNew: boolean;
  }

  class Page extends PageObject<TestHostComponent> {
    mainWrapper() {
      return this.getDebugElementByCss('.top-bar');
    }

    mainText(assert = true) {
      return this.getDebugElementByCss('.top-bar .main-text', assert);
    }
  }

  const entryorguid = 1234;
  const name = 'Francesco';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, SaiTopBarComponent],
      imports: [RouterTestingModule, TranslateTestingModule],
    }).compileComponents();
  }));

  const setup =() => {
    spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of([]));
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.selected = JSON.stringify({ source_type: SAI_TYPES.SAI_TYPE_GAMEOBJECT, entryorguid });
    const page = new Page(fixture);

    return { page, host };
  };

  describe('when there is no selected value', () => {
    it('should only show the main wrapper', () => {
      const { host, page } = setup();

      host.selected = undefined;
      page.detectChanges();

      expect(page.mainWrapper()).toBeTruthy();
      expect(page.mainText(false)).toBeFalsy();
    });
  });

  describe('when there is a selected', () => {
    it('should correctly show a new selection', () => {
      const selected = '1234';
      const { host, page } = setup();

      host.selected = selected;
      host.isNew = true;
      page.detectChanges();

      expect(page.mainText().nativeElement.innerText).toContain(`Creating new: ${selected}`);
    });

    it('should correctly show an existing selection', () => {
      const selected = '1234';
      const { host, page } = setup();

      host.selected = selected;
      host.isNew = false;
      page.detectChanges();

      expect(page.mainText().nativeElement.innerText).toContain(`Editing: (${selected})`);
    });
  });

  for (const { testId, type, positive, expected } of [
    { testId: 1, type: SAI_TYPES.SAI_TYPE_AREATRIGGER, positive: true, expected: `Areatrigger ID ${entryorguid}` },
    {
      testId: 2,
      type: SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST,
      positive: true,
      expected: `Timed Actionlist ID ${entryorguid}`,
    },
    { testId: 3, type: SAI_TYPES.SAI_TYPE_GAMEOBJECT, positive: true, expected: `Gameobject ID ${entryorguid}` },
    { testId: 4, type: SAI_TYPES.SAI_TYPE_GAMEOBJECT, positive: false, expected: `Gameobject GUID ${entryorguid}` },
    { testId: 5, type: SAI_TYPES.SAI_TYPE_CREATURE, positive: true, expected: `Creature ID ${entryorguid}` },
    { testId: 6, type: SAI_TYPES.SAI_TYPE_CREATURE, positive: false, expected: `Creature GUID ${entryorguid}` },
  ]) {
    it(`should correctly handle different types [${testId}]`, () => {
      const { page, host } = setup();
      host.selected = JSON.stringify({ source_type: type, entryorguid: positive ? entryorguid : -entryorguid });
      host.selectedName = name;

      page.detectChanges();

      const actualText = page.mainText().nativeElement.innerText;
      expect(actualText).toContain(expected);
      if ([SAI_TYPES.SAI_TYPE_CREATURE, SAI_TYPES.SAI_TYPE_GAMEOBJECT].includes(type)) {
        expect(actualText).toContain(name);
      }
    });
  }
});
