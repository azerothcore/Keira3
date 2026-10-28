import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CompressedTexture,
  DataTexture,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  RGBAFormat,
  Texture,
} from 'three';
import { formatBytes, geometryBytes, sceneGpuBytes, textureBytes } from './memory-budget';

describe('memory budget', () => {
  it('tells what textures take: compressed levels, or 4 bytes a pixel with a third more for mipmaps', () => {
    const compressed = new CompressedTexture([{ data: new Uint8Array(100), width: 4, height: 4 }] as never, 4, 4, RGBAFormat);
    expect(textureBytes(compressed)).toBe(100);
    const plain = new DataTexture(new Uint8Array(16 * 16 * 4), 16, 16);
    plain.generateMipmaps = false;
    expect(textureBytes(plain)).toBe(1024);
    plain.generateMipmaps = true;
    expect(textureBytes(plain)).toBe(1365);
    expect(textureBytes(new Texture())).toBe(0);
  });

  it('counts shared geometries once, with their index and instances', () => {
    const box = new BoxGeometry();
    const material = new MeshBasicMaterial({ map: new DataTexture(new Uint8Array(4), 1, 1) });
    const scene = new Group().add(new Mesh(box, material), new Mesh(box, material), new InstancedMesh(new BoxGeometry(), material, 2));
    const one = Object.values(box.attributes).reduce((total, a) => total + a.array.byteLength, 0) + (box.index?.array.byteLength ?? 0);
    expect(geometryBytes(scene)).toBe(one * 2 + 2 * 16 * 4);
    expect(sceneGpuBytes(scene)).toBe(geometryBytes(scene) + textureBytes(material.map as DataTexture));
    expect(geometryBytes(new Group().add(new Group()))).toBe(0);
    // a geometry without an index
    const loose = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(9), 3));
    expect(geometryBytes(new Mesh(loose))).toBe(36);
  });

  it('writes sizes in MB or GB', () => {
    expect(formatBytes(900_000_000)).toBe('900 MB');
    expect(formatBytes(1_500_000_000)).toBe('1.5 GB');
  });
});
