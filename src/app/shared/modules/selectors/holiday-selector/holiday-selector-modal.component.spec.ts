import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { HolidaySearchService } from '../../search/holiday-search.service';
import { HolidaySelectorModule } from './holiday-selector.module';

describe('HolidaySelectorModalComponent', () => {
  let component: HolidaySelectorModalComponent;
  let fixture: ComponentFixture<HolidaySelectorModalComponent>;
  let searchService: HolidaySearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HolidaySelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(HolidaySearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(HolidaySelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
