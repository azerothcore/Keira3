import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { PickpocketingLootTemplateModule } from './pickpocketing-loot-template.module';

describe('PickpocketingLootTemplateComponent', () => {
  let component: PickpocketingLootTemplateComponent;
  let fixture: ComponentFixture<PickpocketingLootTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        PickpocketingLootTemplateModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    fixture = TestBed.createComponent(PickpocketingLootTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
