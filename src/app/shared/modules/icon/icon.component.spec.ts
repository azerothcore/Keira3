import { async,  TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';
import { Component, ViewChild } from '@angular/core';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { PageObject } from '@keira-testing/page-object';
import { IconService } from '@keira-shared/modules/icon/icon.service';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

@Component({
  template: `<keira-icon
    [size]="size"
    [itemId]="itemId"
    [itemDisplayId]="itemDisplayId"
  ></keira-icon>`
})
class TestHostComponent {
  @ViewChild(IconComponent) child: IconComponent;
  size: string;
  itemId: string;
  itemDisplayId: string;
}

class IconComponentPage extends PageObject<TestHostComponent> {
  get img() { return this.query<HTMLImageElement>('img'); }
}

describe('ItemIconComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, TestHostComponent],
      imports: [IconModule]
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child;
    const page = new IconComponentPage(fixture);
    const service = TestBed.inject(IconService);

    spyOn(service, 'getIconByItemId').and.callFake(id => of(`getIconByItemId-${id}`));
    spyOn(service, 'getIconByItemDisplayId').and.callFake(id => of(`getIconByItemDisplayId-${id}`));

    fixture.detectChanges();

    return { fixture, host, component, page, service };
  };

  describe('the image url should correctly reflect the inputs', () => {
    it('itemId', () => {
      const { page, host } = setup();
      host.size = 'medium';
      host.itemId = '1234';

      page.detectChanges();

      expect(page.img.src).toEqual('https://wow.zamimg.com/images/wow/icons/medium/getIconByItemId-1234.jpg');
    });

    it('itemDisplayId', () => {
      const { page, host } = setup();
      host.size = 'large';
      host.itemDisplayId = '5678';

      page.detectChanges();

      expect(page.img.src).toEqual('https://wow.zamimg.com/images/wow/icons/large/getIconByItemDisplayId-5678.jpg');
    });

    it('empty', () => {
      const { page, host, service } = setup();
      host.size = 'medium';
      host.itemId = 'whatever';
      (service.getIconByItemId as Spy).and.returnValue(of(null));

      page.detectChanges();

      expect(page.img.src).toEqual('https://wow.zamimg.com/images/wow/icons/medium/inv_misc_questionmark.jpg');
    });
  });
});
