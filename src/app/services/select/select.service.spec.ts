import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { CreatureSelectService } from './creature-select.service';
import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { SelectService } from './select.service';
import { CreatureTemplate } from '../../types/creature-template.type';
import { CreatureHandlerService } from '../handlers/creature-handler.service';

describe('SelectService', () => {
  let service: SelectService<CreatureTemplate>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(CreatureSelectService);
  });

  it('onSelect() should correctly work', () => {
    const spy = spyOn(TestBed.get(CreatureHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField']]: 'myName' }];

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(
      false,
      `${selected[0][service['entityIdField']]}`,
      `${selected[0][service['entityNameField']]}`,
    );
  });
});
