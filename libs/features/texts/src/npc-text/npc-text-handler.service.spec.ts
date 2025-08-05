import { TestBed } from '@angular/core/testing';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { NPC_TEXT_TABLE } from '@keira/shared/acore-world-model';

describe(NpcTextHandlerService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [NpcTextHandlerService],
    }),
  );

  const setup = () => {
    const service = TestBed.inject(NpcTextHandlerService);
    return { service };
  };

  it('isUnsaved should return the value of the statusMap for the npc_text table', () => {
    const { service } = setup();
    expect(service.isUnsaved()).toBe(false); // defaults to false

    service.statusMap[NPC_TEXT_TABLE].set(true);
    expect(service.isUnsaved()).toBe(true);

    service.statusMap[NPC_TEXT_TABLE].set(false);
    expect(service.isUnsaved()).toBe(false);
  });
});
