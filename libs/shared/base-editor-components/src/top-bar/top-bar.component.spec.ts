import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PageObject } from '@keira/shared/test-utils';
import { TopBarComponent } from './top-bar.component';

describe(TopBarComponent.name, () => {
  @Component({
    template: ` <keira-top-bar [selected]="selected" [selectedName]="selectedName" [isNew]="isNew"></keira-top-bar> `,
    standalone: true,
    imports: [TopBarComponent],
  })
  class TestHostComponent {
    @ViewChild(TopBarComponent) child: TopBarComponent;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopBarComponent, TestHostComponent],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new Page(fixture);
    return { host, page };
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
      const selectedName = 'Shin';
      const { host, page } = setup();

      host.selected = selected;
      host.selectedName = selectedName;
      host.isNew = false;
      page.detectChanges();

      expect(page.mainText().nativeElement.innerText).toContain(`Editing: ${selectedName} (${selected})`);
    });
  });
});
