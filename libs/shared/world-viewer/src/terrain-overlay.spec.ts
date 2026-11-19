import { BufferGeometry, Raycaster, ShaderMaterial } from 'three';
import {
  createTerrainOverlayMaterial,
  createTerrainWireframeMaterial,
  setTerrainOverlay,
  TERRAIN_OVERLAY_LAYER,
  TERRAIN_WIREFRAME_LAYER,
  terrainOverlayMeshes,
  WALKABLE_SLOPE,
  CONTOUR_STEP,
} from './terrain-overlay';

describe('terrain overlays', () => {
  it('shows the grid and the steep slopes as asked, with shared materials', () => {
    const material = createTerrainOverlayMaterial();
    expect(material.userData['shared']).toBe(true);
    expect(material.uniforms['slopeCos'].value).toBeCloseTo(Math.cos((WALKABLE_SLOPE * Math.PI) / 180));
    setTerrainOverlay(material, { grid: true, slopes: false });
    expect([material.uniforms['showGrid'].value, material.uniforms['showSlopes'].value]).toEqual([1, 0]);
    setTerrainOverlay(material, { grid: false, slopes: true });
    expect([material.uniforms['showGrid'].value, material.uniforms['showSlopes'].value]).toEqual([0, 1]);
    expect(material.uniforms['showContours'].value).toBe(0);
    setTerrainOverlay(material, { grid: false, slopes: false, contours: true });
    expect(material.uniforms['showContours'].value).toBe(1);
    expect(material.uniforms['contourStep'].value).toBe(CONTOUR_STEP);
    const wireframe = createTerrainWireframeMaterial();
    expect(wireframe.wireframe).toBe(true);
    expect(wireframe.userData['shared']).toBe(true);
  });

  it('puts the overlay and the wireframe on their own layers, sharing the triangles, never picked', () => {
    const geometry = new BufferGeometry();
    const [overlay, wire] = terrainOverlayMeshes(geometry, new ShaderMaterial(), createTerrainWireframeMaterial());
    expect(overlay.geometry).toBe(geometry);
    expect(overlay.layers.isEnabled(TERRAIN_OVERLAY_LAYER)).toBe(true);
    expect(wire.layers.isEnabled(TERRAIN_WIREFRAME_LAYER)).toBe(true);
    expect(overlay.raycast(new Raycaster(), [])).toBeUndefined();
    expect(wire.raycast(new Raycaster(), [])).toBeUndefined();
  });
});
