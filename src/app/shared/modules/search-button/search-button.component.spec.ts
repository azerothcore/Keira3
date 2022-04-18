import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { PageObject } from '@keira-testing/page-object';
import { SearchButtonComponent } from './search-button.component';

@Component({
  template: `<keira-search-button [searchService]="searchService"></keira-search-button>`,
})
class TestHostComponent {
  @ViewChild(SearchButtonComponent) child: SearchButtonComponent<null>;
  searchService;
}

class EditorButtonsPage extends PageObject<TestHostComponent> {
  get searchBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#search-btn');
  }
}

describe('EditorButtonsComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SearchButtonComponent, TestHostComponent],
      }).compileComponents();
    }),
  );

  const setup = () => {
    const searchService = {
      queryForm: { invalid: false },
      onSearch: jasmine.createSpy('onSearch'),
    };
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new EditorButtonsPage(fixture);
    const host = fixture.componentInstance;
    host.searchService = searchService;
    fixture.detectChanges();
    const component = host.child;
    return { fixture, host, component, searchService, page };
  };

  it('should be enabled only when the queryForm is valid', () => {
    const { searchService, page, fixture } = setup();
    searchService.queryForm.invalid = false;
    fixture.detectChanges();
    expect(page.searchBtn.disabled).toBe(false);

    searchService.queryForm.invalid = true;
    fixture.detectChanges();
    expect(page.searchBtn.disabled).toBe(true);

    searchService.queryForm.invalid = false;
    fixture.detectChanges();
    expect(page.searchBtn.disabled).toBe(false);
  });

  it('when clicked, should call searchService.onSearch()', () => {
    const { searchService, page } = setup();
    page.clickElement(page.searchBtn);
    expect(searchService.onSearch).toHaveBeenCalledTimes(1);
  });
});
