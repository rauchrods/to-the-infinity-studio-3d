import * as THREE from 'three';
import { GALLERY_CONFIG } from './galleryConfig';

export interface PlayerControlsOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  hallLength: number;
  hallWidth: number;
  onLockChange?: (locked: boolean) => void;
}

export class PlayerFPSControls {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public isLocked: boolean = false;
  public isEnabled: boolean = true;

  // Collision boundaries
  private minX: number;
  private maxX: number;
  private minZ: number;
  private maxZ: number;

  // Movement inputs
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;

  // Velocity & physics
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');

  // Head bobbing effect
  private walkTime: number = 0;
  private baseHeight: number = GALLERY_CONFIG.playerEyeHeight;

  // Touch tracking for mobile (iPhone / Android)
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isTouching: boolean = false;

  private onLockChangeCallback?: (locked: boolean) => void;

  constructor(options: PlayerControlsOptions) {
    this.camera = options.camera;
    this.domElement = options.domElement;
    this.onLockChangeCallback = options.onLockChange;

    const halfW = options.hallWidth / 2 - GALLERY_CONFIG.boundsPadding;
    this.minX = -halfW;
    this.maxX = halfW;
    this.minZ = 0.5; // Do not walk backwards out of entrance
    this.maxZ = options.hallLength - 3.5;

    // Initialize orientation to match the forward-facing camera
    this.euler.setFromQuaternion(this.camera.quaternion);

    this.bindEvents();
  }

  private bindEvents() {
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    this.domElement.addEventListener('mousemove', this.onMouseMove);

    // Mobile Touch Navigation
    this.domElement.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.domElement.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.domElement.addEventListener('touchend', this.onTouchEnd, { passive: false });
  }

  public unbindEvents() {
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    this.domElement.removeEventListener('mousemove', this.onMouseMove);

    this.domElement.removeEventListener('touchstart', this.onTouchStart);
    this.domElement.removeEventListener('touchmove', this.onTouchMove);
    this.domElement.removeEventListener('touchend', this.onTouchEnd);
  }

  public lock() {
      // Only request pointer lock on desktop browsers
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!this.isLocked && !isMobile) {
        try {
          this.domElement.requestPointerLock?.();
        } catch {
          // Ignore on unsupported browsers
        }
      }
    }

  public unlock() {
    if (this.isLocked) {
      document.exitPointerLock?.();
    }
  }

  private onPointerLockChange = () => {
    this.isLocked = document.pointerLockElement === this.domElement;
    if (this.onLockChangeCallback) {
      this.onLockChangeCallback(this.isLocked);
    }
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isLocked || !this.isEnabled) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    const sensitivity = 0.0022;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * sensitivity;
    this.euler.x -= movementY * sensitivity;

    const maxPolar = Math.PI / 2 - 0.08;
    this.euler.x = Math.max(-maxPolar, Math.min(maxPolar, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  };

  // Mobile Touch Controls
  private onTouchStart = (event: TouchEvent) => {
    if (!this.isEnabled) return;
    if (event.touches.length === 1) {
      this.isTouching = true;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  };

  private onTouchMove = (event: TouchEvent) => {
    if (!this.isTouching || !this.isEnabled || event.touches.length !== 1) return;
    event.preventDefault();

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const deltaX = currentX - this.touchStartX;
    const deltaY = currentY - this.touchStartY;

    this.touchStartX = currentX;
    this.touchStartY = currentY;

    // Swipe left/right looks around, swipe up/down walks or looks
    const touchSensitivity = 0.0035;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= deltaX * touchSensitivity;

    // Small tilt
    this.euler.x -= deltaY * touchSensitivity * 0.4;
    const maxPolar = Math.PI / 2 - 0.15;
    this.euler.x = Math.max(-maxPolar, Math.min(maxPolar, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);

    // Drag forward/back moves along the aisle
    if (Math.abs(deltaY) > 5) {
      this.velocity.z += deltaY * 0.08;
    }
  };

  private onTouchEnd = () => {
    this.isTouching = false;
  };

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
    }
  };

  public update(delta: number) {
    if (!this.isEnabled) return;

    const friction = 10.0;
    this.velocity.x -= this.velocity.x * friction * delta;
    this.velocity.z -= this.velocity.z * friction * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const speed = GALLERY_CONFIG.playerSpeed;

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * speed * delta * 10;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * speed * delta * 10;
    }

    const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.euler.y
    );
    const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.euler.y
    );

    this.camera.position.addScaledVector(forwardVec, -this.velocity.z * delta);
    this.camera.position.addScaledVector(rightVec, -this.velocity.x * delta);

    // Enforce Wall Collisions
    this.camera.position.x = Math.max(this.minX, Math.min(this.maxX, this.camera.position.x));
    this.camera.position.z = Math.max(this.minZ, Math.min(this.maxZ, this.camera.position.z));

    const isMoving =
      Math.abs(this.velocity.x) > 0.3 || Math.abs(this.velocity.z) > 0.3;

    if (isMoving) {
      this.walkTime += delta * 9;
      this.camera.position.y = this.baseHeight + Math.sin(this.walkTime) * 0.04;
    } else {
      this.camera.position.y = THREE.MathUtils.lerp(
        this.camera.position.y,
        this.baseHeight,
        delta * 6
      );
    }
  }

  public setPositionAndLookAt(pos: THREE.Vector3, target: THREE.Vector3) {
    this.camera.position.copy(pos);
    this.camera.lookAt(target);
    this.euler.setFromQuaternion(this.camera.quaternion);
  }
}
