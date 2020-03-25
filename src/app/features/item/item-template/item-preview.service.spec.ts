import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemHandlerService } from '../item-handler.service';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';

fdescribe('ItemPreviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      ItemPreviewService,
      ItemTemplateService,
      ItemHandlerService,
    ]
  }));

  it('calculatePreview()', async() => {
    const service: ItemPreviewService = TestBed.inject(ItemPreviewService);

    expect(await service.calculatePreview()).toEqual('asd');
  });
});
