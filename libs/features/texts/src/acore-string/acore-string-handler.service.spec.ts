import { TestBed } from '@angular/core/testing';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { ACORE_STRING_TABLE } from '@keira/shared/acore-world-model';

describe(AcoreStringHandlerService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [AcoreStringHandlerService],
    }),
  );

  const setup = () => {
    const service = TestBed.inject(AcoreStringHandlerService);
    return { service };
  };

  it('isUnsaved should return the value of the statusMap for the broadcast_text table', () => {
    const { service } = setup();
    expect(service.isUnsaved()).toBe(false); // defaults to false

    service.statusMap[ACORE_STRING_TABLE].set(true);
    expect(service.isUnsaved()).toBe(true);

    service.statusMap[ACORE_STRING_TABLE].set(false);
    expect(service.isUnsaved()).toBe(false);
  });
});
