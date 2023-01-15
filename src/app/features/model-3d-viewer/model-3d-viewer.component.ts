import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { TableRow } from '@keira-shared/types/general';
import * as jquery from 'jquery';
import { BehaviorSubject, catchError, filter, Observable, of, Subscription } from 'rxjs';
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
  @Input() id? = 'model_3d';

  private loadedViewer$ = new BehaviorSubject<boolean>(false);
  private subscriptions = new Subscription();

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(private readonly sanitizer: DomSanitizer, private readonly queryService: MysqlQueryService, private http: HttpClient) {
    this.setupViewer3D();
  }

  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  ngOnInit(): void {
    this.resetModel3dElement();
    this.viewerDynamic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.displayId?.currentValue != changes.displayId?.previousValue &&
      !!this.displayId &&
      this.displayId > 0 &&
      this.viewerType != null &&
      this.viewerType != undefined
    ) {
      this.resetModel3dElement();
      this.show3Dmodel();
    }
  }

  show3Dmodel(): void {
    if (this.viewerType === VIEWER_TYPE.ITEM) {
      this.subscriptions.add(
        this.getItemData$().subscribe((data) => {
          if (data.length && 'entry' in data[0]) {
            this.verifyModelAndLoad(data[0]);
          }
        }),
      );
    } else {
      this.generate3Dmodel();
    }
  }

  private getItemData$(): Observable<TableRow[]> {
    return this.queryService.query(
      `SELECT entry, class AS _class, inventoryType FROM item_template WHERE displayid=${this.displayId} LIMIT 1`,
    );
  }

  private verifyModelAndLoad({ entry, inventoryType, _class }: TableRow): void {
    const modelType = this.getModelType(_class as number, inventoryType as number);

    this.subscriptions.add(
      this.http
        .get(this.getContentPathUrl(inventoryType))
        .pipe(
          catchError(
            /* istanbul ignore next */
            () => {
              /* istanbul ignore next */
              getShadowlandDisplayId(entry as number).then((displayInfo) => {
                this.generate3Dmodel(modelType, displayInfo.displayId, CONTENT_LIVE);
              });
              /* istanbul ignore next */
              return of([]);
            },
          ),
        )
        .subscribe(() => {
          this.generate3Dmodel(modelType, this.displayId);
        }),
    );
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

    if (this.viewerType === VIEWER_TYPE.NPC) {
      return MODEL_TYPE.NPC;
    }

    return null;
  }

  /* istanbul ignore next */
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
    this.subscriptions.add(
      this.loadedViewer$.pipe(filter((loadedViewr) => loadedViewr)).subscribe(() => {
        this.show3Dmodel();
      }),
    );
  }

  /* istanbul ignore next */
  private resetModel3dElement(): void {
    const modelElement = document.querySelector(`#${this.id}`);
    if (modelElement) {
      modelElement.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
