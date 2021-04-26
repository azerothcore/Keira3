import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { SpellDbcEffectsComponent } from './spell-dbc-effects.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';

describe('SpellDbcEffectsComponent', () => {

  class SpellDbcEffectsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-effects [formGroup]="editorService.form"></keira-spell-dbc-effects>'
  })
  class TestHostComponent {
    @ViewChild(SpellDbcEffectsComponent) child: SpellDbcEffectsComponent;
    constructor(public editorService: SpellDbcService) {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHostComponent, SpellDbcEffectsComponent ],
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
    const page = new SpellDbcEffectsComponentPage(fixture);

    fixture.detectChanges();
    const component = host.child;

    return { fixture, component, page };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
