import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CreatureDisplay, itemModelDisplay, WowClientService } from '@keira/shared/wow-data';
import { AmbientLight, DirectionalLight, Group, Mesh, Object3D, PerspectiveCamera, Scene, Sphere, Vector3 } from 'three';
import { disposeM2Template } from './m2-object';
import { DisplayModel, displayModel } from './spawn-models';
import { TextureCache } from './texture-cache';
import { WORLD_RENDERER_FACTORY, WorldRenderer } from './world-renderer';

/** How far the camera starts from the model, in model radiuses. */
const CAMERA_DISTANCE = 2.6;
/** Radians turned per pixel dragged. */
const TURN_SPEED = 0.01;

/**
 * One creature or gameobject display drawn from the game data set in Settings (the client this server uses, its
 * patched and custom models included), instead of Wowhead's online models: drag to turn it, scroll to zoom. Says
 * `failed` when the display or its model isn't in the game data.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-local-model-viewer',
  template: `<div class="local-model-viewer" data-testid="local-model-viewer">
    <canvas
      #canvas
      (pointerdown)="startTurn($event)"
      (pointermove)="turn($event)"
      (pointerup)="endTurn()"
      (pointerleave)="endTurn()"
      (wheel)="zoom($event)"
    ></canvas>
    @if (state() !== 'shown') {
      <small class="local-model-state" data-testid="local-model-state">{{ state() }}</small>
    }
  </div>`,
  styles: `
    .local-model-viewer {
      position: relative;
      width: 100%;
      height: 300px;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
    }
    .local-model-state {
      position: absolute;
      left: 0.5rem;
      bottom: 0.25rem;
      opacity: 0.8;
    }
  `,
})
export class LocalModelViewerComponent implements OnChanges, OnDestroy {
  private readonly client = inject(WowClientService);
  private readonly rendererFactory = inject(WORLD_RENDERER_FACTORY);

  readonly kind = input.required<'creature' | 'gameobject' | 'item'>();
  /** An item's slot (item_template.InventoryType): where its model is. */
  readonly inventoryType = input<number>();
  readonly displayId = input.required<number>();
  /** The display or its model isn't in the game data (the caller may show Wowhead's instead). */
  readonly failed = output<string>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly state = signal<'loading' | 'shown' | string>('loading');

  private renderer?: WorldRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(40, 1, 0.05, 2000);
  private readonly pivot = new Group();
  private model?: DisplayModel;
  private distance = 10;
  private dragging?: number;
  private request = 0;
  private readonly textures = new TextureCache((path) => this.client.getTexture(path));

  constructor() {
    this.camera.up.set(0, 0, 1);
    this.scene.add(new AmbientLight(0xffffff, 1.6), this.pivot);
    const sun = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(1, -1.5, 2);
    this.scene.add(sun);
  }

  ngOnChanges(): void {
    void this.show();
  }

  private async show(): Promise<void> {
    const request = ++this.request;
    this.state.set('loading');
    this.clear();
    const id = Number(this.displayId());
    try {
      const display: CreatureDisplay | undefined =
        this.kind() === 'creature'
          ? await this.client.getCreatureDisplay(id)
          : this.kind() === 'item'
            ? await this.client
                .getItemDisplayInfo(id)
                .then((item) => (item ? itemModelDisplay(item, Number(this.inventoryType())) : undefined))
            : await this.client
                .getGameObjectDisplay(id)
                .then((model) => (model ? ({ model, scale: 1, textures: {} } as CreatureDisplay) : undefined));
      let reason = display ? '' : `display ${id} is not in the game data`;
      // (buildings are drawn by the World Editor, not here)
      if (display && /\.wmo$/i.test(display.model)) {
        reason = `${display.model} is a building`;
      }
      const model = reason
        ? undefined
        : await displayModel(display as CreatureDisplay, this.client, this.textures, {
            // (humanoids wear their clothes, helmet and shoulders)
            equipment: true,
            onSkipped: (why) => (reason = why),
          });
      if (request !== this.request) {
        this.dispose(model);
        return;
      }
      if (!model) {
        this.fail(reason);
        return;
      }
      this.place(model);
    } catch (error) {
      if (request === this.request) {
        this.fail(String((error as Error)?.message ?? error));
      }
    }
  }

  private place(model: DisplayModel): void {
    this.model = model;
    const mesh = new Mesh(model.template.geometry, model.template.materials);
    for (const worn of model.worn ?? []) {
      const part = new Mesh(worn.template.geometry, worn.template.materials);
      part.position.set(...worn.position);
      mesh.add(part);
    }
    mesh.scale.setScalar(model.scale || 1);
    this.pivot.add(mesh);
    const sphere = (model.template.geometry.boundingSphere as Sphere).clone();
    const centre = sphere.center.multiplyScalar(model.scale || 1);
    mesh.position.sub(centre);
    this.distance = Math.max(0.5, sphere.radius * (model.scale || 1) * CAMERA_DISTANCE);
    this.state.set('shown');
    this.render();
  }

  private fail(reason: string): void {
    this.state.set(reason);
    this.failed.emit(reason);
  }

  protected startTurn(event: PointerEvent): void {
    this.dragging = event.clientX;
  }

  protected turn(event: PointerEvent): void {
    if (this.dragging === undefined) {
      return;
    }
    this.pivot.rotation.z += (event.clientX - this.dragging) * TURN_SPEED;
    this.dragging = event.clientX;
    this.render();
  }

  protected endTurn(): void {
    this.dragging = undefined;
  }

  protected zoom(event: WheelEvent): void {
    event.preventDefault();
    this.distance = Math.max(0.3, this.distance * (event.deltaY > 0 ? 1.1 : 0.9));
    this.render();
  }

  private render(): void {
    const canvas = this.canvas().nativeElement;
    this.renderer ??= this.rendererFactory(canvas);
    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 300;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.copy(new Vector3(0, -this.distance, this.distance * 0.35));
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  private clear(): void {
    for (const child of [...this.pivot.children] as Object3D[]) {
      this.pivot.remove(child);
    }
    this.dispose(this.model);
    this.model = undefined;
  }

  private dispose(model: DisplayModel | undefined): void {
    if (model) {
      disposeM2Template(model.template);
      model.worn?.forEach((worn) => disposeM2Template(worn.template));
    }
  }

  ngOnDestroy(): void {
    this.request++;
    this.clear();
    this.renderer?.dispose();
  }
}
