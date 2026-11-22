import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GalleryScene } from './GalleryScene';
import { PlayerFPSControls } from './PlayerFPSControls';
import { GalleryOverlay } from './GalleryOverlay';
import {
  calculateGalleryLayout,
  GALLERY_CONFIG,
  getCuratedArtworks,
} from './galleryConfig';
import type { GalleryItem, WallArtworkPosition } from './types';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Gallery Data - Display ALL authentic photography items from studio portfolio
  const [artworks] = useState<GalleryItem[]>(() => getCuratedArtworks());
  const [selectedArtwork, setSelectedArtwork] = useState<GalleryItem | null>(null);
  const [hoveredArtwork, setHoveredArtwork] = useState<GalleryItem | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // References to 3D instances
  const sceneRef = useRef<GalleryScene | null>(null);
  const controlsRef = useRef<PlayerFPSControls | null>(null);
  const layoutRef = useRef<WallArtworkPosition[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Calculate positions for frames along left & right walls
    const { layout, hallLength } = calculateGalleryLayout(artworks);
    layoutRef.current = layout;

    // 2. Instantiate Three.js Gallery Scene
    const galleryScene = new GalleryScene(
      container,
      layout,
      hallLength,
      GALLERY_CONFIG.hallWidth,
      GALLERY_CONFIG.hallHeight
    );
    sceneRef.current = galleryScene;

    // 3. Setup FPS Controls
    const controls = new PlayerFPSControls({
      camera: galleryScene.camera,
      domElement: container,
      hallLength,
      hallWidth: GALLERY_CONFIG.hallWidth,
      onLockChange: (locked) => {
        setIsLocked(locked);
      },
    });
    controlsRef.current = controls;

    // 4. Raycaster for artwork inspection on click / hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      // If user is currently inspecting, clicking canvas exits inspection
      if (galleryScene.isInspecting) {
        galleryScene.exitInspection();
        setSelectedArtwork(null);
        controls.isEnabled = true;
        return;
      }

      // Check if clicked an artwork
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // If pointer is locked, always cast from screen center (0,0)
      if (controls.isLocked) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), galleryScene.camera);
      } else {
        raycaster.setFromCamera(mouse, galleryScene.camera);
      }

      const intersects = raycaster.intersectObjects(galleryScene.clickableMeshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const artworkPos = galleryScene.meshToArtworkMap.get(hitMesh.uuid);
        if (artworkPos) {
          // Unlock pointer lock so user can interact with the info drawer
          controls.unlock();
          controls.isEnabled = false;
          galleryScene.inspectArtwork(artworkPos);
          setSelectedArtwork(artworkPos.item);
          return;
        }
      }

      // If not clicking an artwork and not locked, request pointer lock to walk
      if (!controls.isLocked && !galleryScene.isInspecting) {
        controls.lock();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (galleryScene.isInspecting) {
        setHoveredArtwork(null);
        return;
      }

      // If pointer locked, raycast from center; else raycast from cursor
      if (controls.isLocked) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), galleryScene.camera);
      } else {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, galleryScene.camera);
      }

      const intersects = raycaster.intersectObjects(galleryScene.clickableMeshes);
      if (intersects.length > 0 && intersects[0].distance < 12) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const artworkPos = galleryScene.meshToArtworkMap.get(hitMesh.uuid);
        setHoveredArtwork(artworkPos ? artworkPos.item : null);
      } else {
        setHoveredArtwork(null);
      }
    };

    container.addEventListener('click', handleCanvasClick);
    window.addEventListener('mousemove', handleMouseMove);

    // 5. Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      galleryScene.resize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (galleryScene.isInspecting) {
        galleryScene.updateInspection(delta);
      } else {
        controls.update(delta);
      }

      galleryScene.render();
    };

    animId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleCanvasClick);
      controls.unbindEvents();
      galleryScene.destroy();
    };
  }, [artworks]);

  // Teleport camera directly to an artwork selected from index
  const handleJumpToArtwork = (id: string) => {
    const target = layoutRef.current.find((l) => l.item.id === id);
    const scene = sceneRef.current;
    const controls = controlsRef.current;
    if (!target || !scene || !controls) return;

    controls.unlock();
    controls.isEnabled = false;
    scene.inspectArtwork(target);
    setSelectedArtwork(target.item);
  };

  // Close inspection drawer and return to walking
  const handleCloseInspect = () => {
    setSelectedArtwork(null);
    if (sceneRef.current) {
      sceneRef.current.exitInspection();
    }
    if (controlsRef.current) {
      controlsRef.current.isEnabled = true;
    }
  };

  return (
    <div className="gallery-container">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="three-canvas-holder" />

      {/* 2D Interactive HUD Overlay */}
      <GalleryOverlay
        isLocked={isLocked}
        onEnterFPS={() => controlsRef.current?.lock()}
        selectedArtwork={selectedArtwork}
        onCloseInspect={handleCloseInspect}
        hoveredArtwork={hoveredArtwork}
        onJumpToArtwork={handleJumpToArtwork}
        artworks={artworks}
      />
    </div>
  );
}

export default App;
