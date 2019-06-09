import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatureTemplateAddonComponent } from './creature-template-addon.component';

describe('CreatureTemplateAddonComponent', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatureTemplateAddonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatureTemplateAddonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
