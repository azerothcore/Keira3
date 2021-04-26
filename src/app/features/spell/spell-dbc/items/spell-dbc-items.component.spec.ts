import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { SpellDbcItemsComponent } from './spell-dbc-items.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';

describe('SpellDbcItemsComponent', () => {

  class SpellDbcItemsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-items [formGroup]="editorService.form"></keira-spell-dbc-items>'
  })
  class TestHostComponent {
    @ViewChild(SpellDbcItemsComponent) child: SpellDbcItemsComponent;
    constructor(public editorService: SpellDbcService) {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHostComponent, SpellDbcItemsComponent ],
      imports: [
        SpellDbcModule,
        RouterTestingModule,
      ],
      providers: [ SpellHandlerService ],
    })
      .compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcItemsComponentPage(fixture);

    fixture.detectChanges();
    const component = host.child;

    return { fixture, component, page };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
