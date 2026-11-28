import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CREATURE_RACE_OPTION_ICON } from '@keira/shared/acore-world-model';
import { Option, TableRow } from '@keira/shared/constants';
import { MysqlQueryService, SqliteQueryService } from '@keira/shared/db-layer';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import * as jquery from 'jquery';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, catchError, filter, Observable, of, Subscription } from 'rxjs';
import {
  CHAR_DISPLAYABLE_INVENTORY_TYPE,
  CharacterOptions,
  CONTENT_WOTLK,
  CREATURE_GENDER_OPTION_ICON,
  Gender,
  InventoryType,
  MODEL_TYPE,
  Race,
  VIEWER_TYPE,
  WEAPONS_INVENTORY_TYPE,
  WoWModel,
} from './model-3d-viewer.model';
import { Model3DViewerService } from './model-3d-viewer.service';

declare const ZamModelViewer: any;

@Component({
  selector: 'keira-model-3d-viewer',
  templateUrl: './model-3d-viewer.component.html',
  styleUrl: './model-3d-viewer.component.scss',
  imports: [GenericOptionSelectorComponent, ReactiveFormsModule, FormsModule, TranslatePipe],
})
export class Model3DViewerComponent implements OnInit, OnDestroy, OnChanges {
  private readonly queryService = inject(MysqlQueryService);
  private readonly sqliteQueryService = inject(SqliteQueryService);
  private readonly http = inject(HttpClient);
  private readonly model3DViewerService = inject(Model3DViewerService);

  protected CREATURE_RACE = signal<Option[]>(CREATURE_RACE_OPTION_ICON);
  protected readonly raceControl = new FormControl<Race>(Race.HUMAN);

  protected CREATURE_GENDER = signal<Option[]>(CREATURE_GENDER_OPTION_ICON);
  protected readonly genderControl = new FormControl<Gender>(Gender.MALE);

  protected readonly MODEL_TYPE_CHARACTER = MODEL_TYPE.CHARACTER;

  protected readonly showOnCharacterControl = new FormControl<boolean>(false, { nonNullable: true });

  protected readonly backgroundColor = new FormControl<string>('#000000');

  protected readonly showSettings = signal(false);

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
  readonly enableBgSettings = input<boolean>(false);

  private readonly loadedViewer$ = new BehaviorSubject<boolean>(false);
  private readonly subscriptions = new Subscription();
  private readonly models3D: (typeof ZamModelViewer)[] = [];

  private mutex3D = false;

  ngOnInit(): void {
    this.initRaceGenderControls();
    this.initShowOnCharacterControl();
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
      setTimeout(() => this.show3Dmodel());
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

  private verifyModelAndLoad({ entry, inventoryType }: TableRow): void {
    const modelType = this.getModelType(inventoryType as number);

    this.subscriptions.add(
      this.http
        .get(this.getContentPathUrl(inventoryType))
        .pipe(
          catchError(
            /* v8 ignore next */
            () => {
              /* v8 ignore next */
              this.sqliteQueryService.getItemDisplayInfoByItemId(entry as number).then((rows) => {
                if (rows.length) {
                  this.generate3Dmodel(modelType, rows[0].ItemDisplayInfoID, CONTENT_WOTLK);
                }
              });
              /* v8 ignore next */
              return of(null);
            },
          ),
        )
        .subscribe((result) => {
          /* v8 ignore next */
          if (result === null) {
            return;
          }

          this.generate3Dmodel(modelType, this.displayId());
        }),
    );
  }

  /* v8 ignore next -- TODO: fix coverage */
  private generate3Dmodel(
    modelType = this.getModelType(),
    displayId: number = this.displayId(),
    contentPath: string = CONTENT_WOTLK,
    inventoryType = this.itemInventoryType(),
  ): void {
    if (this.mutex3D) {
      return;
    }
    this.mutex3D = true;

    this.resetModel3dElement();

    let model: WoWModel | CharacterOptions;

    if (modelType === MODEL_TYPE.CHARACTER) {
      model = {
        race: this.raceControl.value,
        gender: this.genderControl.value,
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

    this.model3DViewerService.generateModels(1, `#model_3d_${this.uniqueId}`, model, contentPath).then((WoWModel) => {
      /* v8 ignore next */
      this.models3D.push(WoWModel);
      this.mutex3D = false;
    });
  }

  private getContentPathUrl(inventoryType: InventoryType | string): string {
    if (inventoryType === InventoryType.SHOULDERS || inventoryType === InventoryType.SHIRT) {
      return `${CONTENT_WOTLK}meta/armor/${inventoryType}/${this.displayId()}.json`;
    }

    return `${CONTENT_WOTLK}meta/item/${this.displayId()}.json`;
  }

  protected getModelType(itemInventoryType: InventoryType | undefined = this.itemInventoryType()): MODEL_TYPE | -1 {
    const viewerType = this.viewerType();
    if (viewerType === VIEWER_TYPE.ITEM) {
      const standaloneModelType = this.getStandaloneItemModelType(itemInventoryType);
      if (standaloneModelType !== undefined) {
        return this.showOnCharacterControl.value ? MODEL_TYPE.CHARACTER : standaloneModelType;
      }

      if (itemInventoryType && CHAR_DISPLAYABLE_INVENTORY_TYPE.includes(itemInventoryType)) {
        return MODEL_TYPE.CHARACTER;
      }
    }

    if (viewerType === VIEWER_TYPE.OBJECT) {
      return MODEL_TYPE.OBJECT;
    }

    if (viewerType === VIEWER_TYPE.NPC) {
      return MODEL_TYPE.NPC;
    }

    return -1;
  }

  protected canShowOnCharacter(): boolean {
    return this.viewerType() === VIEWER_TYPE.ITEM && this.getStandaloneItemModelType(this.itemInventoryType()) !== undefined;
  }

  private getStandaloneItemModelType(itemInventoryType: InventoryType | undefined): MODEL_TYPE | undefined {
    if (itemInventoryType && WEAPONS_INVENTORY_TYPE.includes(itemInventoryType)) {
      return MODEL_TYPE.WEAPON;
    }

    if (itemInventoryType === InventoryType.HEAD) {
      return MODEL_TYPE.HELMET;
    }

    if (itemInventoryType === InventoryType.SHOULDERS) {
      return MODEL_TYPE.SHOULDER;
    }

    return undefined;
  }

  /* v8 ignore next */
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
      jquery.getScript('https://wowgaming.altervista.org/modelviewer/scripts/viewer.min.js', function () {
        loadedViewer$.next(true);
      });
    } else {
      loadedViewer$.next(true);
    }
  }

  private viewerDynamic(): void {
    this.subscriptions.add(
      this.loadedViewer$.pipe(filter((loadedViewr) => loadedViewr)).subscribe(
        /* v8 ignore next */
        () => {
          this.show3Dmodel();
        },
      ),
    );
  }

  private initRaceGenderControls(): void {
    this.subscriptions.add(
      this.raceControl.valueChanges.subscribe(() => {
        if (this.getModelType() !== MODEL_TYPE.CHARACTER) {
          return;
        }

        this.CREATURE_GENDER.set([
          { value: 0, name: 'Male', icon: `race/${this.raceControl.value}-0.gif` },
          { value: 1, name: 'Female', icon: `race/${this.raceControl.value}-1.gif` },
        ]);

        this.show3Dmodel();
      }),
    );

    this.subscriptions.add(
      this.genderControl.valueChanges.subscribe(() => {
        if (this.getModelType() !== MODEL_TYPE.CHARACTER) {
          return;
        }

        /* v8 ignore next */
        const prevValue = !this.genderControl.value ? 1 : 0;
        this.CREATURE_RACE.set(
          CREATURE_RACE_OPTION_ICON.map((option) => ({
            ...option,
            icon: option.icon?.replace(`-${prevValue}.gif`, `-${this.genderControl.value}.gif`),
          })),
        );

        this.show3Dmodel();
      }),
    );
  }

  private initShowOnCharacterControl(): void {
    this.subscriptions.add(this.showOnCharacterControl.valueChanges.subscribe(() => this.show3Dmodel()));
  }

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
