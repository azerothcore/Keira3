import { TestBed } from '@angular/core/testing';
import { PageTextHandlerService } from './page-text-handler.service';
import { PAGE_TEXT_TABLE } from '@keira/shared/acore-world-model';

describe(PageTextHandlerService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [PageTextHandlerService],
    }),
  );

  const setup = () => {
    const service = TestBed.inject(PageTextHandlerService);
    return { service };
  };

  it('isUnsaved should return the value of the statusMap for the page_text table', () => {
    const { service } = setup();
    expect(service.isUnsaved).toBe(false); // defaults to false

    service.statusMap[PAGE_TEXT_TABLE] = true;
    expect(service.isUnsaved).toBe(true);

    service.statusMap[PAGE_TEXT_TABLE] = false;
    expect(service.isUnsaved).toBe(false);
  });
});
