import { TestBed } from '@angular/core/testing';
import { AcoreTextHandlerService } from './acore-text-handler.service';
import { ACORE_STRING_TABLE } from '@keira/shared/acore-world-model';

describe(AcoreTextHandlerService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [AcoreTextHandlerService],
    }),
  );

  const setup = () => {
    const service = TestBed.inject(AcoreTextHandlerService);
    return { service };
  };

  it('isUnsaved should return the value of the statusMap for the broadcast_text table', () => {
    const { service } = setup();
    expect(service.isUnsaved).toBe(false); // defaults to false

    service.statusMap[ACORE_STRING_TABLE] = true;
    expect(service.isUnsaved).toBe(true);

    service.statusMap[ACORE_STRING_TABLE] = false;
    expect(service.isUnsaved).toBe(false);
  });
});
