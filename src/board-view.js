import * as THREE from 'three';
import { BLACK, EMPTY, WHITE } from './go-engine.js';

const BOARD_SIZE = 20;
const GRID_HALF = 8.65;
const CAMERA_SIZE = 11.25;

const BOARD_STYLES = Object.freeze({
  kaya: Object.freeze({
    colors: ['#e1b875', '#c99150', '#ae6f37'],
    grainDark: '#6b3c20',
    grainLight: '#fff0c5',
    grid: 0x3f2819,
    star: 0x3c2416,
    rim: 0x6f4329,
    vignette: 'rgba(58,27,10,0.17)',
  }),
  walnut: Object.freeze({
    colors: ['#9b6848', '#70452f', '#4d2d22'],
    grainDark: '#291713',
    grainLight: '#d8a77f',
    grid: 0x23140f,
    star: 0x1d100c,
    rim: 0x321b13,
    vignette: 'rgba(20,8,5,0.28)',
  }),
  bamboo: Object.freeze({
    colors: ['#ecd994', '#d7bd6f', '#b9954d'],
    grainDark: '#8a6a32',
    grainLight: '#fff4bf',
    grid: 0x5d4925,
    star: 0x55411e,
    rim: 0x80602c,
    vignette: 'rgba(91,63,19,0.13)',
  }),
  slate: Object.freeze({
    colors: ['#8c9a99', '#657575', '#485958'],
    grainDark: '#263737',
    grainLight: '#c7d4d1',
    grid: 0x273433,
    star: 0x202c2b,
    rim: 0x334543,
    vignette: 'rgba(12,25,25,0.24)',
  }),
});

const STONE_STYLES = Object.freeze({
  classic: Object.freeze({
    black: ['#66706a', '#28302d', '#101512', '#050806'],
    white: ['#ffffff', '#f7f2e9', '#d9d4ca', '#a9a59f'],
    blackStroke: 'rgba(255,255,255,0.12)',
    whiteStroke: 'rgba(65,50,30,0.2)',
    shadow: 0x28170e,
  }),
  jade: Object.freeze({
    black: ['#8cc5a4', '#2d6c50', '#123d2c', '#072219'],
    white: ['#f5fff5', '#d9efdc', '#a9ceb1', '#73987c'],
    blackStroke: 'rgba(205,255,220,0.2)',
    whiteStroke: 'rgba(28,90,48,0.25)',
    shadow: 0x163426,
  }),
  ocean: Object.freeze({
    black: ['#86b9dd', '#285e88', '#112f50', '#07172d'],
    white: ['#f7fdff', '#d9f3fb', '#9bcbdc', '#6393aa'],
    blackStroke: 'rgba(190,230,255,0.22)',
    whiteStroke: 'rgba(22,70,100,0.25)',
    shadow: 0x102c42,
  }),
  ruby: Object.freeze({
    black: ['#d99891', '#7f302f', '#48191d', '#240a0e'],
    white: ['#fffaf2', '#f5ded1', '#d9ae9d', '#a9776d'],
    blackStroke: 'rgba(255,205,195,0.2)',
    whiteStroke: 'rgba(95,32,30,0.22)',
    shadow: 0x421719,
  }),
});

function makeCanvasTexture(draw, width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createBoardTexture(styleKey) {
  const style = BOARD_STYLES[styleKey] ?? BOARD_STYLES.kaya;
  return makeCanvasTexture((context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, style.colors[0]);
    gradient.addColorStop(0.48, style.colors[1]);
    gradient.addColorStop(1, style.colors[2]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = styleKey === 'slate' ? 0.08 : 0.14;
    for (let index = 0; index < 82; index += 1) {
      const y = ((index + 0.5) / 82) * height + Math.sin(index * 2.1) * 2;
      const amplitude = 3 + ((index * 7) % 9);
      context.beginPath();
      context.strokeStyle = index % 3 ? style.grainDark : style.grainLight;
      context.lineWidth = 0.55 + (index % 4) * 0.28;
      context.moveTo(0, y);
      for (let x = 0; x <= width; x += 16) {
        context.lineTo(x, y + Math.sin(x * 0.026 + index) * amplitude);
      }
      context.stroke();
    }
    context.globalAlpha = 1;

    const vignette = context.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.75);
    vignette.addColorStop(0, 'rgba(255,255,255,0.05)');
    vignette.addColorStop(1, style.vignette);
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  });
}

function createStoneTexture(color, styleKey) {
  const style = STONE_STYLES[styleKey] ?? STONE_STYLES.classic;
  const stops = color === BLACK ? style.black : style.white;
  return makeCanvasTexture((context, width, height) => {
    context.clearRect(0, 0, width, height);
    const center = width / 2;
    const gradient = context.createRadialGradient(
      center * 0.72,
      center * 0.67,
      width * 0.035,
      center,
      center,
      width * 0.48,
    );
    gradient.addColorStop(0, stops[0]);
    gradient.addColorStop(0.22, stops[1]);
    gradient.addColorStop(0.72, stops[2]);
    gradient.addColorStop(1, stops[3]);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(center, center, width * 0.47, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = color === BLACK ? style.blackStroke : style.whiteStroke;
    context.lineWidth = width * 0.012;
    context.stroke();
  }, 256, 256);
}

function starPointsFor(size) {
  if (size === 9) return [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];
  if (size === 13) return [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]];
  return [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
  ];
}

export class BoardView {
  constructor(container) {
    this.container = container;
    this.size = 13;
    this.spacing = (GRID_HALF * 2) / (this.size - 1);
    this.boardStyleKey = 'kaya';
    this.stoneStyleKey = 'classic';
    this.stoneMeshes = new Map();
    this.animations = [];
    this.interactive = false;
    this.interactionColor = BLACK;
    this.legalCheck = null;
    this.onPoint = null;
    this.hoverPoint = null;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-CAMERA_SIZE, CAMERA_SIZE, CAMERA_SIZE, -CAMERA_SIZE, 0.1, 100);
    this.camera.position.set(0, 0, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.setAttribute('aria-label', 'Interactive Go board');
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.boardGroup = new THREE.Group();
    this.scene.add(this.boardGroup);

    this.blackTexture = createStoneTexture(BLACK, this.stoneStyleKey);
    this.whiteTexture = createStoneTexture(WHITE, this.stoneStyleKey);
    this.woodTexture = createBoardTexture(this.boardStyleKey);

    this.ghost = this.#createStoneMesh(BLACK, true);
    this.ghost.visible = false;
    this.scene.add(this.ghost);

    this.lastMoveMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.13, 0.21, 32),
      new THREE.MeshBasicMaterial({ color: 0xd49b47, transparent: true, opacity: 0.95, depthTest: false }),
    );
    this.lastMoveMarker.position.z = 0.32;
    this.lastMoveMarker.visible = false;
    this.scene.add(this.lastMoveMarker);

    this.#buildBoard();
    this.#bindEvents();
    this.resizeObserver = new ResizeObserver(() => this.#resize());
    this.resizeObserver.observe(container);
    this.#animate();
  }

  setSize(size) {
    this.size = size;
    this.spacing = (GRID_HALF * 2) / (size - 1);
    this.stoneMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.stoneMeshes.clear();
    this.#replaceGhost();
    this.#buildGrid();
    this.setInteractive(false);
  }

  setAppearance(boardStyleKey = 'kaya', stoneStyleKey = 'classic') {
    const nextBoardStyle = BOARD_STYLES[boardStyleKey] ? boardStyleKey : 'kaya';
    const nextStoneStyle = STONE_STYLES[stoneStyleKey] ? stoneStyleKey : 'classic';

    if (nextBoardStyle !== this.boardStyleKey) {
      this.boardStyleKey = nextBoardStyle;
      this.woodTexture.dispose();
      this.woodTexture = createBoardTexture(this.boardStyleKey);
      this.hitPlane.material.map = this.woodTexture;
      this.hitPlane.material.needsUpdate = true;
      this.rim.material.color.setHex(BOARD_STYLES[this.boardStyleKey].rim);
      this.#buildGrid();
    }

    if (nextStoneStyle !== this.stoneStyleKey) {
      this.stoneStyleKey = nextStoneStyle;
      this.blackTexture.dispose();
      this.whiteTexture.dispose();
      this.blackTexture = createStoneTexture(BLACK, this.stoneStyleKey);
      this.whiteTexture = createStoneTexture(WHITE, this.stoneStyleKey);
      const shadowColor = STONE_STYLES[this.stoneStyleKey].shadow;
      this.stoneMeshes.forEach((mesh) => {
        mesh.userData.face.material.map = mesh.userData.color === BLACK ? this.blackTexture : this.whiteTexture;
        mesh.userData.face.material.needsUpdate = true;
        mesh.userData.shadow.material.color.setHex(shadowColor);
      });
      this.#replaceGhost();
    }
  }

  setCanvasLabel(label) {
    this.renderer.domElement.setAttribute('aria-label', label);
  }

  setInteractive(enabled, color = BLACK, legalCheck = null) {
    this.interactive = enabled;
    this.interactionColor = color;
    this.legalCheck = legalCheck;
    this.renderer.domElement.classList.toggle('is-interactive', enabled);
    if (!enabled) this.#hideGhost();
  }

  sync(board, lastMove = null, animateIndex = null) {
    const occupied = new Set();
    for (let index = 0; index < board.length; index += 1) {
      const color = board[index];
      if (color === EMPTY) continue;
      occupied.add(index);
      const current = this.stoneMeshes.get(index);
      if (current?.userData.color === color) continue;
      if (current) this.scene.remove(current);

      const mesh = this.#createStoneMesh(color);
      const { x, y } = this.#coordinatesForIndex(index);
      mesh.position.set(x, y, 0.16);
      mesh.userData.color = color;
      if (animateIndex === index) {
        mesh.scale.setScalar(0.12);
        this.animations.push({ mesh, start: performance.now(), duration: 180 });
      }
      this.scene.add(mesh);
      this.stoneMeshes.set(index, mesh);
    }

    for (const [index, mesh] of this.stoneMeshes) {
      if (!occupied.has(index)) {
        this.scene.remove(mesh);
        this.stoneMeshes.delete(index);
      }
    }

    if (lastMove) {
      const index = lastMove.row * this.size + lastMove.col;
      const { x, y } = this.#coordinatesForIndex(index);
      this.lastMoveMarker.position.x = x;
      this.lastMoveMarker.position.y = y;
      this.lastMoveMarker.material.color.set(lastMove.color === BLACK ? 0xf3c26f : 0x805522);
      this.lastMoveMarker.visible = board[index] !== EMPTY;
    } else {
      this.lastMoveMarker.visible = false;
    }
  }

  #replaceGhost() {
    this.scene.remove(this.ghost);
    this.ghost = this.#createStoneMesh(this.interactionColor, true);
    this.ghost.visible = false;
    this.scene.add(this.ghost);
  }

  #buildBoard() {
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(BOARD_SIZE + 0.9, BOARD_SIZE + 0.9),
      new THREE.MeshBasicMaterial({ color: 0x050806, transparent: true, opacity: 0.25 }),
    );
    shadow.position.set(0.22, -0.28, -0.08);
    this.boardGroup.add(shadow);

    this.base = new THREE.Mesh(
      new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE),
      new THREE.MeshBasicMaterial({ map: this.woodTexture, color: 0xffffff }),
    );
    this.base.position.z = 0;
    this.boardGroup.add(this.base);
    this.hitPlane = this.base;

    this.rim = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE)),
      new THREE.LineBasicMaterial({ color: BOARD_STYLES[this.boardStyleKey].rim, transparent: true, opacity: 0.72 }),
    );
    this.rim.position.z = 0.015;
    this.boardGroup.add(this.rim);

    this.gridGroup = new THREE.Group();
    this.boardGroup.add(this.gridGroup);
    this.#buildGrid();
  }

  #buildGrid() {
    if (!this.gridGroup) return;
    while (this.gridGroup.children.length) {
      const child = this.gridGroup.children.pop();
      child.geometry?.dispose();
      child.material?.dispose();
    }

    const style = BOARD_STYLES[this.boardStyleKey];
    const positions = [];
    for (let index = 0; index < this.size; index += 1) {
      const coordinate = -GRID_HALF + index * this.spacing;
      positions.push(-GRID_HALF, coordinate, 0.035, GRID_HALF, coordinate, 0.035);
      positions.push(coordinate, -GRID_HALF, 0.035, coordinate, GRID_HALF, 0.035);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const grid = new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({ color: style.grid, transparent: true, opacity: 0.78 }),
    );
    this.gridGroup.add(grid);

    const pointRadius = Math.max(0.085, this.spacing * 0.095);
    for (const [row, col] of starPointsFor(this.size)) {
      const point = new THREE.Mesh(
        new THREE.CircleGeometry(pointRadius, 24),
        new THREE.MeshBasicMaterial({ color: style.star }),
      );
      const { x, y } = this.#coordinates(row, col);
      point.position.set(x, y, 0.05);
      this.gridGroup.add(point);
    }
  }

  #createStoneMesh(color, ghost = false) {
    const radius = Math.min(this.spacing * 0.46, 0.7);
    const group = new THREE.Group();
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.98, 48),
      new THREE.MeshBasicMaterial({
        color: STONE_STYLES[this.stoneStyleKey].shadow,
        transparent: true,
        opacity: ghost ? 0.05 : 0.23,
        depthWrite: false,
      }),
    );
    shadow.position.set(radius * 0.09, -radius * 0.11, -0.025);
    group.add(shadow);

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2.12, radius * 2.12),
      new THREE.MeshBasicMaterial({
        map: color === BLACK ? this.blackTexture : this.whiteTexture,
        transparent: true,
        opacity: ghost ? 0.5 : 1,
        depthWrite: !ghost,
      }),
    );
    group.add(face);
    group.userData.color = color;
    group.userData.face = face;
    group.userData.shadow = shadow;
    return group;
  }

  #updateGhostColor(color) {
    if (this.ghost.userData.color === color) return;
    this.ghost.userData.color = color;
    this.ghost.userData.face.material.map = color === BLACK ? this.blackTexture : this.whiteTexture;
    this.ghost.userData.face.material.needsUpdate = true;
  }

  #coordinates(row, col) {
    return {
      x: -GRID_HALF + col * this.spacing,
      y: GRID_HALF - row * this.spacing,
    };
  }

  #coordinatesForIndex(index) {
    return this.#coordinates(Math.floor(index / this.size), index % this.size);
  }

  #pointFromEvent(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.hitPlane, false)[0];
    if (!hit) return null;

    const col = Math.round((hit.point.x + GRID_HALF) / this.spacing);
    const row = Math.round((GRID_HALF - hit.point.y) / this.spacing);
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return null;
    const target = this.#coordinates(row, col);
    const distance = Math.hypot(hit.point.x - target.x, hit.point.y - target.y);
    if (distance > this.spacing * 0.48) return null;
    return { row, col, ...target };
  }

  #bindEvents() {
    this.renderer.domElement.addEventListener('pointermove', (event) => {
      if (!this.interactive) return;
      const point = this.#pointFromEvent(event);
      if (!point || (this.legalCheck && !this.legalCheck(point.row, point.col))) {
        this.#hideGhost();
        return;
      }
      this.#updateGhostColor(this.interactionColor);
      this.ghost.position.set(point.x, point.y, 0.25);
      this.ghost.visible = true;
      this.hoverPoint = point;
    });

    this.renderer.domElement.addEventListener('pointerleave', () => this.#hideGhost());
    this.renderer.domElement.addEventListener('pointerdown', (event) => {
      if (!this.interactive) return;
      const point = this.#pointFromEvent(event);
      if (!point || (this.legalCheck && !this.legalCheck(point.row, point.col))) return;
      this.onPoint?.(point.row, point.col);
      this.#hideGhost();
    });
  }

  #hideGhost() {
    this.ghost.visible = false;
    this.hoverPoint = null;
  }

  #resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    const aspect = width / height;
    if (aspect >= 1) {
      this.camera.left = -CAMERA_SIZE * aspect;
      this.camera.right = CAMERA_SIZE * aspect;
      this.camera.top = CAMERA_SIZE;
      this.camera.bottom = -CAMERA_SIZE;
    } else {
      this.camera.left = -CAMERA_SIZE;
      this.camera.right = CAMERA_SIZE;
      this.camera.top = CAMERA_SIZE / aspect;
      this.camera.bottom = -CAMERA_SIZE / aspect;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  #animate() {
    requestAnimationFrame(() => this.#animate());
    const now = performance.now();
    this.animations = this.animations.filter((animation) => {
      const progress = Math.min(1, (now - animation.start) / animation.duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const overshoot = progress < 0.72 ? eased * 1.08 : 1 + (1 - progress) * 0.08;
      animation.mesh.scale.setScalar(overshoot);
      if (progress >= 1) animation.mesh.scale.setScalar(1);
      return progress < 1;
    });
    if (this.lastMoveMarker.visible) {
      const pulse = 1 + Math.sin(now * 0.004) * 0.08;
      this.lastMoveMarker.scale.setScalar(pulse);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
