import { Material, Object3D } from 'three';

/** A material as built (before being made see-through). */
interface Solid {
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}

/**
 * Makes a material `opacity` (0..1) times as solid as it was built (1: as built). See-through, it no longer hides
 * what's behind it from the depth test, so what's behind shows through. The material as built is kept to go back to.
 */
export function setMaterialOpacity(material: Material, opacity: number): void {
  const solid = (material.userData['solid'] ??= {
    opacity: material.opacity,
    transparent: material.transparent,
    depthWrite: material.depthWrite,
  }) as Solid;
  const seeThrough = opacity < 1;
  const transparent = solid.transparent || seeThrough;
  const depthWrite = seeThrough ? false : solid.depthWrite;
  if (material.transparent !== transparent) {
    // (switching to blending needs another shader)
    material.needsUpdate = true;
  }
  material.opacity = solid.opacity * opacity;
  material.transparent = transparent;
  material.depthWrite = depthWrite;
}

/** `setMaterialOpacity` for every material of an object and its children. */
export function setObjectOpacity(object: Object3D, opacity: number): void {
  object.traverse((child) => {
    const material = (child as Object3D & { material?: Material | Material[] }).material;
    for (const each of Array.isArray(material) ? material : material ? [material] : []) {
      setMaterialOpacity(each, opacity);
    }
  });
}
