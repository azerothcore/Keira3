import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anything, instance, reset, when } from 'ts-mockito';
import { HighlightModule } from 'ngx-highlightjs';
import { of } from 'rxjs';

import { SelectCreatureComponent } from './select-creature.component';
import { MockedQueryService } from '../../../../test-utils/mocks';
import { QueryService } from '../../../../services/query.service';
import { CommonTestModule } from '../../../../test-utils/common-test.module';
import { CommonEditorTestModule } from '../../../../test-utils/common-editor-test-module';
import { CreateComponent } from '../../shared/create/create.component';
import { highlightOptions } from '../../../../config/highlight.config';
import { CreatureSelectService } from '../../../../services/select/creature-select.service';

describe('SelectCreatureComponent', () => {
  let component: SelectCreatureComponent;
  let fixture: ComponentFixture<SelectCreatureComponent>;
  let selectService: CreatureSelectService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelectCreatureComponent,
        CreateComponent,
      ],
      imports: [
        CommonTestModule,
        CommonEditorTestModule,
        HighlightModule.forRoot(highlightOptions),
      ],
      providers: [
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    when(MockedQueryService.selectAll(anything(), anything(), anything())).thenReturn(of({ results: []}));
    when(MockedQueryService.getMaxId(anything(), anything())).thenReturn(of({ results: [{ max: 123 }]}));

    selectService = TestBed.get(CreatureSelectService);
    selectService.query = '--mock query';

    fixture = TestBed.createComponent(SelectCreatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    reset(MockedQueryService);
    fixture.debugElement.nativeElement.remove();
  });
});
