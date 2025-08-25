import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import * as jquery from 'jquery';
import { BehaviorSubject, catchError, filter, Observable, of, Subscription } from 'rxjs';
import { generateModels, getShadowlandDisplayId } from './helper';
import {
  CHAR_DISPLAYABLE_INVENTORY_TYPE,
  CharacterOptions,
  CONTENT_WOTLK,
  Gender,
  InventoryType,
  MODEL_TYPE,
  Race,
  VIEWER_TYPE,
  WoWModel,
} from './model-3d-viewer.model';

declare const ZamModelViewer: any;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-model-3d-viewer',
  templateUrl: './model-3d-viewer.component.html',
  standalone: true,
})
export class Model3DViewerComponent implements OnInit, OnDestroy, OnChanges {
  private readonly queryService = inject(MysqlQueryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);
  private readonly KEIRA_APP_CONFIG = inject(KEIRA_APP_CONFIG_TOKEN);

  private readonly windowRef = window as typeof window & {
    jQuery: any;
    $: any;
    WH: any;
    models: any;
  };

  private static uniqueId = 0;
  protected readonly uniqueId = Model3DViewerComponent.uniqueId++;

  readonly viewerType = input.required<VIEWER_TYPE>();
  readonly displayId = input.required<number>();
  readonly itemClass = input<number>();
  readonly itemInventoryType = input<InventoryType>();

  private readonly loadedViewer$ = new BehaviorSubject<boolean>(false);
  private readonly subscriptions = new Subscription();
  private readonly models3D: any[] = []; // ZamModelViewer[]

  ngOnInit(): void {
    this.setupViewer3D();
    this.resetModel3dElement();
    this.viewerDynamic();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.windowRef.jQuery) {
      return;
    }

    const displayId = this.displayId();
    if (
      changes['displayId']?.currentValue != changes['displayId']?.previousValue &&
      !!displayId &&
      displayId > 0 &&
      this.viewerType() != null
    ) {
      this.show3Dmodel();
    }
  }

  protected show3Dmodel(): void {
    if (this.viewerType() === VIEWER_TYPE.ITEM) {
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
      `SELECT entry, class AS _class, inventoryType FROM item_template WHERE displayid=${this.displayId()} LIMIT 1`,
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
              return of(null);
            },
          ),
        )
        .subscribe((result) => {
          if (result === null) {
            return;
          }

          this.generate3Dmodel(modelType, this.displayId());
        }),
    );
  }

  /* istanbul ignore next */ // TODO: fix coverage
  private generate3Dmodel(
    modelType = this.getModelType(),
    displayId: number = this.displayId(),
    contentPath: string = CONTENT_WOTLK,
    inventoryType = this.itemInventoryType(),
  ): void {
    this.resetModel3dElement();

    let model: WoWModel | CharacterOptions;

    if (modelType === MODEL_TYPE.CHARACTER) {
      // TODO
      model = {
        race: Race.NORTHREND_SKELETON,
        gender: Gender.MALE,
        skin: 0,
        face: 0,
        hairStyle: 0,
        hairColor: 0,
        facialStyle: 0,
        items: [[inventoryType, displayId]],
      } as CharacterOptions;
    } else {
      model = {
        type: modelType,
        id: displayId,
      } as WoWModel;
    }

    generateModels(1, `#model_3d_${this.uniqueId}`, model, contentPath).then((WoWModel) => {
      /* istanbul ignore next */
      this.models3D.push(WoWModel);
    });
  }

  private getContentPathUrl(inventoryType: InventoryType | string): string {
    if (inventoryType === InventoryType.SHOULDERS || inventoryType === InventoryType.SHIRT) {
      return `${CONTENT_WOTLK}meta/armor/${inventoryType}/${this.displayId()}.json`;
    }

    return `${CONTENT_WOTLK}meta/item/${this.displayId()}.json`;
  }

  private getModelType(
    itemClass = this.itemClass(),
    itemInventoryType: InventoryType | undefined = this.itemInventoryType(),
  ): MODEL_TYPE | -1 {
    if (this.viewerType() === VIEWER_TYPE.ITEM) {
      const _class = itemClass;
      if (_class === 2) {
        return MODEL_TYPE.WEAPON;
      }

      if (itemInventoryType === InventoryType.HEAD) {
        return MODEL_TYPE.HELMET;
      }

      if (itemInventoryType === InventoryType.SHOULDERS) {
        return MODEL_TYPE.SHOULDER;
      }

      if (itemInventoryType && CHAR_DISPLAYABLE_INVENTORY_TYPE.includes(itemInventoryType)) {
        return MODEL_TYPE.CHARACTER;
      }
    }

    if (this.viewerType() === VIEWER_TYPE.OBJECT) {
      return MODEL_TYPE.OBJECT;
    }

    if (this.viewerType() === VIEWER_TYPE.NPC) {
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
      this.windowRef.WH.WebP = { getImageExtension: () => '.webp' };
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
