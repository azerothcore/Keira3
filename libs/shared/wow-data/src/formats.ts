import { Blp, BLP_IMAGE_FORMAT, Map as WdtMap, MapArea } from '@wowserhq/format';
import { TILE_COUNT, TileCoord } from './coords';
import { TerrainChunk } from './terrain-mesh';

/** Thin adapters over `@wowserhq/format`, so the rest of the code only deals with plain data. */

export interface RgbaImage {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel, row-major from the top-left corner. */
  data: Uint8Array;
}

/** `@wowserhq/io` reads from an ArrayBuffer; copy only when the bytes are a view on a larger buffer. */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const whole = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength && bytes.buffer instanceof ArrayBuffer;
  return whole ? (bytes.buffer as ArrayBuffer) : bytes.slice().buffer;
}

export type LayerSplatDepth = 4 | 8;

/** `layerSplatDepth` must come from the map's WDT: parsing alpha maps with the wrong depth fails. */
export function parseAdtChunks(bytes: Uint8Array, layerSplatDepth: LayerSplatDepth): TerrainChunk[] {
  return new MapArea(layerSplatDepth).load(toArrayBuffer(bytes)).chunks.map((chunk) => ({
    position: chunk.position,
    vertexHeights: chunk.vertexHeights,
    holes: chunk.holes,
    vertexNormals: chunk.vertexNormals,
    layers: chunk.layers.map((layer) => ({ texture: layer.texture, splat: layer.splat })),
  }));
}

export interface WdtInfo {
  /** Tiles flagged as present (MAIN chunk is stored row by row: index = ty * 64 + tx). */
  tiles: TileCoord[];
  layerSplatDepth: LayerSplatDepth;
}

export function parseWdt(bytes: Uint8Array): WdtInfo {
  const wdt = new WdtMap().load(toArrayBuffer(bytes));
  const tiles: TileCoord[] = [];
  wdt.availableAreas.forEach((flag, index) => {
    if (flag) {
      tiles.push({ tx: index % TILE_COUNT, ty: Math.floor(index / TILE_COUNT) });
    }
  });
  return { tiles, layerSplatDepth: wdt.layerSplatDepth };
}

/** Decodes the top mip level of a BLP texture. ABGR8888 is laid out in memory as R, G, B, A bytes. */
export function decodeBlp(bytes: Uint8Array): RgbaImage {
  const blp = new Blp().load(toArrayBuffer(bytes));
  const image = blp.getImage(0, BLP_IMAGE_FORMAT.IMAGE_ABGR8888);
  return { width: image.width, height: image.height, data: new Uint8Array(image.data) };
}
