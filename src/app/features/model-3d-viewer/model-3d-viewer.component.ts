import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as jquery from 'jquery';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { generateModels, resetModel3dElement } from './helper';
import { MODEL_TYPE, VIEWER_TYPE } from './model-3d-viewer.model';

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

  private loadedViewer$ = new BehaviorSubject<boolean>(false);
  private subscriptions: Subscription[] = [];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(private readonly sanitizer: DomSanitizer) {
    this.setupViewer3D();
  }

  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  ngOnInit(): void {
    resetModel3dElement();
    this.viewerDynamic();
  }

  ngOnChanges(): void {
    if (!!this.displayId && this.displayId > 0 && this.viewerType) {
      this.show3Dmodel();
    }
  }

  show3Dmodel(): void {
    const modelType = this.getModelType();

    resetModel3dElement();
    generateModels(1, `#model_3d`, {
      type: modelType,
      id: this.displayId,
    });
  }

  private getModelType(): number {
    if (this.viewerType === VIEWER_TYPE.ITEM) {
      const _class = this.itemClass;
      if (_class == 2) {
        return MODEL_TYPE.WEAPON;
      }

      if (this.itemInventoryType == 1) {
        return MODEL_TYPE.HELMET;
      }

      if (this.itemInventoryType == 3) {
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

    jquery.getScript('https://wow.zamimg.com/modelviewer/wrath/viewer/viewer.min.js', function () {
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
