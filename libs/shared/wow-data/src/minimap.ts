import { TileCoord } from './coords';

/**
 * `textures/Minimap/md5translate.trs` maps readable minimap names to the hashed BLP files that actually exist:
 *
 *   dir: Azeroth
 *   Azeroth\map32_48.blp	b53fb722839e0c7a81bae678ea694f5c.blp
 *
 * Keys are lower-cased with backslashes.
 */
export function parseMd5Translate(text: string): Map<string, string> {
  const entries = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const [plain, hashed] = line.split('\t');
    if (plain && hashed && !plain.startsWith('dir:')) {
      entries.set(plain.trim().replace(/\//g, '\\').toLowerCase(), hashed.trim());
    }
  }
  return entries;
}

/** The name md5translate.trs lists a tile's minimap under: `azeroth\\map32_48.blp`, with two digits (`map44_08`). */
export function minimapKey(directory: string, tile: TileCoord): string {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${directory}\\map${two(tile.tx)}_${two(tile.ty)}.blp`.toLowerCase();
}

/** The key a minimap tile is kept under in the disk cache. */
export function minimapCacheKey(directory: string, tile: TileCoord): string {
  return `${directory}_${tile.tx}_${tile.ty}`;
}

export const MINIMAP_ROOT = 'textures\\Minimap\\';
export const MD5_TRANSLATE_PATH = `${MINIMAP_ROOT}md5translate.trs`;
