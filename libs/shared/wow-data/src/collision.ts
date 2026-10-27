import { findChunk } from './liquid';
import { toSceneAxes } from './wmo';

/**
 * Triangles the server collides with (what its vmaps are extracted from), in the model's local scene axes:
 * line of sight, falling and walking into walls all use these, not the drawn geometry.
 */
export interface CollisionMesh {
  positions: Float32Array;
  indices: Uint16Array;
}

export const EMPTY_COLLISION: CollisionMesh = { positions: new Float32Array(0), indices: new Uint16Array(0) };

/** WotLK M2 header: collision triangle indices (uint16) and vertices (C3Vector), as count + offset pairs. */
const M2_COLLISION_INDICES = 0xd8;
const M2_COLLISION_VERTICES = 0xe0;

/** The collision mesh of an M2 model (its "bounding triangles"); empty when it has none or the file is too short. */
export function parseM2Collision(bytes: Uint8Array): CollisionMesh {
  if (bytes.length < M2_COLLISION_VERTICES + 8) {
    return EMPTY_COLLISION;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const [indexCount, indexOffset] = [view.getUint32(M2_COLLISION_INDICES, true), view.getUint32(M2_COLLISION_INDICES + 4, true)];
  const [vertexCount, vertexOffset] = [view.getUint32(M2_COLLISION_VERTICES, true), view.getUint32(M2_COLLISION_VERTICES + 4, true)];
  if (
    indexCount === 0 ||
    vertexCount === 0 ||
    indexOffset + indexCount * 2 > bytes.length ||
    vertexOffset + vertexCount * 12 > bytes.length
  ) {
    return EMPTY_COLLISION;
  }
  const vertices = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertices.length; i++) {
    vertices[i] = view.getFloat32(vertexOffset + i * 4, true);
  }
  const indices = new Uint16Array(indexCount - (indexCount % 3));
  for (let i = 0; i < indices.length; i++) {
    indices[i] = view.getUint16(indexOffset + i * 2, true);
  }
  return { positions: toSceneAxes(vertices), indices };
}

/** MOGP's own header, before its sub-chunks. */
const MOGP_HEADER_SIZE = 0x44;
const MATERIAL_DETAIL = 0x04;
const MATERIAL_COLLISION = 0x08;
const MATERIAL_RENDER = 0x20;

/**
 * The collision triangles of a WMO group, picked from its MOPY flags like the server's vmap extractor does: those
 * flagged for collision, and those drawn that aren't detail; invisible collision-only walls included.
 */
export function parseWmoGroupCollision(bytes: Uint8Array): CollisionMesh {
  const group = findChunk(bytes, 'MOGP');
  if (!group) {
    return EMPTY_COLLISION;
  }
  const end = Math.min(bytes.length, group.offset + group.size);
  const body = bytes.subarray(group.offset + MOGP_HEADER_SIZE, end);
  const mopy = findChunk(body, 'MOPY');
  const movi = findChunk(body, 'MOVI');
  const movt = findChunk(body, 'MOVT');
  if (!mopy || !movi || !movt) {
    return EMPTY_COLLISION;
  }
  const view = new DataView(body.buffer, body.byteOffset, body.byteLength);
  const triangles = Math.min(Math.floor(mopy.size / 2), Math.floor(movi.size / 6));
  const indices: number[] = [];
  for (let t = 0; t < triangles; t++) {
    const flags = body[mopy.offset + t * 2];
    const render = (flags & MATERIAL_RENDER) !== 0 && (flags & MATERIAL_DETAIL) === 0;
    if ((flags & MATERIAL_COLLISION) !== 0 || render) {
      for (let k = 0; k < 3; k++) {
        indices.push(view.getUint16(movi.offset + (t * 3 + k) * 2, true));
      }
    }
  }
  if (indices.length === 0) {
    return EMPTY_COLLISION;
  }
  const vertices = new Float32Array(Math.floor(movt.size / 4));
  for (let i = 0; i < vertices.length; i++) {
    vertices[i] = view.getFloat32(movt.offset + i * 4, true);
  }
  return { positions: toSceneAxes(vertices), indices: Uint16Array.from(indices) };
}
