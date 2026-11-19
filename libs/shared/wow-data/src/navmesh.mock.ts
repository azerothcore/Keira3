/**
 * Builds a small .mmtile: AzerothCore's header, a Detour header, `polys` polygons (each a triangle of the polygon's own
 * vertices plus one of a detail vertex), with the given flags; the first `offMesh` polygons are off-mesh connections.
 */
export function buildMmtile(polys: { flags: number; offMesh?: boolean }[]): Uint8Array {
  const vertCount = 3;
  const detailVertCount = 1;
  const detailTriCount = polys.length * 2;
  const maxLinkCount = 1;
  const size = 100 + vertCount * 12 + polys.length * 32 + maxLinkCount * 16 + polys.length * 12 + detailVertCount * 12 + detailTriCount * 4;
  const bytes = new Uint8Array(56 + size);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x4d4d4150, true);
  // recast config: slope 60, radius 2, height 6, climb 6, 2000 / 80 vertices, cell sizes 0.2667, error 1.8
  view.setFloat32(20, 60, true);
  bytes.set([2, 6, 6], 24);
  view.setUint32(28, 2000, true);
  view.setUint32(32, 80, true);
  view.setFloat32(44, 0.2667, true);
  view.setFloat32(48, 0.2667, true);
  view.setFloat32(52, 1.8, true);
  view.setUint32(12, size, true);
  const h = 56;
  view.setUint32(h, 0x444e4156, true);
  [polys.length, vertCount, maxLinkCount, polys.length, detailVertCount, detailTriCount].forEach((value, i) =>
    view.setInt32(h + 24 + i * 4, value, true),
  );
  const verts = h + 100;
  // recast (server y, z, server x)
  [
    [1, 10, 2],
    [3, 10, 4],
    [5, 10, 6],
  ].forEach((v, i) => v.forEach((value, k) => view.setFloat32(verts + i * 12 + k * 4, value, true)));
  const polysAt = verts + vertCount * 12;
  polys.forEach((poly, p) => {
    const at = polysAt + p * 32;
    [0, 1, 2].forEach((v, k) => view.setUint16(at + 4 + k * 2, v, true));
    view.setUint16(at + 28, poly.flags, true);
    bytes[at + 30] = 3;
    bytes[at + 31] = poly.offMesh ? 1 << 6 : 0;
  });
  const details = polysAt + polys.length * 32 + maxLinkCount * 16;
  polys.forEach((_, p) => {
    view.setUint32(details + p * 12, 0, true);
    view.setUint32(details + p * 12 + 4, p * 2, true);
    bytes[details + p * 12 + 9] = 2;
  });
  const detailVerts = details + polys.length * 12;
  [7, 20, 8].forEach((value, k) => view.setFloat32(detailVerts + k * 4, value, true));
  const tris = detailVerts + detailVertCount * 12;
  polys.forEach((_, p) => {
    bytes.set([0, 1, 2, 0], tris + p * 8);
    bytes.set([0, 2, 3, 0], tris + p * 8 + 4);
  });
  return bytes;
}
