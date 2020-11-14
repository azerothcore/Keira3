import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { AreaSelectorModalComponent } from './area-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { AreaSearchService } from '../../search/area-search.service';
import { AreaSelectorModule } from './area-selector.module';

describe('AreaSelectorModalComponent', () => {
  let component: AreaSelectorModalComponent;
  let fixture: ComponentFixture<AreaSelectorModalComponent>;
  let searchService: AreaSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AreaSelectorModule ],
      providers: [
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(AreaSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(AreaSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
