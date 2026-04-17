/**
 * TerraLens — 3D Globe Module
 * Three.js based interactive Earth visualization
 */

import * as THREE from 'three';
import { hotspots, layerColors, connectionArcs } from './data.js';

let scene, camera, renderer, earth, clouds, atmosphere, pointLight, ambientLight;
let earthGroup, markers = [];
let raycaster, mouse;
let isUserInteracting = false;
let autoRotateSpeed = 0.0008;
let targetRotationX = 0;
let targetRotationY = 0;
let currentLayer = 'emissions';
let onHotspotClick = null;
let animationFrameId = null;

// Marker meshes by layer
let markerGroups = {};

const EARTH_RADIUS = 5;

export function initGlobe(container, hotspotClickCallback) {
  onHotspotClick = hotspotClickCallback;
  
  // Scene
  scene = new THREE.Scene();
  
  // Camera  
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 16;

  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NoToneMapping;
  container.appendChild(renderer.domElement);

  // Lights — bright enough to clearly see the globe
  ambientLight = new THREE.AmbientLight(0x8899bb, 2.5);
  scene.add(ambientLight);

  pointLight = new THREE.DirectionalLight(0xffffff, 3.0);
  pointLight.position.set(10, 8, 12);
  scene.add(pointLight);

  // Secondary fill light from the side
  const fillLight = new THREE.DirectionalLight(0xaaccff, 1.2);
  fillLight.position.set(-8, 4, -6);
  scene.add(fillLight);

  // Subtle backlight for rim effect
  const backLight = new THREE.PointLight(0x4488ff, 1.0, 100);
  backLight.position.set(-10, -5, -15);
  scene.add(backLight);

  // Earth group (for unified rotation)
  earthGroup = new THREE.Group();
  scene.add(earthGroup);

  // Create Earth
  createEarth();
  createAtmosphere();
  createStars();
  createHotspotMarkers();

  // Raycaster for interactions
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Event listeners
  setupInteraction(container);

  // Start animation loop
  animate();

  // Handle resize
  window.addEventListener('resize', onResize);
}

function createEarth() {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  
  // Use procedural texturing since we don't have image textures
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Deep ocean base — bright enough to be clearly visible
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a4a7a');
  gradient.addColorStop(0.1, '#1565a8');
  gradient.addColorStop(0.2, '#1976c0');
  gradient.addColorStop(0.35, '#1e88d0');
  gradient.addColorStop(0.5, '#2196e0');
  gradient.addColorStop(0.65, '#1e88d0');
  gradient.addColorStop(0.8, '#1976c0');
  gradient.addColorStop(0.9, '#1565a8');
  gradient.addColorStop(1, '#1a4a7a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add continent shapes (simplified but recognizable)
  ctx.fillStyle = '#2d8a3e';
  ctx.strokeStyle = '#1f6b2c';
  ctx.lineWidth = 2;
  
  // Draw continents using simplified polygons
  drawContinents(ctx, canvas.width, canvas.height);
  
  // Add noise texture for detail
  addNoiseTexture(ctx, canvas.width, canvas.height);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    bumpScale: 0.05,
    specular: new THREE.Color(0x333333),
    shininess: 15,
  });

  earth = new THREE.Mesh(geometry, material);
  earthGroup.add(earth);

  // Clouds layer
  const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.008, 48, 48);
  const cloudCanvas = createCloudTexture();
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });

  clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earthGroup.add(clouds);
}

function drawContinents(ctx, w, h) {
  // Helper: convert lat/lng to canvas x/y
  const toXY = (lat, lng) => {
    const x = ((lng + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    return [x, y];
  };

  const drawLandmass = (points, color = '#2d8a3e') => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const [sx, sy] = toXY(points[0][0], points[0][1]);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < points.length; i++) {
      const [x, y] = toXY(points[i][0], points[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  // North America
  drawLandmass([
    [70, -165], [72, -130], [70, -100], [65, -85], [60, -80], [55, -65],
    [48, -55], [44, -66], [42, -70], [30, -82], [26, -80], [25, -98],
    [20, -105], [15, -92], [15, -88], [18, -88], [20, -87], [21, -87],
    [30, -115], [35, -120], [40, -125], [48, -125], [55, -133], [60, -145],
    [65, -168], [70, -165]
  ], '#2d9440');

  // South America
  drawLandmass([
    [12, -73], [10, -62], [7, -55], [2, -50], [-5, -35], [-10, -37],
    [-15, -40], [-22, -41], [-25, -47], [-33, -52], [-40, -62], [-45, -65],
    [-53, -70], [-55, -68], [-50, -75], [-42, -73], [-35, -72], [-25, -70],
    [-15, -76], [-5, -81], [2, -78], [8, -77], [12, -73]
  ], '#30a050');

  // Africa
  drawLandmass([
    [37, -10], [37, 10], [33, 12], [30, 32], [22, 36], [12, 44],
    [5, 42], [0, 42], [-5, 40], [-12, 40], [-15, 37], [-20, 35],
    [-25, 33], [-30, 30], [-34, 27], [-35, 20], [-30, 17], [-25, 15],
    [-20, 12], [-10, 14], [-5, 10], [3, 10], [5, 0], [5, -5], [10, -15],
    [15, -17], [20, -17], [25, -15], [30, -10], [35, -5], [37, -10]
  ], '#2d8a3e');

  // Europe
  drawLandmass([
    [40, -10], [43, 0], [46, 3], [48, -5], [52, 0], [54, 8], [55, 12],
    [58, 10], [60, 5], [63, 10], [65, 14], [68, 16], [70, 25], [70, 40],
    [65, 40], [60, 30], [55, 28], [55, 22], [50, 22], [48, 18], [47, 20],
    [44, 15], [42, 18], [40, 25], [37, 28], [36, 22], [38, 13], [38, 5],
    [36, -5], [37, -8], [40, -10]
  ], '#258035');

  // Asia
  drawLandmass([
    [70, 40], [72, 60], [72, 80], [73, 100], [75, 120], [72, 140],
    [65, 165], [60, 165], [55, 140], [50, 135], [42, 132], [35, 130],
    [32, 132], [30, 122], [22, 114], [20, 110], [10, 106], [5, 104],
    [1, 104], [8, 80], [15, 75], [22, 72], [25, 68], [30, 68], [28, 65],
    [25, 57], [25, 50], [27, 50], [30, 48], [35, 35], [40, 43],
    [42, 45], [50, 55], [52, 56], [55, 68], [55, 60], [60, 60],
    [65, 40], [70, 40]
  ], '#258035');

  // Australia
  drawLandmass([
    [-12, 132], [-14, 127], [-22, 114], [-25, 114], [-32, 116],
    [-35, 118], [-35, 137], [-38, 146], [-37, 150], [-33, 152],
    [-28, 154], [-24, 152], [-20, 149], [-16, 146], [-14, 142],
    [-12, 137], [-12, 132]
  ], '#3da050');

  // Greenland
  drawLandmass([
    [76, -70], [78, -60], [80, -40], [82, -30], [80, -20],
    [75, -18], [70, -22], [65, -40], [62, -48], [65, -55],
    [70, -55], [73, -60], [76, -70]
  ], '#f0f5f8');

  // Ice caps
  // Antarctica
  ctx.fillStyle = '#eef4fa';
  ctx.fillRect(0, h * 0.9, w, h * 0.1);

  // Earth tone highlands / desert regions
  // Sahara
  drawLandmass([
    [30, -10], [33, 0], [33, 10], [30, 32], [22, 36], [15, 20],
    [15, 0], [20, -15], [25, -15], [30, -10]
  ], '#c4a46a');
  
  // Arabian Peninsula
  drawLandmass([
    [28, 35], [25, 36], [15, 43], [12, 44], [13, 48], [17, 55],
    [22, 55], [26, 50], [30, 48], [28, 35]
  ], '#d4b47a');

  // Central Asia steppes
  drawLandmass([
    [45, 52], [50, 55], [50, 68], [45, 80], [38, 75], [35, 62],
    [38, 55], [45, 52]
  ], '#9ab068');
}

function addNoiseTexture(ctx, w, h) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Transparent base
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create cloud-like patterns
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 40 + 10;
    const alpha = Math.random() * 0.15 + 0.05;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  return canvas;
}

function createAtmosphere() {
  // Inner glow
  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 48, 48);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  earthGroup.add(atmosphere);

  // Outer glow
  const outerGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.25, 48, 48);
  const outerMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
        gl_FragColor = vec4(0.2, 0.5, 1.0, 0.4) * intensity;
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  const outerAtmosphere = new THREE.Mesh(outerGeometry, outerMaterial);
  earthGroup.add(outerAtmosphere);
}

function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  
  for (let i = 0; i < starCount; i++) {
    const r = 80 + Math.random() * 120;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = Math.random() * 1.5 + 0.5;
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createHotspotMarkers() {
  const categories = ['emissions', 'deforestation', 'ocean', 'biodiversity'];
  
  categories.forEach(cat => {
    const group = new THREE.Group();
    markerGroups[cat] = group;
    earthGroup.add(group);
    
    const catHotspots = hotspots.filter(h => h.category === cat);
    
    catHotspots.forEach(hotspot => {
      const { lat, lng, severity } = hotspot;
      const position = latLngToVector3(lat, lng, EARTH_RADIUS * 1.01);
      
      // Marker dot — larger for easier clicking
      const dotGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const color = layerColors[cat][severity];
      const dotMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.copy(position);
      dot.userData = { hotspot };
      group.add(dot);
      markers.push(dot);
      
      // Pulsing ring
      const ringGeometry = new THREE.RingGeometry(0.14, 0.2, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(position);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulsePhase: Math.random() * Math.PI * 2 };
      group.add(ring);
      
      // Vertical beam
      const beamGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.4, 8);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      const beamPos = latLngToVector3(lat, lng, EARTH_RADIUS * 1.21);
      beam.position.copy(beamPos);
      beam.lookAt(new THREE.Vector3(0, 0, 0));
      beam.rotateX(Math.PI / 2);
      group.add(beam);
    });
    
    // Set initial visibility
    group.visible = cat === currentLayer;
  });
}

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function setupInteraction(container) {
  let isDragging = false;
  let previousMouse = { x: 0, y: 0 };
  let rotationVelocity = { x: 0, y: 0 };

  container.addEventListener('pointerdown', (e) => {
    isDragging = true;
    isUserInteracting = true;
    previousMouse = { x: e.clientX, y: e.clientY };
    rotationVelocity = { x: 0, y: 0 };
    container.style.cursor = 'grabbing';
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - previousMouse.x;
    const deltaY = e.clientY - previousMouse.y;
    
    targetRotationY += deltaX * 0.005;
    targetRotationX += deltaY * 0.005;
    
    // Clamp vertical rotation
    targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
    
    rotationVelocity = { x: deltaY * 0.005, y: deltaX * 0.005 };
    previousMouse = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('pointerup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
    // Resume auto-rotation after a delay
    setTimeout(() => { isUserInteracting = false; }, 3000);
  });

  container.addEventListener('pointerleave', () => {
    isDragging = false;
    container.style.cursor = 'default';
    setTimeout(() => { isUserInteracting = false; }, 3000);
  });

  // Zoom with scroll
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.5;
    camera.position.z = Math.max(10, Math.min(25, camera.position.z + e.deltaY * 0.01 * zoomSpeed));
  }, { passive: false });

  // Click on hotspots
  container.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const visibleMarkers = markers.filter(m => {
      const group = markerGroups[m.userData.hotspot.category];
      return group && group.visible;
    });
    
    const intersects = raycaster.intersectObjects(visibleMarkers);
    
    if (intersects.length > 0) {
      const hotspot = intersects[0].object.userData.hotspot;
      const screenPos = getScreenPosition(intersects[0].object.position);
      
      if (onHotspotClick) {
        onHotspotClick(hotspot, screenPos);
      }
    }
  });

  container.style.cursor = 'grab';
}

function getScreenPosition(worldPos) {
  const vector = worldPos.clone();
  vector.applyMatrix4(earthGroup.matrixWorld);
  vector.project(camera);
  
  return {
    x: (vector.x * 0.5 + 0.5) * window.innerWidth,
    y: (-(vector.y * 0.5) + 0.5) * window.innerHeight
  };
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  const time = Date.now() * 0.001;
  
  // Auto-rotate
  if (!isUserInteracting) {
    targetRotationY += autoRotateSpeed;
  }
  
  // Smooth rotation
  earthGroup.rotation.y += (targetRotationY - earthGroup.rotation.y) * 0.05;
  earthGroup.rotation.x += (targetRotationX - earthGroup.rotation.x) * 0.05;
  
  // Cloud rotation (slightly different speed)
  if (clouds) {
    clouds.rotation.y += 0.0001;
  }
  
  // Pulse markers
  Object.values(markerGroups).forEach(group => {
    group.children.forEach(child => {
      if (child.userData.pulsePhase !== undefined) {
        const pulse = Math.sin(time * 2 + child.userData.pulsePhase) * 0.3 + 0.7;
        child.material.opacity = pulse * 0.6;
        const scale = 1 + Math.sin(time * 1.5 + child.userData.pulsePhase) * 0.3;
        child.scale.setScalar(scale);
      }
    });
  });
  
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function setLayer(layer) {
  currentLayer = layer;
  Object.keys(markerGroups).forEach(key => {
    markerGroups[key].visible = key === layer;
  });
}

export function focusOnCoordinates(lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  targetRotationY = -theta + Math.PI;
  targetRotationX = -(phi - Math.PI / 2);
  targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
  
  isUserInteracting = true;
  setTimeout(() => { isUserInteracting = false; }, 5000);
}

export function getProgressCallback() {
  return (progress) => {
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = progress + '%';
  };
}
