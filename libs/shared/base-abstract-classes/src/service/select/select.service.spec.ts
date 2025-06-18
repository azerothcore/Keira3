import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MockHandlerService, SelectMockService } from '../../core.mock';

describe('SelectService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: MysqlQueryService,
          useValue: instance(mock(MysqlQueryService)),
        },
        SelectMockService,
        MockHandlerService,
      ],
    }),
  );

  it('onSelect() should correctly work', () => {
    const service = TestBed.inject(SelectMockService);
    const spy = spyOn(TestBed.inject(MockHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField'] as string]: 'myName' }];

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(
      false,
      `${selected[0][service['entityIdField']]}`,
      `${selected[0][service['entityNameField'] as string]}`,
    );
    expect(service.handlerService.itemQualityScssClass).toBe('');
  });

  it('onSelect() should correctly extract the Quality field if present', () => {
    const service = TestBed.inject(SelectMockService);
    const spy = spyOn(TestBed.inject(MockHandlerService), 'select');
    const selected = [
      {
        [service['entityIdField']]: 'myId',
        [service['entityNameField'] as string]: 'myName',
        Quality: 5,
      },
    ];

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(
      false,
      `${selected[0][service['entityIdField']]}`,
      `${selected[0][service['entityNameField'] as string]}`,
    );

    expect(service.handlerService.itemQualityScssClass).toBe('item-quality-q5');
  });

  it('onSelect() should use the table name when the entityNameField is not defined', () => {
    const service = TestBed.inject(SelectMockService);
    const spy = spyOn(TestBed.inject(MockHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField'] as string]: 'myName' }];
    service['entityNameField'] = undefined as any;

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(false, `${selected[0][service['entityIdField']]}`, service['entityTable']);
  });
});
