import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { ALLOWABLE_CLASSES } from '@keira-constants/flags/allowable-classes';
import { ALLOWABLE_RACES } from '@keira-constants/flags/allowable-races';
import { BAG_FAMILY } from '@keira-constants/flags/bag-family';
import { ITEM_FLAGS } from '@keira-constants/flags/item-flags';
import { ITEM_FLAGS_CUSTOM } from '@keira-constants/flags/item-flags-custom';
import { ITEM_FLAGS_EXTRA } from '@keira-constants/flags/item-flags-extra';
import { SOCKET_COLOR } from '@keira-constants/flags/socket-color';
import { DAMAGE_TYPE } from '@keira-constants/options/damage-type';
import { FACTION_RANK } from '@keira-constants/options/faction-rank';
import { FOOD_TYPE } from '@keira-constants/options/foot-type';
import { INVENTORY_TYPE } from '@keira-constants/options/inventory-type';
import { ITEM_BONDING } from '@keira-constants/options/item-bonding';
import { ITEM_CLASS, ITEM_SUBCLASS } from '@keira-constants/options/item-class';
import { ITEM_MATERIAL } from '@keira-constants/options/item-material';
import { ITEM_QUALITY } from '@keira-constants/options/item-quality';
import { ITEM_SHEAT } from '@keira-constants/options/item-sheath';
import { STAT_TYPE } from '@keira-constants/options/stat-type';
import { TOTEM_CATEGORY } from '@keira-constants/options/totem-category';
import { PVP_RANK } from '@keira-shared/constants/options/item-honorrank';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import * as jquery from 'jquery';
import { BehaviorSubject, combineLatestWith, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { ItemHandlerService } from '../item-handler.service';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';
import { generateModels, getShadowlandDisplayId, resetModel3dElement } from './model-viewer-3D/helper';

@Component({
  selector: 'keira-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss'],
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> implements OnInit {
  public readonly ITEM_CLASS = ITEM_CLASS;
  public readonly ITEM_SUBCLASS = ITEM_SUBCLASS;
  public readonly ITEM_QUALITY = ITEM_QUALITY;
  public readonly ITEM_FLAGS = ITEM_FLAGS;
  public readonly ITEM_FLAGS_EXTRA = ITEM_FLAGS_EXTRA;
  public readonly INVENTORY_TYPE = INVENTORY_TYPE;
  public readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  public readonly ALLOWABLE_RACES = ALLOWABLE_RACES;
  public readonly FACTION_RANK = FACTION_RANK;
  public readonly BAG_FAMILY = BAG_FAMILY;
  public readonly SOCKET_COLOR = SOCKET_COLOR;
  public readonly ITEM_BONDING = ITEM_BONDING;
  public readonly ITEM_MATERIAL = ITEM_MATERIAL;
  public readonly ITEM_SHEAT = ITEM_SHEAT;
  public readonly TOTEM_CATEGORY = TOTEM_CATEGORY;
  public readonly FOOD_TYPE = FOOD_TYPE;
  public readonly ITEM_FLAGS_CUSTOM = ITEM_FLAGS_CUSTOM;
  public readonly DAMAGE_TYPE = DAMAGE_TYPE;
  public readonly STAT_TYPE = STAT_TYPE;
  public readonly PVP_RANK = PVP_RANK;

  showItemPreview = true;

  private loadedViewer$ = new BehaviorSubject<boolean>(false);

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
    private readonly itemPreviewService: ItemPreviewService,
    private readonly sanitizer: DomSanitizer,
    private readonly queryService: MysqlQueryService,
  ) {
    super(editorService, handlerService);

    this.setupViewer3D();
  }

  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  private async loadItemPreview(): Promise<void> {
    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(
      await this.itemPreviewService.calculatePreview(this.editorService.form.getRawValue()),
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    resetModel3dElement();
    this.loadItemPreview();

    this.subscriptions.push(
      this.editorService.form.valueChanges
        .pipe(
          debounceTime(600),
          /* TODO */
          distinctUntilChanged(
            /* istanbul ignore next */
            (a, b) => JSON.stringify(a) === JSON.stringify(b),
          ),
        )
        .subscribe(this.loadItemPreview.bind(this)),
    );

    this.subscriptions.push(
      this.loadedViewer$
        .pipe(
          filter((loadedViewr) => loadedViewr),
          combineLatestWith(this.editorService.form.get('entry').valueChanges),
          filter(([, entry]) => !!entry),
        )
        .subscribe(([, entry]) => {
          // const inventoryType = this.editorService.form.get('inventoryType').value;
          this.experiment(entry);
        }),
    );

    this.subscriptions.push(
      this.loadedViewer$
        .pipe(
          filter((loadedViewr) => loadedViewr),
          combineLatestWith(this.editorService.form.get('displayid').valueChanges),
          filter(([, displayId]) => !!displayId && !isNaN(displayId)),
        )
        .subscribe(([, displayId]) => {
          this.subscriptions.push(
            this.queryService
              .query(`SELECT entry, inventoryType FROM item_template WHERE displayid=${displayId} LIMIT 1`)
              .subscribe((data) => {
                if (data.length && 'entry' in data[0]) {
                  const entry = data[0].entry;
                  // const inventoryType = data[0].inventoryType;
                  if (!!entry) {
                    this.experiment(Number(entry));
                  }
                }
              }),
          );
        }),
    );
  }

  experiment(itemEntry: number): void {
    getShadowlandDisplayId(itemEntry).then((displayInfo) => {
      resetModel3dElement();
      generateModels(1, `#model_3d1`, {
        type: 1, // inventoryType,
        id: displayInfo.displayId,
      });
    });
  }

  private setupViewer3D(): void {
    window['jQuery'] = jquery;
    window['$'] = jquery;

    if (!window['WH']) {
      window['WH'] = {};
      window['WH'].debug = () => {};
      window['WH'].defaultAnimation = `Stand`;
    }

    const loadedViewer$ = this.loadedViewer$;

    jquery.getScript('https://wow.zamimg.com/modelviewer/live/viewer/viewer.min.js', function () {
      loadedViewer$.next(true);
    });
  }
}
