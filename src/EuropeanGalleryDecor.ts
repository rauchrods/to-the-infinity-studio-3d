import * as THREE from 'three';

/**
 * Creates classical European art gallery wall architecture:
 * - Neoclassical pilasters integrated flush with the wall so they NEVER block artwork frames
 * - Elegant wall boisserie moldings (chair rail & crown cornices)
 * - Clean, spacious center aisle with all floor obstacles removed
 */
export class EuropeanGalleryDecor {
  private goldBronzeMat: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene, hallLength: number, hallWidth: number, hallHeight: number) {
    this.goldBronzeMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.85,
    });

    this.buildWallMoldingPanels(scene, hallLength, hallWidth, hallHeight);
    this.buildWallPilasters(scene, hallLength, hallWidth, hallHeight);
  }

  /**
   * Classical French Boisserie / Wainscoting wall frames along perimeter
   */
  private buildWallMoldingPanels(
    scene: THREE.Scene,
    hallLength: number,
    hallWidth: number,
    hallHeight: number
  ) {
    const moldingMat = new THREE.MeshStandardMaterial({
      color: 0xf9f9f8,
      roughness: 0.85,
    });

    // Lower chair-rail molding trim along both walls (height: 0.95m)
    const chairRailGeo = new THREE.BoxGeometry(0.03, 0.05, hallLength);
    const leftChairRail = new THREE.Mesh(chairRailGeo, moldingMat);
    leftChairRail.position.set(-hallWidth / 2 + 0.015, 0.95, hallLength / 2 - 2);
    scene.add(leftChairRail);

    const rightChairRail = new THREE.Mesh(chairRailGeo, moldingMat);
    rightChairRail.position.set(hallWidth / 2 - 0.015, 0.95, hallLength / 2 - 2);
    scene.add(rightChairRail);

    // Crown molding cornice along top ceiling junctions
    const crownGeo = new THREE.BoxGeometry(0.08, 0.1, hallLength);
    const leftCrown = new THREE.Mesh(crownGeo, moldingMat);
    leftCrown.position.set(-hallWidth / 2 + 0.04, hallHeight - 0.05, hallLength / 2 - 2);
    scene.add(leftCrown);

    const rightCrown = new THREE.Mesh(crownGeo, moldingMat);
    rightCrown.position.set(hallWidth / 2 - 0.04, hallHeight - 0.05, hallLength / 2 - 2);
    scene.add(rightCrown);
  }

  /**
   * Flat Neoclassical Wall Pilasters (embedded into the wall flush, so they NEVER block artworks)
   */
  private buildWallPilasters(
    scene: THREE.Scene,
    hallLength: number,
    hallWidth: number,
    hallHeight: number
  ) {
    const pilasterMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.3,
    });

    for (let z = 7.4; z < hallLength - 4; z += 4.8) {
      const pilasterGeo = new THREE.BoxGeometry(0.04, hallHeight, 0.45);

      // Left Wall Pilaster
      const leftP = new THREE.Mesh(pilasterGeo, pilasterMat);
      leftP.position.set(-hallWidth / 2 + 0.02, hallHeight / 2, z);
      scene.add(leftP);

      // Gold capital ring
      const goldTrimGeo = new THREE.BoxGeometry(0.05, 0.06, 0.49);
      const leftGold = new THREE.Mesh(goldTrimGeo, this.goldBronzeMat);
      leftGold.position.set(-hallWidth / 2 + 0.025, hallHeight - 0.2, z);
      scene.add(leftGold);

      // Right Wall Pilaster
      const rightP = new THREE.Mesh(pilasterGeo, pilasterMat);
      rightP.position.set(hallWidth / 2 - 0.02, hallHeight / 2, z);
      scene.add(rightP);

      const rightGold = new THREE.Mesh(goldTrimGeo, this.goldBronzeMat);
      rightGold.position.set(hallWidth / 2 - 0.025, hallHeight - 0.2, z);
      scene.add(rightGold);
    }
  }
}
