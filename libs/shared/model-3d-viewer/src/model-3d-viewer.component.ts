import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import * as jquery from 'jquery';
import { BehaviorSubject, catchError, filter, Observable, of, Subscription } from 'rxjs';
import { generateModels, getShadowlandDisplayId } from './helper';
import { CONTENT_WOTLK, MODEL_TYPE, VIEWER_TYPE } from './model-3d-viewer.model';

declare const ZamModelViewer: any;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-model-3d-viewer',
  templateUrl: './model-3d-viewer.component.html',
  standalone: true,
})
export class Model3DViewerComponent implements OnInit, OnDestroy, OnChanges {
  private readonly queryService = inject(MysqlQueryService);
  private readonly windowRef = window as typeof window & {
    jQuery: any;
    $: any;
    WH: any;
    models: any;
  };
  private readonly http = inject(HttpClient);
  private readonly KEIRA_APP_CONFIG = inject(KEIRA_APP_CONFIG_TOKEN);

  private static uniqueId = 0;
  protected readonly uniqueId = Model3DViewerComponent.uniqueId++;

  @Input() viewerType!: VIEWER_TYPE;
  @Input() displayId!: number;
  @Input() itemClass?: number;
  @Input() itemInventoryType?: number;

  private readonly loadedViewer$ = new BehaviorSubject<boolean>(false);
  private readonly subscriptions = new Subscription();
  private readonly models3D: any[] = [];

  ngOnInit(): void {
    this.setupViewer3D();
    this.resetModel3dElement();
    this.viewerDynamic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['displayId']?.currentValue != changes['displayId']?.previousValue &&
      !!this.displayId &&
      this.displayId > 0 &&
      this.viewerType != null
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
              getShadowlandDisplayId(this.KEIRA_APP_CONFIG.sqliteItem3dPath, entry as number).then((displayInfo) => {
                this.generate3Dmodel(modelType, displayInfo.displayId, CONTENT_WOTLK);
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

  /* istanbul ignore next */ // TODO: fix coverage
  private generate3Dmodel(
    modelType: number = this.getModelType(),
    displayId: number = this.displayId,
    contentPath: string = CONTENT_WOTLK,
  ): void {
    this.resetModel3dElement();

    generateModels(
      1,
      `#model_3d_${this.uniqueId}`,
      {
        type: modelType,
        id: displayId,
      },
      contentPath,
    ).then((WoWModel) => {
      /* istanbul ignore next */
      this.models3D.push(WoWModel);
    });
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

    return -1;
  }

  /* istanbul ignore next */
  private setupViewer3D(): void {
    if (!this.windowRef.jQuery) {
      this.windowRef.jQuery = jquery.default;
    }
    if (!this.windowRef.$) {
      this.windowRef.$ = jquery.default;
    }

    if (!this.windowRef.WH) {
      this.windowRef.WH = {};
      this.windowRef.WH.debug = () => {};
      this.windowRef.WH.defaultAnimation = `Stand`;
    }

    const loadedViewer$ = this.loadedViewer$;

    if (typeof ZamModelViewer === 'undefined') {
      jquery.getScript(`https://wow.zamimg.com/modelviewer/wrath/viewer/viewer.min.js`, function () {
        loadedViewer$.next(true);
      });
    }
  }

  private viewerDynamic(): void {
    this.subscriptions.add(
      this.loadedViewer$.pipe(filter((loadedViewr) => loadedViewr)).subscribe(
        /* istanbul ignore next */
        () => {
          this.show3Dmodel();
        },
      ),
    );
  }

  /* istanbul ignore next */
  private resetModel3dElement(): void {
    const modelElement = document.querySelector(`#model_3d_${this.uniqueId}`);
    this.clean3DModels();
    if (modelElement) {
      modelElement.innerHTML = '';
    }
  }

  private clean3DModels(): void {
    for (const model3D of this.models3D) {
      model3D?.destroy();
    }
    delete this.windowRef.models;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.resetModel3dElement();
  }
}
