import { RgbaImage } from './formats';

/**
 * Clean outlines of the regions of a world map picture, traced from the client's own pictures the way AoWoW's
 * ZoneShapeTracer does (`setup/tools/filegen/zoneshapes.ss.php`):
 *
 * 1. rasterize: each region's picture (a zone's highlight, a sub-zone's explored overlay, a continent's outline) is
 *    stretched over its rectangle of the 1002 × 668 map and thresholded; a blank one (a capital city) becomes an ellipse;
 * 2. resolve: highlights glow over their neighbours, so each pixel goes to the region it lies deepest inside (3-4
 *    chamfer distance to the region's edge) and borders end up halfway between regions; regions inside another one
 *    (cities) are painted on top;
 * 3. clean: gaps between regions are closed (coasts are kept), holes inside one region filled, a 3 × 3 majority filter
 *    run and specks removed;
 * 4. vectorize: each region's pixel edges are followed into rings (turning right where two pixels meet at a corner),
 *    collinear corners dropped, simplified (Douglas–Peucker), smoothed (Chaikin) and tiny rings dropped.
 *
 * Rings come out as flat `[x0, y0, x1, y1, …]` lists, in percent of the map (or in pixels, for `vectorizeLabels`).
 */
export const TRACE_WIDTH = 1002;
export const TRACE_HEIGHT = 668;

const W = TRACE_WIDTH;
const H = TRACE_HEIGHT;

/** A flat ring: `[x0, y0, x1, y1, …]`. */
export type Ring = number[];

/** How the tracer works (AoWoW's defaults). */
export interface TraceOptions {
  /** A texel is lit from this share of the region's brightest one… */
  relThreshold: number;
  /** …and at least this bright (of 255). */
  absThreshold: number;
  /** Majority filter passes. */
  smoothPasses: number;
  /** Gaps up to twice this wide (pixels) between regions are closed; coasts stay. */
  gapClose: number;
  /** Connected pieces smaller than this (pixels) are dropped. */
  minSpeck: number;
  /** A region is nested in another when this share of it lies inside one at least 1 / `nestedRatio` times bigger. */
  nestedCover: number;
  nestedRatio: number;
  /** Douglas–Peucker tolerance (pixels). */
  simplify: number;
  /** Corner cutting passes. */
  chaikin: number;
  /** Rings smaller than this (square pixels) once simplified are dropped. */
  minRingArea: number;
  /** A blank highlight (a capital city) is an ellipse of this share of its rectangle. */
  cityRadius: number;
}

export const TRACE_DEFAULTS: TraceOptions = {
  relThreshold: 0.07,
  absThreshold: 4,
  smoothPasses: 2,
  gapClose: 6,
  minSpeck: 20,
  nestedCover: 0.7,
  nestedRatio: 0.35,
  simplify: 0.85,
  chaikin: 1,
  minRingArea: 12,
  cityRadius: 0.3,
};

/**
 * A piece of a region: a picture over a rectangle of the map (pixels, may reach past the map), or an ellipse.
 * `crop`: only the top 1002:668 of the picture is used (zone highlights; default). `mode`: 'lum' (brightness × opacity,
 * default) or 'alpha' (opacity only). `outline`: the picture is an outline whose inside is the region. `threshold`: an
 * absolute cut-off (0–255) instead of the relative one.
 */
export interface TracePart {
  image?: RgbaImage;
  rect?: [number, number, number, number];
  crop?: boolean;
  mode?: 'lum' | 'alpha';
  outline?: boolean;
  threshold?: number;
  /** [centre x, centre y, radius x, radius y] in pixels. */
  ellipse?: [number, number, number, number];
}

export interface TraceRegion {
  id: string;
  parts: TracePart[];
}

/** A region's pixels, in its bounding box. */
interface Mask {
  x: number;
  y: number;
  w: number;
  h: number;
  /** How many are set. */
  n: number;
  m: Uint8Array;
  /** Made up (an ellipse for a blank highlight): always on top. */
  synthetic: boolean;
}

/** The outlines of regions, in percent of the map, by id. */
export function traceRegions(regions: TraceRegion[], options: Partial<TraceOptions> = {}): Map<string, Ring[]> {
  const o = { ...TRACE_DEFAULTS, ...options };
  // 1. rasterize
  const masks = new Map<number, Mask>();
  regions.forEach((region, index) => {
    const parts = region.parts
      .map((part) => (part.ellipse ? ellipseMask(part.ellipse, false) : rasterize(part, o)))
      .filter((mask): mask is Mask => !!mask);
    if (parts.length) {
      masks.set(index, parts.length === 1 ? parts[0] : unionMasks(parts));
    }
  });
  const result = new Map<string, Ring[]>();
  if (!masks.size) {
    return result;
  }

  // 2. resolve overlaps
  const label = new Int32Array(W * H).fill(-1);
  const nested = findNested(masks, o);
  masks.forEach((mask, index) => mask.synthetic && nested.add(index));
  const best = new Int32Array(W * H);
  masks.forEach((mask, index) => {
    if (nested.has(index)) {
      return;
    }
    const depth = chamfer(mask);
    for (let y = 0; y < mask.h; y++) {
      const row = (mask.y + y) * W + mask.x;
      for (let x = 0; x < mask.w; x++) {
        const d = depth[y * mask.w + x];
        if (d > 0 && d > best[row + x]) {
          best[row + x] = d;
          label[row + x] = index;
        }
      }
    }
  });
  // nested ones on top, the biggest first so the smallest wins when nested twice
  [...nested]
    .sort((a, b) => (masks.get(b) as Mask).n - (masks.get(a) as Mask).n)
    .forEach((index) => {
      const mask = masks.get(index) as Mask;
      for (let y = 0; y < mask.h; y++) {
        for (let x = 0; x < mask.w; x++) {
          if (mask.m[y * mask.w + x]) {
            label[(mask.y + y) * W + mask.x + x] = index;
          }
        }
      }
    });

  // 3. clean up
  const box = unionBox([...masks.values()], o.gapClose + 2);
  if (o.gapClose > 0) {
    closeGaps(label, box, o.gapClose);
  }
  fillHoles(label, box);
  let cleaned: Int32Array = label;
  for (let i = 0; i < o.smoothPasses; i++) {
    cleaned = majority(cleaned, box);
  }
  removeSpecks(cleaned, box, o.minSpeck);

  // 4. vectorize
  vectorizeRings(cleaned, box, o).forEach((rings, index) => result.set(regions[index].id, rings.map(toPercent)));
  return result;
}

/**
 * The outlines of an already labelled map (1002 × 668, −1 for none): smoothed, specks smaller than `minSpeck` dropped,
 * traced and simplified; rings in pixels, by label.
 */
export function vectorizeLabels(labels: Int32Array, minSpeck = 0, options: Partial<TraceOptions> = {}): Map<number, Ring[]> {
  const o = { ...TRACE_DEFAULTS, ...options };
  const box: Box = [0, 0, W, H];
  let label: Int32Array = labels;
  for (let i = 0; i < o.smoothPasses; i++) {
    label = majority(label, box);
  }
  if (label === labels) {
    label = labels.slice();
  }
  removeSpecks(label, box, minSpeck || o.minSpeck);
  return vectorizeRings(label, box, o);
}

const toPercent = (ring: Ring): Ring => ring.map((v, i) => Math.round((v * 10000) / (i % 2 ? H : W)) / 100);

type Box = [number, number, number, number];

function vectorizeRings(label: Int32Array, box: Box, o: TraceOptions): Map<number, Ring[]> {
  const result = new Map<number, Ring[]>();
  traceRings(label, box).forEach((rings, index) => {
    const out: Ring[] = [];
    for (const traced of rings) {
      let ring = douglasPeucker(dropCollinear(traced), o.simplify);
      for (let i = 0; i < o.chaikin; i++) {
        ring = chaikinRing(ring);
      }
      // (a ring simplified down to a line has no area)
      if (Math.abs(ringArea(ring)) >= o.minRingArea) {
        out.push(ring.flat());
      }
    }
    if (out.length) {
      result.set(index, out);
    }
  });
  return result;
}

function rasterize(part: TracePart, o: TraceOptions): Mask | undefined {
  const image = part.image;
  if (!image) {
    return undefined;
  }
  const [x0, y0, x1, y1] = part.rect as [number, number, number, number];
  if (x1 - x0 < 1 || y1 - y0 < 1) {
    return undefined;
  }
  const tw = image.width;
  const th = image.height;
  // zone highlights: the client shows only their top 1002:668
  const cropH = part.crop === false ? th : (th * H) / W;
  const rows = Math.min(th, Math.ceil(cropH));
  const lum = new Float32Array(tw * rows);
  let peak = 0;
  for (let i = 0; i < lum.length; i++) {
    const a = image.data[i * 4 + 3];
    const v = part.mode === 'alpha' ? a : (Math.max(image.data[i * 4], image.data[i * 4 + 1], image.data[i * 4 + 2]) * a) / 255;
    lum[i] = v;
    peak = Math.max(peak, v);
  }
  const bx0 = Math.max(0, Math.floor(x0));
  const by0 = Math.max(0, Math.floor(y0));
  const bx1 = Math.min(W, Math.ceil(x1));
  const by1 = Math.min(H, Math.ceil(y1));
  if (bx1 <= bx0 || by1 <= by0) {
    return undefined;
  }
  // a blank picture (capital cities have no highlight): an ellipse in the middle of its rectangle
  if (peak <= 0) {
    return ellipseMask([(x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * o.cityRadius, (y1 - y0) * o.cityRadius], true);
  }
  const threshold = part.threshold ?? Math.max(o.absThreshold, peak * o.relThreshold);
  const [w, h] = [bx1 - bx0, by1 - by0];
  const [sx, sy] = [tw / (x1 - x0), cropH / (y1 - y0)];
  const m = new Uint8Array(w * h);
  let n = 0;
  for (let y = 0; y < h; y++) {
    const v = Math.max(0, Math.min(rows - 1, (by0 + y + 0.5 - y0) * sy - 0.5));
    const iv = Math.floor(v);
    const fv = v - iv;
    const iv2 = Math.min(iv + 1, rows - 1);
    for (let x = 0; x < w; x++) {
      const raw = (bx0 + x + 0.5 - x0) * sx - 0.5;
      if (raw < -0.5 || raw > tw - 0.5) {
        continue;
      }
      const u = Math.max(0, Math.min(tw - 1, raw));
      const iu = Math.floor(u);
      const fu = u - iu;
      const iu2 = Math.min(iu + 1, tw - 1);
      const value =
        (lum[iv * tw + iu] * (1 - fu) + lum[iv * tw + iu2] * fu) * (1 - fv) +
        (lum[iv2 * tw + iu] * (1 - fu) + lum[iv2 * tw + iu2] * fu) * fv;
      if (value >= threshold) {
        m[y * w + x] = 1;
        n++;
      }
    }
  }
  if (!n) {
    return undefined;
  }
  const mask: Mask = { x: bx0, y: by0, w, h, n, m, synthetic: false };
  return part.outline ? fillOutline(mask) : mask;
}

/** An outline's inside: what can't be reached from outside without crossing it (thickened, so small breaks close). */
function fillOutline(mask: Mask, r = 2): Mask {
  const pad = r + 1;
  const [w, h] = [mask.w + 2 * pad, mask.h + 2 * pad];
  const wall = new Uint8Array(w * h);
  for (let y = 0; y < mask.h; y++) {
    for (let x = 0; x < mask.w; x++) {
      if (mask.m[y * mask.w + x]) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              wall[(y + pad + dy) * w + x + pad + dx] = 1;
            }
          }
        }
      }
    }
  }
  const outside = new Uint8Array(w * h);
  outside[0] = 1;
  const queue = [0];
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q];
    const px = p % w;
    for (const next of [px > 0 ? p - 1 : -1, px < w - 1 ? p + 1 : -1, p - w, p + w]) {
      if (next >= 0 && next < w * h && !outside[next] && !wall[next]) {
        outside[next] = 1;
        queue.push(next);
      }
    }
  }
  // back, clipped to the map
  const [ox, oy] = [mask.x - pad, mask.y - pad];
  const [cx0, cy0] = [Math.max(0, ox), Math.max(0, oy)];
  const [cw, ch] = [Math.min(W, ox + w) - cx0, Math.min(H, oy + h) - cy0];
  const m = new Uint8Array(cw * ch);
  let n = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (!outside[(y + cy0 - oy) * w + x + cx0 - ox]) {
        m[y * cw + x] = 1;
        n++;
      }
    }
  }
  return { x: cx0, y: cy0, w: cw, h: ch, n, m, synthetic: mask.synthetic };
}

function unionMasks(parts: Mask[]): Mask {
  const x0 = Math.min(...parts.map((p) => p.x));
  const y0 = Math.min(...parts.map((p) => p.y));
  const w = Math.max(...parts.map((p) => p.x + p.w)) - x0;
  const h = Math.max(...parts.map((p) => p.y + p.h)) - y0;
  const m = new Uint8Array(w * h);
  let n = 0;
  for (const p of parts) {
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const i = (y + p.y - y0) * w + x + p.x - x0;
        if (p.m[y * p.w + x] && !m[i]) {
          m[i] = 1;
          n++;
        }
      }
    }
  }
  return { x: x0, y: y0, w, h, n, m, synthetic: false };
}

function ellipseMask([cx, cy, rawRx, rawRy]: [number, number, number, number], synthetic: boolean): Mask | undefined {
  const [rx, ry] = [Math.max(2.5, rawRx), Math.max(2.5, rawRy)];
  const bx0 = Math.max(0, Math.floor(cx - rx));
  const by0 = Math.max(0, Math.floor(cy - ry));
  const w = Math.min(W, Math.ceil(cx + rx)) - bx0;
  const h = Math.min(H, Math.ceil(cy + ry)) - by0;
  if (w <= 0 || h <= 0) {
    return undefined;
  }
  const m = new Uint8Array(w * h);
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [dx, dy] = [(bx0 + x + 0.5 - cx) / rx, (by0 + y + 0.5 - cy) / ry];
      if (dx * dx + dy * dy <= 1) {
        m[y * w + x] = 1;
        n++;
      }
    }
  }
  return n ? { x: bx0, y: by0, w, h, n, m, synthetic } : undefined;
}

const INF = 1 << 30;

/** 3-4 chamfer distance of each pixel from the mask's edge (outside the mask or its box counts as edge). */
function chamfer(mask: Mask): Int32Array {
  const { w, h, m } = mask;
  const d = new Int32Array(w * h);
  for (let i = 0; i < d.length; i++) {
    d[i] = m[i] ? INF : 0;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i]) {
        d[i] = Math.min(
          d[i],
          x > 0 ? d[i - 1] + 3 : 3,
          y > 0 ? d[i - w] + 3 : 3,
          x > 0 && y > 0 ? d[i - w - 1] + 4 : 4,
          x < w - 1 && y > 0 ? d[i - w + 1] + 4 : 4,
        );
      }
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (d[i]) {
        d[i] = Math.min(
          d[i],
          x < w - 1 ? d[i + 1] + 3 : 3,
          y < h - 1 ? d[i + w] + 3 : 3,
          x < w - 1 && y < h - 1 ? d[i + w + 1] + 4 : 4,
          x > 0 && y < h - 1 ? d[i + w - 1] + 4 : 4,
        );
      }
    }
  }
  return d;
}

/** Regions that (mostly) lie inside a single, much bigger one: a city in its zone. */
function findNested(masks: Map<number, Mask>, o: TraceOptions): Set<number> {
  const nested = new Set<number>();
  for (const [a, ma] of masks) {
    for (const [b, mb] of masks) {
      if (a === b || ma.n > mb.n * o.nestedRatio) {
        continue;
      }
      const [ox0, oy0] = [Math.max(ma.x, mb.x), Math.max(ma.y, mb.y)];
      const [ox1, oy1] = [Math.min(ma.x + ma.w, mb.x + mb.w), Math.min(ma.y + ma.h, mb.y + mb.h)];
      let cover = 0;
      for (let y = oy0; y < oy1; y++) {
        for (let x = ox0; x < ox1; x++) {
          if (ma.m[(y - ma.y) * ma.w + x - ma.x] && mb.m[(y - mb.y) * mb.w + x - mb.x]) {
            cover++;
          }
        }
      }
      if (cover >= ma.n * o.nestedCover) {
        nested.add(a);
        break;
      }
    }
  }
  return nested;
}

function unionBox(masks: Mask[], pad: number): Box {
  const x0 = Math.min(...masks.map((m) => m.x));
  const y0 = Math.min(...masks.map((m) => m.y));
  const x1 = Math.max(...masks.map((m) => m.x + m.w));
  const y1 = Math.max(...masks.map((m) => m.y + m.h));
  return [Math.max(0, x0 - pad), Math.max(0, y0 - pad), Math.min(W, x1 + pad), Math.min(H, y1 + pad)];
}

/** 3-4 chamfer distance within a box to the nearest seed (box indexes). */
function boxDistance(isSeed: (boxIndex: number) => boolean, w: number, h: number): Int32Array {
  const d = new Int32Array(w * h);
  for (let i = 0; i < d.length; i++) {
    d[i] = isSeed(i) ? 0 : INF;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i]) {
        let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + 3);
        if (y > 0) v = Math.min(v, d[i - w] + 3);
        if (x > 0 && y > 0) v = Math.min(v, d[i - w - 1] + 4);
        if (x < w - 1 && y > 0) v = Math.min(v, d[i - w + 1] + 4);
        d[i] = v;
      }
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (d[i]) {
        let v = d[i];
        if (x < w - 1) v = Math.min(v, d[i + 1] + 3);
        if (y < h - 1) v = Math.min(v, d[i + w] + 3);
        if (x < w - 1 && y < h - 1) v = Math.min(v, d[i + w + 1] + 4);
        if (x > 0 && y < h - 1) v = Math.min(v, d[i + w - 1] + 4);
        d[i] = v;
      }
    }
  }
  return d;
}

/**
 * Closes the union of all regions (dilate, then erode): pixels that become covered go to the nearest region, so narrow
 * gaps between regions close while coasts stay where they are.
 */
function closeGaps(label: Int32Array, [x0, y0, x1, y1]: Box, gapClose: number): void {
  const [w, h] = [x1 - x0, y1 - y0];
  const r = gapClose * 3;
  const at = (bi: number) => (y0 + Math.floor(bi / w)) * W + x0 + (bi % w);
  const toZone = boxDistance((bi) => label[at(bi)] >= 0, w, h);
  const toOut = boxDistance((bi) => toZone[bi] > r, w, h);
  // candidates: not in a region, but within reach of one and not of the outside
  const candidate = new Uint8Array(w * h);
  const queue: number[] = [];
  for (let bi = 0; bi < w * h; bi++) {
    if (toZone[bi] !== 0 && toOut[bi] > r) {
      candidate[bi] = 1;
    }
    if (label[at(bi)] >= 0) {
      queue.push(bi);
    }
  }
  // grown from every region at once
  for (let q = 0; q < queue.length; q++) {
    const bi = queue[q];
    const bx = bi % w;
    const l = label[at(bi)];
    for (const n of [bx > 0 ? bi - 1 : -1, bx < w - 1 ? bi + 1 : -1, bi - w, bi + w]) {
      if (n >= 0 && n < w * h && candidate[n]) {
        candidate[n] = 0;
        label[at(n)] = l;
        queue.push(n);
      }
    }
  }
}

/** Unlabelled pieces enclosed by a single region (lakes, gaps in a glow) belong to it. */
function fillHoles(label: Int32Array, [x0, y0, x1, y1]: Box): void {
  const seen = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * W + x;
      if (label[i] >= 0 || seen[i]) {
        continue;
      }
      const queue = [i];
      seen[i] = 1;
      const owners = new Set<number>();
      let open = false;
      for (let q = 0; q < queue.length; q++) {
        const p = queue[q];
        const [px, py] = [p % W, Math.floor(p / W)];
        if (px <= x0 || px >= x1 - 1 || py <= y0 || py >= y1 - 1) {
          open = true;
        }
        for (const n of [px > x0 ? p - 1 : -1, px < x1 - 1 ? p + 1 : -1, py > y0 ? p - W : -1, py < y1 - 1 ? p + W : -1]) {
          if (n < 0) {
            continue;
          }
          if (label[n] >= 0) {
            owners.add(label[n]);
          } else if (!seen[n]) {
            seen[n] = 1;
            queue.push(n);
          }
        }
      }
      if (!open && owners.size === 1) {
        const [owner] = owners;
        queue.forEach((p) => (label[p] = owner));
      }
    }
  }
}

/** 3 × 3 majority vote: a pixel takes the label held by at least 5 of its 9 cells. */
function majority(label: Int32Array, [x0, y0, x1, y1]: Box): Int32Array {
  const out = label.slice();
  const cells = new Int32Array(9);
  for (let y = Math.max(1, y0); y < Math.min(H - 1, y1); y++) {
    for (let x = Math.max(1, x0); x < Math.min(W - 1, x1); x++) {
      const i = y * W + x;
      const c = label[i];
      let k = 0;
      let uniform = true;
      for (let dy = -W; dy <= W; dy += W) {
        for (let dx = -1; dx <= 1; dx++) {
          const l = label[i + dy + dx];
          cells[k++] = l;
          uniform &&= l === c;
        }
      }
      if (uniform) {
        continue;
      }
      for (let a = 0; a < 9; a++) {
        let count = 0;
        for (let b = 0; b < 9; b++) {
          if (cells[b] === cells[a]) {
            count++;
          }
        }
        if (count >= 5) {
          out[i] = cells[a];
          break;
        }
      }
    }
  }
  return out;
}

/** Drops connected pieces of a label smaller than `minSpeck` pixels. */
function removeSpecks(label: Int32Array, [x0, y0, x1, y1]: Box, minSpeck: number): void {
  const seen = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * W + x;
      if (label[i] < 0 || seen[i]) {
        continue;
      }
      const l = label[i];
      const stack = [i];
      const piece: number[] = [];
      seen[i] = 1;
      while (stack.length) {
        const p = stack.pop() as number;
        piece.push(p);
        const px = p % W;
        for (const q of [px > 0 ? p - 1 : -1, px < W - 1 ? p + 1 : -1, p - W, p + W]) {
          if (q >= 0 && q < W * H && !seen[q] && label[q] === l) {
            seen[q] = 1;
            stack.push(q);
          }
        }
      }
      if (piece.length < minSpeck) {
        piece.forEach((p) => (label[p] = -1));
      }
    }
  }
}

/** Follows the pixel edges of every label into rings (its inside on the right), in pixel corners. */
function traceRings(label: Int32Array, [x0, y0, x1, y1]: Box): Map<number, [number, number][][]> {
  const VW = W + 1;
  const edges = new Map<number, Map<number, number[]>>();
  const add = (l: number, from: number, to: number) => {
    let out = edges.get(l);
    if (!out) {
      out = new Map();
      edges.set(l, out);
    }
    const ends = out.get(from);
    if (ends) {
      ends.push(to);
    } else {
      out.set(from, [to]);
    }
  };
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : label[y * W + x]);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const l = label[y * W + x];
      if (l < 0) {
        continue;
      }
      if (at(x, y - 1) !== l) add(l, y * VW + x, y * VW + x + 1);
      if (at(x + 1, y) !== l) add(l, y * VW + x + 1, (y + 1) * VW + x + 1);
      if (at(x, y + 1) !== l) add(l, (y + 1) * VW + x + 1, (y + 1) * VW + x);
      if (at(x - 1, y) !== l) add(l, (y + 1) * VW + x, y * VW + x);
    }
  }
  const rings = new Map<number, [number, number][][]>();
  edges.forEach((out, l) => {
    const list: [number, number][][] = [];
    for (const [start, starts] of out) {
      while (starts.length) {
        const ring: [number, number][] = [];
        let cur = start;
        let next = starts.pop() as number;
        let [dx, dy] = [(next % VW) - (cur % VW), Math.floor(next / VW) - Math.floor(cur / VW)];
        for (;;) {
          ring.push([cur % VW, Math.floor(cur / VW)]);
          cur = next;
          if (cur === start) {
            break;
          }
          // (a closed boundary goes on from every corner it reaches)
          const cands = out.get(cur) as number[];
          // where two pixels meet at a corner (going out both ways), turn right, so they stay apart
          const [rx, ry] = [-dy, dx];
          const pick = Math.max(
            0,
            cands.findIndex((c) => (c % VW) - (cur % VW) === rx && Math.floor(c / VW) - Math.floor(cur / VW) === ry),
          );
          next = cands.splice(pick, 1)[0];
          [dx, dy] = [(next % VW) - (cur % VW), Math.floor(next / VW) - Math.floor(cur / VW)];
        }
        list.push(ring);
      }
    }
    rings.set(l, list);
  });
  return rings;
}

function dropCollinear(ring: [number, number][]): [number, number][] {
  const n = ring.length;
  return ring.filter(([bx, by], i) => {
    const [ax, ay] = ring[(i - 1 + n) % n];
    const [cx, cy] = ring[(i + 1) % n];
    return (bx - ax) * (cy - by) - (by - ay) * (cx - bx) !== 0;
  });
}

/** Douglas–Peucker on a closed ring, split at its two most distant points. */
function douglasPeucker(ring: [number, number][], eps: number): [number, number][] {
  // (a traced ring turns at least 4 times)
  const n = ring.length;
  let [far, farthest] = [0, -1];
  for (let i = 1; i < n; i++) {
    const d = (ring[i][0] - ring[0][0]) ** 2 + (ring[i][1] - ring[0][1]) ** 2;
    if (d > farthest) {
      [far, farthest] = [i, d];
    }
  }
  const a = dpLine(ring.slice(0, far + 1), eps);
  const b = dpLine([...ring.slice(far), ring[0]], eps);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

function dpLine(points: [number, number][], eps: number): [number, number][] {
  const n = points.length;
  if (n < 3) {
    return points;
  }
  const [ax, ay] = points[0];
  const [bx, by] = points[n - 1];
  const [dx, dy] = [bx - ax, by - ay];
  const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1e-9);
  let [index, max] = [0, -1];
  for (let i = 1; i < n - 1; i++) {
    const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / length;
    if (d > max) {
      [index, max] = [i, d];
    }
  }
  if (max <= eps) {
    return [points[0], points[n - 1]];
  }
  return [...dpLine(points.slice(0, index + 1), eps).slice(0, -1), ...dpLine(points.slice(index), eps)];
}

function chaikinRing(ring: [number, number][]): [number, number][] {
  return ring.flatMap(([ax, ay], i) => {
    const [bx, by] = ring[(i + 1) % ring.length];
    return [
      [0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by],
      [0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by],
    ] as [number, number][];
  });
}

function ringArea(ring: [number, number][]): number {
  let a = 0;
  ring.forEach(([x0, y0], i) => {
    const [x1, y1] = ring[(i + 1) % ring.length];
    a += x0 * y1 - x1 * y0;
  });
  return a / 2;
}

// ------------------------------------------------------------------ using the rings

/** Whether a point is inside rings (even-odd, so holes count). */
export function pointInRings(x: number, y: number, rings: Ring[]): boolean {
  let inside = false;
  for (const p of rings) {
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      if (p[i + 1] > y !== p[j + 1] > y && x < ((p[j] - p[i]) * (y - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) {
        inside = !inside;
      }
    }
  }
  return inside;
}

/** The box around rings: [x0, y0, x1, y1]. */
export function ringsBox(rings: Ring[]): [number, number, number, number] {
  const box: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const p of rings) {
    for (let i = 0; i < p.length; i += 2) {
      box[0] = Math.min(box[0], p[i]);
      box[1] = Math.min(box[1], p[i + 1]);
      box[2] = Math.max(box[2], p[i]);
      box[3] = Math.max(box[3], p[i + 1]);
    }
  }
  return box;
}

/** Rings as SVG path data (holes are rings of their own: draw with `fill-rule="evenodd"`). */
export function ringsPath(rings: Ring[]): string {
  return rings
    .map((p) => {
      const points: string[] = [];
      for (let i = 0; i < p.length; i += 2) {
        points.push(`${p[i]} ${p[i + 1]}`);
      }
      return `M${points.join('L')}Z`;
    })
    .join('');
}

/** Rings' area (holes subtracted when wound the other way). */
export function ringsArea(rings: Ring[]): number {
  return Math.abs(
    rings.reduce((sum, p) => {
      let a = 0;
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        a += p[j] * p[i + 1] - p[i] * p[j + 1];
      }
      return sum + a / 2;
    }, 0),
  );
}

/** A point inside the biggest ring, near its middle (where to name it). */
export function labelPoint(rings: Ring[]): [number, number] {
  const big = rings.reduce((a, b) => (b.length > a.length ? b : a), rings[0]);
  const n = big.length / 2;
  let [x, y] = [0, 0];
  for (let i = 0; i < big.length; i += 2) {
    x += big[i];
    y += big[i + 1];
  }
  [x, y] = [x / n, y / n];
  if (pointInRings(x, y, rings)) {
    return [round2(x), round2(y)];
  }
  // a concave one: the nearest corner, pulled a little towards the middle
  let best: [number, number] | undefined;
  let nearest = Infinity;
  for (let i = 0; i < big.length; i += 2) {
    const [px, py] = [big[i] + (x - big[i]) * 0.15, big[i + 1] + (y - big[i + 1]) * 0.15];
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d < nearest && pointInRings(px, py, rings)) {
      nearest = d;
      best = [round2(px), round2(py)];
    }
  }
  return best ?? [round2(x), round2(y)];
}

const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Whether two outlines come closer than `distance` (their corners). */
export function outlinesTouch(a: Ring[], b: Ring[], distance: number): boolean {
  const [ba, bb] = [ringsBox(a), ringsBox(b)];
  if (ba[2] + distance < bb[0] || bb[2] + distance < ba[0] || ba[3] + distance < bb[1] || bb[3] + distance < ba[1]) {
    return false;
  }
  const d2 = distance * distance;
  for (const p of a) {
    for (let i = 0; i < p.length; i += 2) {
      for (const q of b) {
        for (let j = 0; j < q.length; j += 2) {
          if ((p[i] - q[j]) ** 2 + (p[i + 1] - q[j + 1]) ** 2 < d2) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/** Fills rings (pixels of the 1002 × 668 map, even-odd) into a grid with `value`, except where `skip` is set. */
export function fillRings(grid: { [i: number]: number }, rings: Ring[], value: number, skip?: Uint8Array): void {
  const edges: [number, number, number, number][] = [];
  let [top, bottom] = [H, 0];
  for (const p of rings) {
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      if (p[i + 1] !== p[j + 1]) {
        edges.push([p[j], p[j + 1], p[i], p[i + 1]]);
        top = Math.min(top, p[i + 1]);
        bottom = Math.max(bottom, p[i + 1]);
      }
    }
  }
  for (let y = Math.max(0, Math.floor(top)); y < Math.min(H, Math.ceil(bottom)); y++) {
    const cy = y + 0.5;
    const xs: number[] = [];
    for (const [ax, ay, bx, by] of edges) {
      if (ay > cy !== by > cy) {
        xs.push(ax + ((cy - ay) * (bx - ax)) / (by - ay));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const [from, to] = [Math.max(0, Math.ceil(xs[k] - 0.5)), Math.min(W - 1, Math.floor(xs[k + 1] - 0.5))];
      for (let x = from; x <= to; x++) {
        if (!skip?.[y * W + x]) {
          grid[y * W + x] = value;
        }
      }
    }
  }
}

/** A neighbour needs this much of it on a zone's map (pixels of 1002 × 668) to be outlined there… */
export const NEIGHBOUR_MIN_PIXELS = 1200;
/** …each piece of it at least this much. */
const NEIGHBOUR_MIN_PIECE = 200;

/**
 * The parts of a zone's neighbours seen on the zone's map: their continent outlines brought into the zone's frame,
 * less the zone itself (its continent outline and its sub-zones), traced again. `frame` is the zone's rectangle on its
 * continent ([x0, y0, x1, y1] in percent of the continent); outlines are in percent of the continent, sub-zones in
 * percent of the zone. The parts come out in percent of the zone, by neighbour.
 */
export function neighbourParts(
  frame: [number, number, number, number],
  own: Ring[],
  subs: Ring[][],
  others: Map<string, Ring[]>,
  minPixels = NEIGHBOUR_MIN_PIXELS,
): Map<string, Ring[]> {
  const [sx, sy] = [W / (frame[2] - frame[0]), H / (frame[3] - frame[1])];
  const fromContinent = (rings: Ring[]) => rings.map((p) => p.map((v, i) => (i % 2 ? (v - frame[1]) * sy : (v - frame[0]) * sx)));
  const fromZone = (rings: Ring[]) => rings.map((p) => p.map((v, i) => (v * (i % 2 ? H : W)) / 100));
  const mask = new Uint8Array(W * H);
  fillRings(mask, fromContinent(own), 1);
  subs.forEach((rings) => fillRings(mask, fromZone(rings), 1));
  const label = new Int32Array(W * H).fill(-1);
  const ids = [...others.keys()];
  ids.forEach((id, index) => {
    const rings = others.get(id) as Ring[];
    const box = ringsBox(rings);
    if (box[2] >= frame[0] && box[0] <= frame[2] && box[3] >= frame[1] && box[1] <= frame[3]) {
      fillRings(label, fromContinent(rings), index, mask);
    }
  });
  // too little of a neighbour (all its pieces together) on the map: none of it
  const counts = new Int32Array(ids.length);
  for (const l of label) {
    if (l >= 0) {
      counts[l]++;
    }
  }
  for (let i = 0; i < label.length; i++) {
    if (label[i] >= 0 && counts[label[i]] < minPixels) {
      label[i] = -1;
    }
  }
  const parts = new Map<string, Ring[]>();
  vectorizeLabels(label, NEIGHBOUR_MIN_PIECE, { smoothPasses: 1 }).forEach((rings, index) => parts.set(ids[index], rings.map(toPercent)));
  return parts;
}

/**
 * Where the button of a neighbour with nothing on the zone's map goes: at the map's edge towards it (percent of the
 * zone's map), and that edge ('n', 'e', 's', 'w'). `at` is the neighbour's label point, in percent of the continent.
 */
export function edgeButton(frame: [number, number, number, number], at: [number, number]): { x: number; y: number; side: string } {
  const dx = ((at[0] - frame[0]) / (frame[2] - frame[0])) * 100 - 50;
  const dy = ((at[1] - frame[1]) / (frame[3] - frame[1])) * 100 - 50;
  const k = Math.min(44 / Math.max(Math.abs(dx), 1e-6), 42 / Math.max(Math.abs(dy), 1e-6));
  const side = Math.abs(dx) * 42 > Math.abs(dy) * 44 ? (dx > 0 ? 'e' : 'w') : dy > 0 ? 's' : 'n';
  return { x: Math.round((50 + dx * k) * 10) / 10, y: Math.round((50 + dy * k) * 10) / 10, side };
}
