import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiTopBarComponent } from './sai-top-bar.component';
import { SaiHandlerService } from '../../../../../services/handlers/sai-handler.service';

describe('SaiTopBarComponent', () => {
  let component: SaiTopBarComponent;
  let fixture: ComponentFixture<SaiTopBarComponent>;
  let handler: SaiHandlerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaiTopBarComponent ],
      imports: [
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const selected = { source_type: 1, entryorguid: 100 };
    handler = TestBed.get(SaiHandlerService);
    handler['_selected'] = JSON.stringify(selected);

    fixture = TestBed.createComponent(SaiTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
