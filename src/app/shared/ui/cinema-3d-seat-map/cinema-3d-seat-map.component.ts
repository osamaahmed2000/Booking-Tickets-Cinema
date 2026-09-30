import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CinemaHall } from '../../../core/models';
import { isAisle } from '../../../core/utils';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface HoveredSeatInfo {
  code: string;
  row: string;
  col: number;
  isVip: boolean;
  isBooked: boolean;
  isSelected: boolean;
  price: number;
  screenX: number;
  screenY: number;
}

@Component({
  selector: 'app-cinema-3d-seat-map',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cinema-3d-seat-map.component.html',
  styleUrl: './cinema-3d-seat-map.component.scss',
})
export class Cinema3dSeatMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) hall!: CinemaHall;
  @Input() booked: string[] = [];
  @Input() selected: string[] = [];
  @Input() standardPrice = 120;
  @Input() vipPrice = 180;
  @Input() currency = 'EGP';
  @Input() movieTitle = 'Cinema Presentation';
  @Input() interactive = true;

  @Output() toggle = new EventEmitter<string>();

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasHolder') canvasHolderRef!: ElementRef<HTMLDivElement>;

  readonly hoveredSeat = signal<HoveredSeatInfo | null>(null);
  readonly webGlError = signal(false);

  // Three.js instances
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Animation & resource tracking
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private seatMeshes: Map<string, THREE.Group> = new Map();
  private interactiveMeshes: THREE.Mesh[] = [];
  private hoveredMesh: THREE.Group | null = null;
  private pointerDownPos = { x: 0, y: 0 };

  // Shared Geometries
  private cushionGeo!: THREE.BufferGeometry;
  private backrestGeo!: THREE.BufferGeometry;
  private headrestGeo!: THREE.BufferGeometry;
  private armrestGeo!: THREE.BufferGeometry;
  private baseGeo!: THREE.BufferGeometry;

  // Shared Materials
  private matAvailable!: THREE.MeshStandardMaterial;
  private matVip!: THREE.MeshStandardMaterial;
  private matSelected!: THREE.MeshStandardMaterial;
  private matBooked!: THREE.MeshStandardMaterial;
  private matHover!: THREE.MeshStandardMaterial;
  private matArmrest!: THREE.MeshStandardMaterial;
  private matBase!: THREE.MeshStandardMaterial;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    try {
      this.initThree();
      this.buildHall();
      this.setupResize();
      this.setupEvents();
      this.animate();
    } catch (err) {
      console.error('Three.js initialization failed:', err);
      this.webGlError.set(true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.scene) return;

    if (changes['hall']) {
      this.rebuildHall();
    } else if (changes['selected'] || changes['booked']) {
      this.updateSeatStates();
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.disposeResources();
  }

  // ==========================================
  // Three.js Scene Setup
  // ==========================================
  private initThree(): void {
    const holder = this.canvasHolderRef.nativeElement;
    const width = holder.clientWidth || 800;
    const height = holder.clientHeight || 520;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08080a);
    this.scene.fog = new THREE.FogExp2(0x08080a, 0.024);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    this.setInitialCameraPosition();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    holder.innerHTML = '';
    holder.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep above floor
    this.controls.minDistance = 5;
    this.controls.maxDistance = 48;
    this.controls.target.set(0, 1.2, 2);
    this.controls.update();

    // Lighting
    this.setupLighting();

    // Initialize Shared Geometries & Materials
    this.initGeometriesAndMaterials();
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x202230, 1.4);
    this.scene.add(ambientLight);

    // Screen light (soft light illuminating the seats from the screen)
    const screenLight = new THREE.DirectionalLight(0xe8eeff, 1.8);
    screenLight.position.set(0, 5, -8);
    screenLight.target.position.set(0, 0, 5);
    screenLight.castShadow = true;
    screenLight.shadow.mapSize.width = 1024;
    screenLight.shadow.mapSize.height = 1024;
    this.scene.add(screenLight);
    this.scene.add(screenLight.target);

    // Golden ambient overhead light
    const ceilingLight = new THREE.PointLight(0xc9a466, 1.6, 35, 1.2);
    ceilingLight.position.set(0, 10, 3);
    this.scene.add(ceilingLight);

    // Subtle side accent lights
    const leftSconce = new THREE.PointLight(0xc9a466, 0.8, 20);
    leftSconce.position.set(-12, 3, 2);
    this.scene.add(leftSconce);

    const rightSconce = new THREE.PointLight(0xc9a466, 0.8, 20);
    rightSconce.position.set(12, 3, 2);
    this.scene.add(rightSconce);
  }

  private initGeometriesAndMaterials(): void {
    // Shared Geometries
    this.cushionGeo = new THREE.BoxGeometry(0.58, 0.12, 0.52);
    this.backrestGeo = new THREE.BoxGeometry(0.58, 0.62, 0.14);
    this.headrestGeo = new THREE.BoxGeometry(0.52, 0.20, 0.13);
    this.armrestGeo = new THREE.BoxGeometry(0.12, 0.14, 0.44);
    this.baseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.42, 8);

    // Shared Materials
    this.matAvailable = new THREE.MeshStandardMaterial({
      color: 0x222634,
      roughness: 0.65,
      metalness: 0.15,
    });

    this.matVip = new THREE.MeshStandardMaterial({
      color: 0x4a1824,
      roughness: 0.45,
      metalness: 0.25,
      emissive: 0x260c13,
      emissiveIntensity: 0.5,
    });

    this.matSelected = new THREE.MeshStandardMaterial({
      color: 0xe6c98f,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0xc9a466,
      emissiveIntensity: 0.85,
    });

    this.matBooked = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.95,
      metalness: 0.05,
    });

    this.matHover = new THREE.MeshStandardMaterial({
      color: 0x3d445c,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0x28304a,
      emissiveIntensity: 0.6,
    });

    this.matArmrest = new THREE.MeshStandardMaterial({
      color: 0x18181e,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.matBase = new THREE.MeshStandardMaterial({
      color: 0x0f0f13,
      roughness: 0.5,
      metalness: 0.8,
    });
  }

  // ==========================================
  // Hall & Screen Construction
  // ==========================================
  private buildHall(): void {
    if (!this.hall) return;

    this.clearHall();

    // 1. Curved Screen
    this.buildScreen();

    // 2. Tiered Floor & Architecture
    this.buildFloorAndWalls();

    // 3. Seats Generation
    this.buildSeats();

    // 4. Set initial states
    this.updateSeatStates();
  }

  private rebuildHall(): void {
    this.buildHall();
    this.resetCamera();
  }

  private clearHall(): void {
    for (const mesh of this.seatMeshes.values()) {
      this.scene.remove(mesh);
    }
    this.seatMeshes.clear();
    this.interactiveMeshes = [];
    this.hoveredMesh = null;
    this.hoveredSeat.set(null);
  }

  private buildScreen(): void {
    const hallWidth = Math.max(16, this.hall.seatsPerRow * 1.35);
    const screenWidth = hallWidth * 0.95;
    const screenHeight = 6.8;
    const curveRadius = screenWidth * 1.3;
    const arcAngle = screenWidth / curveRadius;

    // Curved Screen Geometry
    const screenGeo = new THREE.CylinderGeometry(
      curveRadius,
      curveRadius,
      screenHeight,
      48,
      1,
      true,
      -arcAngle / 2 + Math.PI / 2,
      arcAngle,
    );

    // Screen Texture with Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Gradient background
    const grad = ctx.createRadialGradient(512, 256, 50, 512, 256, 500);
    grad.addColorStop(0, '#2b304c');
    grad.addColorStop(0.5, '#121420');
    grad.addColorStop(1, '#06070a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle Cinema Glow Box
    ctx.strokeStyle = '#c9a466';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 944, 432);

    // "NOW SHOWING"
    ctx.fillStyle = '#c9a466';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOIR CINEMAS — NOW SHOWING', 512, 180);

    // Movie Title
    ctx.fillStyle = '#f2efe8';
    ctx.font = 'italic bold 52px serif';
    ctx.fillText(this.movieTitle, 512, 270);

    // Subtitle
    ctx.fillStyle = '#a6a29a';
    ctx.font = '22px sans-serif';
    ctx.fillText(this.hall.kind + ' · ' + (this.hall.name?.en || 'Main Hall'), 512, 340);

    const screenTexture = new THREE.CanvasTexture(canvas);
    screenTexture.anisotropy = 8;

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.DoubleSide,
    });

    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 3.8, -curveRadius - 1.5);
    screenMesh.rotation.y = Math.PI;
    this.scene.add(screenMesh);

    // Screen Frame & Glow Light
    const frameGeo = new THREE.CylinderGeometry(
      curveRadius + 0.05,
      curveRadius + 0.05,
      screenHeight + 0.4,
      48,
      1,
      true,
      -arcAngle / 2 + Math.PI / 2,
      arcAngle,
    );
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x050507,
      roughness: 0.9,
      metalness: 0.3,
      side: THREE.BackSide,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.copy(screenMesh.position);
    frameMesh.rotation.y = Math.PI;
    this.scene.add(frameMesh);

    // Screen bottom glow line
    const lightLine = new THREE.PointLight(0x7fa3c9, 1.2, 18);
    lightLine.position.set(0, 0.8, -6);
    this.scene.add(lightLine);
  }

  private buildFloorAndWalls(): void {
    const totalRows = this.hall.rows;
    const rowSpacing = 1.35;
    const stepHeight = 0.38;
    const hallWidth = Math.max(20, this.hall.seatsPerRow * 1.4 + 4);
    const hallDepth = totalRows * rowSpacing + 8;

    // Stepped Floor Risers
    for (let r = 0; r < totalRows; r++) {
      const riserHeight = (r + 1) * stepHeight;
      const riserGeo = new THREE.BoxGeometry(hallWidth, riserHeight, rowSpacing);
      const riserMat = new THREE.MeshStandardMaterial({
        color: 0x0c0c10,
        roughness: 0.9,
        metalness: 0.1,
      });

      const riser = new THREE.Mesh(riserGeo, riserMat);
      riser.position.set(
        0,
        riserHeight / 2 - 0.01,
        r * rowSpacing + 1.2,
      );
      riser.receiveShadow = true;
      this.scene.add(riser);

      // Low-intensity Step Aisle Light
      if (r > 0) {
        const stepLight = new THREE.PointLight(0xc9a466, 0.25, 4);
        stepLight.position.set(-hallWidth / 2 + 1, riserHeight + 0.05, r * rowSpacing + 1.2);
        this.scene.add(stepLight);

        const stepLightRight = new THREE.PointLight(0xc9a466, 0.25, 4);
        stepLightRight.position.set(hallWidth / 2 - 1, riserHeight + 0.05, r * rowSpacing + 1.2);
        this.scene.add(stepLightRight);
      }
    }

    // Main Stage Floor
    const mainFloorGeo = new THREE.PlaneGeometry(hallWidth + 8, hallDepth + 12);
    const mainFloorMat = new THREE.MeshStandardMaterial({
      color: 0x060608,
      roughness: 0.95,
      metalness: 0.05,
    });
    const mainFloor = new THREE.Mesh(mainFloorGeo, mainFloorMat);
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.position.set(0, 0, hallDepth / 2 - 4);
    mainFloor.receiveShadow = true;
    this.scene.add(mainFloor);

    // Left and Right Acoustic Walls
    const wallGeo = new THREE.BoxGeometry(0.4, 10, hallDepth + 10);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0e,
      roughness: 0.85,
      metalness: 0.15,
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-hallWidth / 2 - 0.2, 4.5, hallDepth / 2 - 3);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(hallWidth / 2 + 0.2, 4.5, hallDepth / 2 - 3);
    this.scene.add(rightWall);
  }

  private buildSeats(): void {
    const rowsCount = this.hall.rows;
    const seatsPerRow = this.hall.seatsPerRow;
    const vipStart = Math.max(0, rowsCount - this.hall.vipRows);
    const rowSpacing = 1.35;
    const seatSpacing = 0.82;
    const stepHeight = 0.38;

    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    for (let r = 0; r < rowsCount; r++) {
      const rowLabel = rowLetters[r] ?? `R${r + 1}`;
      const isVip = r >= vipStart;
      const rowY = (r + 1) * stepHeight;
      const rowZ = r * rowSpacing + 1.2;

      // Calculate total row width including aisles
      let colOffset = 0;
      const colPositions: number[] = [];
      for (let c = 1; c <= seatsPerRow; c++) {
        colPositions.push(colOffset);
        colOffset += seatSpacing;
        if (isAisle(this.hall, c) && c !== seatsPerRow) {
          colOffset += seatSpacing * 0.9; // Aisle gap
        }
      }

      const totalRowSpan = colPositions[colPositions.length - 1];
      const startX = -totalRowSpan / 2;

      for (let c = 1; c <= seatsPerRow; c++) {
        const code = `${rowLabel}${c}`;
        const posX = startX + colPositions[c - 1];

        // Slight amphitheater curve towards the screen
        const angle = -posX * 0.035;
        const curveZOffset = Math.abs(posX) * 0.08;

        const seatGroup = this.createSeatMesh(code, rowLabel, c, isVip);
        seatGroup.position.set(posX, rowY, rowZ - curveZOffset);
        seatGroup.rotation.y = angle;

        this.scene.add(seatGroup);
        this.seatMeshes.set(code, seatGroup);
      }
    }
  }

  private createSeatMesh(code: string, row: string, col: number, isVip: boolean): THREE.Group {
    const group = new THREE.Group();

    // Cushion
    const cushion = new THREE.Mesh(this.cushionGeo, isVip ? this.matVip : this.matAvailable);
    cushion.position.set(0, 0.44, 0);
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    group.add(cushion);

    // Backrest (tilted slightly backwards)
    const backrest = new THREE.Mesh(this.backrestGeo, isVip ? this.matVip : this.matAvailable);
    backrest.position.set(0, 0.74, 0.22);
    backrest.rotation.x = -0.12;
    backrest.castShadow = true;
    group.add(backrest);

    // Headrest
    const headrest = new THREE.Mesh(this.headrestGeo, isVip ? this.matVip : this.matAvailable);
    headrest.position.set(0, 1.08, 0.27);
    headrest.rotation.x = -0.12;
    group.add(headrest);

    // Left & Right Armrests
    const leftArm = new THREE.Mesh(this.armrestGeo, this.matArmrest);
    leftArm.position.set(-0.33, 0.52, 0.04);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(this.armrestGeo, this.matArmrest);
    rightArm.position.set(0.33, 0.52, 0.04);
    group.add(rightArm);

    // Base Support Column
    const base = new THREE.Mesh(this.baseGeo, this.matBase);
    base.position.set(0, 0.21, 0.06);
    group.add(base);

    // Invisible Click/Raycast Box (makes selecting reliable and smooth)
    const hitGeo = new THREE.BoxGeometry(0.78, 1.15, 0.75);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    hitBox.position.set(0, 0.6, 0.1);
    hitBox.userData = { code, row, col, isVip };
    group.add(hitBox);

    this.interactiveMeshes.push(hitBox);

    group.userData = {
      code,
      row,
      col,
      isVip,
      cushion,
      backrest,
      headrest,
      hitBox,
    };

    return group;
  }

  // ==========================================
  // Seat State Synchronization
  // ==========================================
  private updateSeatStates(): void {
    const bookedSet = new Set(this.booked);
    const selectedSet = new Set(this.selected);

    for (const [code, group] of this.seatMeshes.entries()) {
      const isBooked = bookedSet.has(code);
      const isSelected = selectedSet.has(code);
      const isVip = group.userData['isVip'];

      let targetMat: THREE.MeshStandardMaterial;

      if (isBooked) {
        targetMat = this.matBooked;
      } else if (isSelected) {
        targetMat = this.matSelected;
      } else if (isVip) {
        targetMat = this.matVip;
      } else {
        targetMat = this.matAvailable;
      }

      const cushion = group.userData['cushion'] as THREE.Mesh;
      const backrest = group.userData['backrest'] as THREE.Mesh;
      const headrest = group.userData['headrest'] as THREE.Mesh;

      if (cushion) cushion.material = targetMat;
      if (backrest) backrest.material = targetMat;
      if (headrest) headrest.material = targetMat;

      // Scale bounce effect for selected seats
      if (isSelected) {
        group.scale.set(1.05, 1.05, 1.05);
      } else {
        group.scale.set(1, 1, 1);
      }
    }
  }

  // ==========================================
  // Interaction & Raycasting
  // ==========================================
  private setupEvents(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('pointermove', (e) => {
      this.onPointerMove(e);
    });

    dom.addEventListener('pointerleave', () => {
      this.onPointerLeave();
    });

    dom.addEventListener('pointerup', (e) => {
      const dx = Math.abs(e.clientX - this.pointerDownPos.x);
      const dy = Math.abs(e.clientY - this.pointerDownPos.y);
      // Only treat as click if pointer didn't drag/orbit
      if (dx < 6 && dy < 6) {
        this.onClick(e);
      }
    });
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerMove(e: MouseEvent): void {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const data = hit.userData as { code: string; row: string; col: number; isVip: boolean };
      const group = this.seatMeshes.get(data.code);

      if (group) {
        const isBooked = this.booked.includes(data.code);
        const isSelected = this.selected.includes(data.code);

        // Highlight hover if not already hovered
        if (this.hoveredMesh !== group) {
          this.clearHover();
          this.hoveredMesh = group;

          if (!isBooked && !isSelected) {
            const cushion = group.userData['cushion'] as THREE.Mesh;
            const backrest = group.userData['backrest'] as THREE.Mesh;
            const headrest = group.userData['headrest'] as THREE.Mesh;
            if (cushion) cushion.material = this.matHover;
            if (backrest) backrest.material = this.matHover;
            if (headrest) headrest.material = this.matHover;
          }
        }

        // Update cursor style
        this.renderer.domElement.style.cursor = isBooked
          ? 'not-allowed'
          : this.interactive
          ? 'pointer'
          : 'default';

        // Update Tooltip State
        const rect = this.containerRef.nativeElement.getBoundingClientRect();
        const screenX = Math.min(rect.width - 210, Math.max(12, e.clientX - rect.left + 15));
        const screenY = Math.min(rect.height - 130, Math.max(12, e.clientY - rect.top - 70));

        this.hoveredSeat.set({
          code: data.code,
          row: data.row,
          col: data.col,
          isVip: data.isVip,
          isBooked,
          isSelected,
          price: data.isVip ? this.vipPrice : this.standardPrice,
          screenX,
          screenY,
        });

        return;
      }
    }

    this.onPointerLeave();
  }

  private onPointerLeave(): void {
    this.clearHover();
    this.renderer.domElement.style.cursor = 'default';
    this.hoveredSeat.set(null);
  }

  private clearHover(): void {
    if (this.hoveredMesh) {
      const code = this.hoveredMesh.userData['code'];
      const isBooked = this.booked.includes(code);
      const isSelected = this.selected.includes(code);
      const isVip = this.hoveredMesh.userData['isVip'];

      let restoreMat = isBooked
        ? this.matBooked
        : isSelected
        ? this.matSelected
        : isVip
        ? this.matVip
        : this.matAvailable;

      const cushion = this.hoveredMesh.userData['cushion'] as THREE.Mesh;
      const backrest = this.hoveredMesh.userData['backrest'] as THREE.Mesh;
      const headrest = this.hoveredMesh.userData['headrest'] as THREE.Mesh;

      if (cushion) cushion.material = restoreMat;
      if (backrest) backrest.material = restoreMat;
      if (headrest) headrest.material = restoreMat;

      this.hoveredMesh = null;
    }
  }

  private onClick(e: MouseEvent): void {
    if (!this.interactive) return;

    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const code = hit.userData['code'] as string;

      if (this.booked.includes(code)) return;

      // Trigger Angular event
      this.ngZone.run(() => {
        this.toggle.emit(code);
      });
    }
  }

  // ==========================================
  // Camera Presets
  // ==========================================
  private setInitialCameraPosition(): void {
    const totalRows = this.hall ? this.hall.rows : 8;
    const rowSpacing = 1.35;
    const centerZ = (totalRows * rowSpacing) / 2 + 1;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.camera.position.set(0, 9.5, centerZ + 14);
    } else {
      this.camera.position.set(0, 7.5, centerZ + 11.5);
    }
  }

  resetCamera(): void {
    if (!this.controls || !this.camera) return;
    this.setInitialCameraPosition();
    this.controls.target.set(0, 1.5, 2.5);
    this.controls.update();
  }

  frontView(): void {
    if (!this.controls || !this.camera) return;
    const totalRows = this.hall ? this.hall.rows : 8;
    const rowSpacing = 1.35;
    const backZ = totalRows * rowSpacing + 2;

    this.camera.position.set(0, 3.2, backZ);
    this.controls.target.set(0, 3.5, -8);
    this.controls.update();
  }

  topView(): void {
    if (!this.controls || !this.camera) return;
    const totalRows = this.hall ? this.hall.rows : 8;
    const rowSpacing = 1.35;
    const centerZ = (totalRows * rowSpacing) / 2;

    this.camera.position.set(0, 18, centerZ);
    this.controls.target.set(0, 0, centerZ);
    this.controls.update();
  }

  zoom(factor: number): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);
    this.controls.update();
  }

  // ==========================================
  // Animation & Rendering Loop
  // ==========================================
  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private setupResize(): void {
    const holder = this.canvasHolderRef.nativeElement;
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && this.camera && this.renderer) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      }
    });
    this.resizeObserver.observe(holder);
  }

  // ==========================================
  // Resource Cleanup & Memory Safety
  // ==========================================
  private disposeResources(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Geometries
    this.cushionGeo?.dispose();
    this.backrestGeo?.dispose();
    this.headrestGeo?.dispose();
    this.armrestGeo?.dispose();
    this.baseGeo?.dispose();

    // Materials
    this.matAvailable?.dispose();
    this.matVip?.dispose();
    this.matSelected?.dispose();
    this.matBooked?.dispose();
    this.matHover?.dispose();
    this.matArmrest?.dispose();
    this.matBase?.dispose();

    this.seatMeshes.clear();
    this.interactiveMeshes = [];
  }
}
