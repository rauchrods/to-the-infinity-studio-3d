import * as THREE from 'three';
import { createMarbleTexture } from './galleryConfig';
import { EuropeanGalleryDecor } from './EuropeanGalleryDecor';
import type { WallArtworkPosition } from './types';

export class GalleryScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public clickableMeshes: THREE.Mesh[] = [];
  public meshToArtworkMap: Map<string, WallArtworkPosition> = new Map();

  // Animation & Transition states
  public isInspecting: boolean = false;
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();
  private targetLookAt: THREE.Vector3 = new THREE.Vector3();
  private startCameraPos: THREE.Vector3 = new THREE.Vector3();
  private inspectionProgress: number = 1.0;

  constructor(
    container: HTMLElement,
    layout: WallArtworkPosition[],
    hallLength: number,
    hallWidth: number,
    hallHeight: number
  ) {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfbfbfa);
    // Fog starts gently and extends past the entire hall
    this.scene.fog = new THREE.Fog(0xfbfbfa, 50, Math.max(hallLength + 50, 250));

    // 2. Camera - Positioned at entrance looking directly forward (+Z) down the grand gallery
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      Math.max(hallLength + 80, 500)
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(0, 1.7, 0.5);
    // Face forward down the corridor toward +Z (Math.PI radians yaw)
    this.camera.rotation.set(0, Math.PI, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    // 4. Build Gallery Architecture (Walls, Calacatta Marble floor, natural white ceiling)
    this.buildArchitecture(hallLength, hallWidth, hallHeight);

    // 5. European Salon Decor (Classical Statues, Pilasters, Chesterfield Benches)
    new EuropeanGalleryDecor(this.scene, hallLength, hallWidth, hallHeight);

    // 6. Lighting Setup (Clean, bright, uniform gallery lighting)
    this.setupLighting(hallLength, hallHeight);

    // 7. Build Artwork Frames with Gilded Gold frames & visible photos
    this.buildArtworks(layout);
  }

  private buildArchitecture(length: number, width: number, height: number) {
    // 1. Calacatta Gold / Carrara Luxury Polished Marble Floor
    const { diffuse: marbleDiffuse, roughness: marbleRough } = createMarbleTexture();
    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({
      map: marbleDiffuse,
      roughnessMap: marbleRough,
      roughness: 0.18,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, length / 2 - 2);
    this.scene.add(floor);

    // Baseboard trims along floor edges
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x242426,
      roughness: 0.3,
      metalness: 0.8,
    });
    const trimLeftGeo = new THREE.BoxGeometry(0.08, 0.1, length);
    const trimLeft = new THREE.Mesh(trimLeftGeo, trimMat);
    trimLeft.position.set(-width / 2 + 0.04, 0.05, length / 2 - 2);
    this.scene.add(trimLeft);

    const trimRight = new THREE.Mesh(trimLeftGeo, trimMat);
    trimRight.position.set(width / 2 - 0.04, 0.05, length / 2 - 2);
    this.scene.add(trimRight);

    // 2. Pure Natural White Museum Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(width, length);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, height, length / 2 - 2);
    this.scene.add(ceiling);

    // Ceiling track light bars
    const railGeo = new THREE.BoxGeometry(0.12, 0.05, length);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.4 });
    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(-width / 2 + 1.6, height - 0.025, length / 2 - 2);
    this.scene.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(width / 2 - 1.6, height - 0.025, length / 2 - 2);
    this.scene.add(railRight);

    // 3. Pristine Natural White Art Gallery Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
    });

    // Left Wall
    const leftWallGeo = new THREE.PlaneGeometry(length, height);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width / 2, height / 2, length / 2 - 2);
    this.scene.add(leftWall);

    // Right Wall
    const rightWallGeo = new THREE.PlaneGeometry(length, height);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(width / 2, height / 2, length / 2 - 2);
    this.scene.add(rightWall);

    // Start Wall (Behind entrance)
    const startWallGeo = new THREE.PlaneGeometry(width, height);
    const startWall = new THREE.Mesh(startWallGeo, wallMat);
    startWall.position.set(0, height / 2, -2);
    this.scene.add(startWall);

    // End Wall (At far end of corridor)
    const endWallGeo = new THREE.PlaneGeometry(width, height);
    const endWall = new THREE.Mesh(endWallGeo, wallMat);
    endWall.rotation.y = Math.PI;
    endWall.position.set(0, height / 2, length - 2);
    this.scene.add(endWall);
  }

  private setupLighting(length: number, height: number) {
    // 1. Natural Bright Daylight Fill Light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf6f6f2, 1.35);
    hemiLight.position.set(0, height, 0);
    this.scene.add(hemiLight);

    // 2. High-key directional ambient light along the gallery
    const dirCount = Math.max(4, Math.floor(length / 28));
    for (let i = 0; i < dirCount; i++) {
      const zPos = (i + 0.5) * (length / dirCount);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
      dirLight.position.set(0, height, zPos);
      this.scene.add(dirLight);
    }

    // 3. Ceiling light fixture accents
    const numFixtures = Math.floor(length / 7.0);
    for (let i = 0; i <= numFixtures; i++) {
      const zPos = i * 7.0;
      const fixtureGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
      const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(0, height - 0.02, zPos);
      this.scene.add(fixture);
    }
  }

  private buildArtworks(layout: WallArtworkPosition[]) {
    const textureLoader = new THREE.TextureLoader();

    // Reusable shared materials for high performance across 100+ frames
    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Rich European 24K antique gold
      roughness: 0.28,
      metalness: 0.88,
    });

    const matBoardMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const glassMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.02,
    });

    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.9,
    });

    layout.forEach((artwork) => {
      const group = new THREE.Group();
      group.position.set(artwork.x, artwork.y, artwork.z);
      group.rotation.y = artwork.rotationY;

      // 1. Classical Thick Gilded Museum Gold Frame (Molded Frame Border)
      const frameThickness = 0.16; // Substantially thick grand museum gold border
      const frameDepth = 0.08;     // Sculptural relief depth

      // Frame Molding Bars (Top, Bottom, Left, Right) - Hollow center so artwork is 100% visible
      const outerWidth = artwork.width + frameThickness * 2;
      const outerHeight = artwork.height + frameThickness * 2;

      // Top bar
      const topBar = new THREE.Mesh(
        new THREE.BoxGeometry(outerWidth, frameThickness, frameDepth),
        goldFrameMat
      );
      topBar.position.set(0, artwork.height / 2 + frameThickness / 2, frameDepth / 2);
      group.add(topBar);

      // Bottom bar
      const bottomBar = new THREE.Mesh(
        new THREE.BoxGeometry(outerWidth, frameThickness, frameDepth),
        goldFrameMat
      );
      bottomBar.position.set(0, -artwork.height / 2 - frameThickness / 2, frameDepth / 2);
      group.add(bottomBar);

      // Left bar
      const leftBar = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, artwork.height, frameDepth),
        goldFrameMat
      );
      leftBar.position.set(-artwork.width / 2 - frameThickness / 2, 0, frameDepth / 2);
      group.add(leftBar);

      // Right bar
      const rightBar = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, artwork.height, frameDepth),
        goldFrameMat
      );
      rightBar.position.set(artwork.width / 2 + frameThickness / 2, 0, frameDepth / 2);
      group.add(rightBar);

      // Backing board resting against wall
      const backingMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(outerWidth, outerHeight),
        new THREE.MeshBasicMaterial({ color: 0x1a1a1c })
      );
      backingMesh.position.z = 0.001;
      group.add(backingMesh);

      // 2. Crisp White Museum Passe-partout (Matte Board) inside frame
      const matBoardMargin = 0.08;
      const matGeo = new THREE.PlaneGeometry(artwork.width, artwork.height);
      const matBoard = new THREE.Mesh(matGeo, matBoardMat);
      matBoard.position.z = 0.005;
      group.add(matBoard);

      // 3. Photograph Canvas Mesh
      const photoWidth = artwork.width - matBoardMargin * 2;
      const photoHeight = artwork.height - matBoardMargin * 2;
      const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);

      // Vibrant, clean MeshBasicMaterial displaying the photograph
      const photoMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
      });

      // Load image texture with sRGB color space
      textureLoader.load(
        artwork.item.imageSrc,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.generateMipmaps = true;
          photoMat.map = tex;
          photoMat.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.warn(`Could not load artwork: ${artwork.item.imageSrc}`, err);
        }
      );

      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = 0.012;
      photoMesh.name = `artwork-${artwork.item.id}`;
      group.add(photoMesh);

      // Register for raycast clicking
      this.clickableMeshes.push(photoMesh);
      this.meshToArtworkMap.set(photoMesh.uuid, artwork);

      // 4. Subtle Museum Glass Layer
      const glassGeo = new THREE.PlaneGeometry(artwork.width, artwork.height);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.z = 0.016;
      group.add(glassMesh);

      // 5. High-Legibility Museum Wall Plaque
      const plaqueWidth = 0.82;
      const plaqueHeight = 0.38;
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 1024;
      plaqueCanvas.height = 475;
      const pctx = plaqueCanvas.getContext('2d')!;

      // Crisp pure white plaque card
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, 1024, 475);

      // Elegant double border with museum brass accent
      pctx.strokeStyle = '#c8a265';
      pctx.lineWidth = 8;
      pctx.strokeRect(10, 10, 1004, 455);

      pctx.strokeStyle = '#222222';
      pctx.lineWidth = 2.5;
      pctx.strokeRect(22, 22, 980, 431);

      // Category Pill / Tag
      pctx.fillStyle = '#111113';
      pctx.font = 'bold 32px "Lato", -apple-system, sans-serif';
      pctx.fillText((artwork.item.categoryLabel || 'EDITORIAL').toUpperCase(), 48, 85);

      // Artwork Title
      pctx.font = 'bold 46px "Lato", -apple-system, sans-serif';
      pctx.fillStyle = '#0a0a0c';
      const truncatedTitle =
        artwork.item.title.length > 25
          ? artwork.item.title.substring(0, 23) + '...'
          : artwork.item.title;
      pctx.fillText(truncatedTitle, 48, 165);

      // Client / Brand line
      pctx.font = 'bold 36px "Lato", -apple-system, sans-serif';
      pctx.fillStyle = '#9e7328';
      const clientName = artwork.item.client || 'STUDIO COMMISSION';
      pctx.fillText(clientName.toUpperCase(), 48, 245);

      // Studio Credit
      pctx.font = '600 28px "Lato", -apple-system, sans-serif';
      pctx.fillStyle = '#444446';
      pctx.fillText('TO THE ∞ STUDIO • SARVESH CHAUDHARI', 48, 320);

      // Action CTA Bar
      pctx.fillStyle = '#0f0f12';
      pctx.fillRect(48, 365, 928, 64);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 28px "Lato", -apple-system, sans-serif';
      pctx.fillText('▶ CLICK TO INSPECT & VIEW HIGH-RES', 72, 408);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      plaqueTex.colorSpace = THREE.SRGBColorSpace;
      plaqueTex.needsUpdate = true;

      const plaqueGeo = new THREE.PlaneGeometry(plaqueWidth, plaqueHeight);
      const plaqueMesh = new THREE.Mesh(
        plaqueGeo,
        new THREE.MeshBasicMaterial({
          map: plaqueTex,
          side: THREE.FrontSide,
        })
      );
      plaqueMesh.position.set(0, -artwork.height / 2 - 0.28, 0.04);
      group.add(plaqueMesh);

      // Plaque is also clickable to inspect
      this.clickableMeshes.push(plaqueMesh);
      this.meshToArtworkMap.set(plaqueMesh.uuid, artwork);

      // 6. Brass Tubular Picture Lamp Fixture mounted directly on frame
      const lampArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.2, 12),
        lampMat
      );
      lampArm.rotation.x = Math.PI / 2;
      lampArm.position.set(0, artwork.height / 2 + 0.18, 0.08);
      group.add(lampArm);

      const hood = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, artwork.width * 0.55, 16),
        lampMat
      );
      hood.rotation.z = Math.PI / 2;
      hood.position.set(0, artwork.height / 2 + 0.18, 0.16);
      group.add(hood);

      // Add frame group to main scene
      this.scene.add(group);
    });
  }

  // Smoothly inspect a specific artwork
  public inspectArtwork(artwork: WallArtworkPosition) {
    this.isInspecting = true;
    this.inspectionProgress = 0.0;

    this.startCameraPos.copy(this.camera.position);

    // Target position: directly in front of photograph at optimal viewing distance
    const viewDistance = Math.max(artwork.width, artwork.height) * 1.35;
    const offsetDir = artwork.wall === 'left' ? 1 : -1;

    this.targetCameraPos.set(
      artwork.x + offsetDir * viewDistance,
      artwork.y,
      artwork.z
    );

    this.targetLookAt.set(artwork.x, artwork.y, artwork.z);
  }

  public exitInspection() {
    this.isInspecting = false;
  }

  public updateInspection(delta: number) {
    if (!this.isInspecting) return;

    if (this.inspectionProgress < 1.0) {
      this.inspectionProgress = Math.min(1.0, this.inspectionProgress + delta * 3.2);
      // Smooth cubic easing
      const t = 1 - Math.pow(1 - this.inspectionProgress, 3);

      this.camera.position.lerpVectors(this.startCameraPos, this.targetCameraPos, t);

      const tempMat = new THREE.Matrix4();
      tempMat.lookAt(this.camera.position, this.targetLookAt, new THREE.Vector3(0, 1, 0));
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(tempMat);
      this.camera.quaternion.slerp(targetQuat, 0.18);
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
