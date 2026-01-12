import type { Entity, World } from "koota";
import * as THREE from "three/webgpu";
import { Position } from "../traits/position";
import { Selectable } from "../traits/selectable";

export interface SelectionSystemInputs {
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;
}

/**
 * System that handles click-based selection of entities
 */
export function createSelectionSystem(world: World) {
  let mouseX = 0;
  let mouseY = 0;
  let clickRequested = false;
  let currentlySelected: Entity | null = null;

  // Reusable objects to avoid allocations
  const raycaster = new THREE.Raycaster();
  const mouseVector = new THREE.Vector2();
  const entityPos = new THREE.Vector3();

  // Setup click listener
  const setupClickListener = (canvas: HTMLCanvasElement) => {
    const handleClick = (event: MouseEvent) => {
      event.preventDefault(); // Prevent context menu on right click
      const rect = canvas.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      clickRequested = true;
    };

    canvas.addEventListener("contextmenu", handleClick);

    return () => {
      canvas.removeEventListener("contextmenu", handleClick);
    };
  };

  // System function that runs each frame
  const system = (inputs: SelectionSystemInputs) => {
    if (!clickRequested) return;

    clickRequested = false;

    // Setup raycaster with reused vector
    mouseVector.set(mouseX, mouseY);
    raycaster.setFromCamera(mouseVector, inputs.camera);

    const selectableEntities = world.query(Position, Selectable);

    // Find the closest selectable entity in one pass
    let closestEntity: Entity | null = null;
    let closestDistance = Infinity;

    for (const entity of selectableEntities) {
      const position = entity.get(Position);
      const selectable = entity.get(Selectable);

      if (!position || !selectable) continue;

      // Reuse entityPos vector
      entityPos.set(position.x, position.y, position.z);
      const distance = raycaster.ray.distanceToPoint(entityPos);

      if (distance < selectable.radius && distance < closestDistance) {
        closestEntity = entity;
        closestDistance = distance;
        console.log(`🎯 Potential entity found! ID: ${entity.id()}, Distance: ${distance.toFixed(3)}`);
      }
    }

    // Only deselect if needed
    if (currentlySelected && currentlySelected !== closestEntity) {
      const selectable = currentlySelected.get(Selectable);

      if (selectable) {
        currentlySelected.set(Selectable, { ...selectable, isSelected: false });
        console.log("❌ Deselected entity:", currentlySelected.id());
      }
    }

    // Select new entity
    if (closestEntity) {
      const selectable = closestEntity.get(Selectable);
      const position = closestEntity.get(Position);

      if (selectable && position) {
        closestEntity.set(Selectable, { ...selectable, isSelected: true });
        currentlySelected = closestEntity;

        console.log("✅ Entity selected!", {
          entityId: closestEntity.id(),
          position: { x: position.x.toFixed(1), y: position.y.toFixed(1), z: position.z.toFixed(1) },
          distance: closestDistance.toFixed(3),
        });
      }
    } else {
      currentlySelected = null;
    }
  };

  return { system, setupClickListener };
}
