/* istanbul ignore file */
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { TableRow } from '@keira-shared/types/general';
import * as jquery from 'jquery';
import { BehaviorSubject, filter, Observable, Subscription } from 'rxjs';
import { generateModels, getShadowlandDisplayId } from './helper';
import { CONTENT_LIVE, CONTENT_WOTLK, MODEL_TYPE, VIEWER_TYPE } from './model-3d-viewer.model';

@Component({
  selector: 'keira-model-3d-viewer',
  templateUrl: './model-3d-viewer.component.html',
})
export class Model3DViewerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() viewerType: VIEWER_TYPE;
  @Input() displayId: number;
  @Input() itemClass?: number;
  @Input() itemInventoryType?: number;
  @Input() set modelId(modelId: number) {
    this.displayId = modelId;
  }
  @Input() id? = 'model_3d';

  private loadedViewer$ = new BehaviorSubject<boolean>(false);
  private subscriptions: Subscription[] = [];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(private readonly sanitizer: DomSanitizer, private readonly queryService: MysqlQueryService) {
    this.setupViewer3D();
  }

  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  ngOnInit(): void {
    this.resetModel3dElement();
    this.viewerDynamic();
  }

  ngOnChanges(): void {
    if (!!this.displayId && this.displayId > 0 && this.viewerType != null && this.viewerType != undefined) {
      this.resetModel3dElement();
      this.show3Dmodel();
    }
  }

  show3Dmodel(): void {
    if (this.viewerType === VIEWER_TYPE.ITEM) {
      this.subscriptions.push(
        this.getItemData().subscribe((data) => {
          if (data.length && 'entry' in data[0]) {
            this.verifyModelAndLoad(data[0]);
          }
        }),
      );
    } else {
      this.generate3Dmodel();
    }
  }

  private getItemData(): Observable<TableRow[]> {
    return this.queryService.query(
      `SELECT entry, class AS _class, inventoryType FROM item_template WHERE displayid=${this.displayId} LIMIT 1`,
    );
  }

  private verifyModelAndLoad({ entry, inventoryType, _class }: TableRow): void {
    const modelType = this.getModelType(_class as number, inventoryType as number);

    fetch(this.getContentPathUrl(inventoryType))
      .then(() => {
        this.generate3Dmodel(modelType, this.displayId);
      })
      .catch(() => {
        getShadowlandDisplayId(entry as number).then((displayInfo) => {
          this.generate3Dmodel(modelType, displayInfo.displayId, CONTENT_LIVE);
        });
      });
  }

  private generate3Dmodel(
    modelType: number = this.getModelType(),
    displayId: number = this.displayId,
    contentPath: string = CONTENT_WOTLK,
  ): void {
    this.resetModel3dElement();
    generateModels(
      1,
      `#${this.id}`,
      {
        type: modelType,
        id: displayId,
      },
      contentPath,
    );
  }

  private getContentPathUrl(inventoryType: number | string): string {
    if (inventoryType === 3 || inventoryType === 4) {
      return `${CONTENT_WOTLK}meta/armor/${inventoryType}/${this.displayId}.json`;
    }

    return `${CONTENT_WOTLK}meta/item/${this.displayId}.json`;
  }

  private getModelType(itemClass = this.itemClass, itemInventoryType = this.itemInventoryType): number {
    if (this.viewerType === VIEWER_TYPE.ITEM) {
      const _class = itemClass;
      if (_class == 2) {
        return MODEL_TYPE.WEAPON;
      }

      if (itemInventoryType == 1) {
        return MODEL_TYPE.HELMET;
      }

      if (itemInventoryType == 3) {
        return MODEL_TYPE.SHOULDER;
      }
    }

    if (this.viewerType == VIEWER_TYPE.OBJECT) {
      return MODEL_TYPE.OBJECT;
    }

    return MODEL_TYPE.NPC;
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

    jquery.getScript(`${CONTENT_WOTLK}viewer/viewer.min.js`, function () {
      loadedViewer$.next(true);
    });
  }

  private viewerDynamic(): void {
    this.subscriptions.push(
      this.loadedViewer$.pipe(filter((loadedViewr) => loadedViewr)).subscribe(() => {
        this.show3Dmodel();
      }),
    );
  }

  private resetModel3dElement(): void {
    const modelElement = document.querySelector(`#${this.id}`);
    if (modelElement) {
      modelElement.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
