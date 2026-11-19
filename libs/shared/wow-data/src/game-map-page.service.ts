import { inject, Injectable } from '@angular/core';
import { RgbaImage } from './formats';
import { GamePage, gameMapPages, pageAt } from './game-map';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';

/** A page of the client's world map showing a place: its picture and the part of the world it shows. */
export interface GameMapPageShown {
  page: GamePage;
  name: string;
  imageUrl: string;
}

/** A picture as a PNG data URL (undefined where there is no canvas). */
export function imageDataUrl(image: RgbaImage, document: Document = globalThis.document): string | undefined {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) {
    return undefined;
  }
  context.putImageData(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height), 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * The client's world map pages (dungeon and raid floors included, #3823) for the maps of spawns: the bundled maps
 * have only the zones, and an instance's WorldMapArea row has no bounds. Only with the game client folder set.
 */
@Injectable({ providedIn: 'root' })
export class GameMapPageService {
  private readonly client = inject(WowClientService);
  private readonly settings = inject(WowDataSettingsService);
  private maps?: Promise<{ pages: Map<string, GamePage>; names: Map<number, string> }>;
  private readonly urls = new Map<string, Promise<string | undefined>>();

  /** The zone or floor page showing a place, with its picture; undefined without the client or a picture. */
  async pageAt(mapId: number, x: number, y: number): Promise<GameMapPageShown | undefined> {
    if (!this.client.isSupported() || !this.settings.isConfigured()) {
      return undefined;
    }
    try {
      this.maps ??= this.client.getGameMap().then((map) => ({
        pages: gameMapPages(map),
        names: new Map([...map.zones].map(([id, zone]) => [id, zone.name])),
      }));
      const { pages, names } = await this.maps;
      const page = pageAt(pages, mapId, x, y);
      if ((page.kind !== 'zone' && page.kind !== 'floor') || !page.bounds) {
        return undefined;
      }
      const imageUrl = await this.imageUrl(page);
      if (!imageUrl) {
        return undefined;
      }
      const name = names.get(page.areaId) ?? page.prefix.split('\\')[0];
      return { page, name: page.floor ? `${name} (${page.floor})` : name, imageUrl };
    } catch (error) {
      console.warn('[GameMapPage] no world map page from the client', error);
      this.maps = undefined;
      return undefined;
    }
  }

  private imageUrl(page: GamePage): Promise<string | undefined> {
    let url = this.urls.get(page.key);
    if (!url) {
      url = this.client.getGameMapPicture(page).then((picture) => (picture ? imageDataUrl(picture.image) : undefined));
      this.urls.set(page.key, url);
      url.catch(() => this.urls.delete(page.key));
    }
    return url;
  }
}
