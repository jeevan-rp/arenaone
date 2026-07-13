import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { stateManager } from './state.js';
import { showToast } from './app.js';

/* ============================
   THREE.JS — 3D DIGITAL TWIN
   ============================ */
let scene, camera, renderer, controls, crowdParticles, stadiumGroup, crowdMat;
let fullScene, fullCamera, fullRenderer, fullControls, fullCrowdParticles, fullCrowdMat;
let threeInit = false;
let fullThreeInit = false;

// Global uniform targets for smooth GPU color interpolation
const activeTargetUniforms = {
  primary: new THREE.Color(0x00f0ff),
  secondary: new THREE.Color(0x00ff88),
  interp: 0.0
};

// Listen to view changes to change particle colors on the GPU dynamically
stateManager.subscribe('currentView', (view) => {
  if (view === 'security') {
    activeTargetUniforms.primary.setHex(0xff3860); // Red
    activeTargetUniforms.secondary.setHex(0xffb800); // Amber
    activeTargetUniforms.interp = 0.8;
  } else if (view === 'emergency') {
    activeTargetUniforms.primary.setHex(0xff3860); // Red
    activeTargetUniforms.secondary.setHex(0xffffff); // White
    activeTargetUniforms.interp = 0.9;
  } else if (view === 'sustainability') {
    activeTargetUniforms.primary.setHex(0x00ff88); // Green
    activeTargetUniforms.secondary.setHex(0xadff2f); // Neon green
    activeTargetUniforms.interp = 0.7;
  } else {
    activeTargetUniforms.primary.setHex(0x00f0ff); // Cyan
    activeTargetUniforms.secondary.setHex(0x00ff88); // Green
    activeTargetUniforms.interp = 0.0; // Blend out event color
  }
});

const vertexShader = `
  uniform float uTime;
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;
  uniform float uColorInterpolation;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    // Interpolate default base color with active dynamic palette colors directly on GPU
    vec3 eventColor = mix(uPrimaryColor, uSecondaryColor, sin(uTime * 0.5) * 0.5 + 0.5);
    vColor = mix(color, eventColor, uColorInterpolation);
    
    vec3 pos = position;
    pos.y += sin(uTime + pos.x * 0.2 + pos.z * 0.2) * 0.25;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 6.0 * (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    vec2 circCoord = gl_PointCoord - vec2(0.5);
    if (dot(circCoord, circCoord) > 0.25) {
      discard;
    }
    gl_FragColor = vec4(vColor, 0.85);
  }
`;

function runWebGLBoundary(operation, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Error Boundary - WebGL] Error in "${operation}":`, error);
  }
}

function displayRecoveryOverlay(containerId, show) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let overlay = container.querySelector('.webgl-recovery-overlay');
  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'webgl-recovery-overlay absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center z-40 p-4 transition-all duration-300';
      overlay.innerHTML = `
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan mb-4"></div>
        <div class="text-sm font-semibold text-white mb-1">3D Graphics Context Lost</div>
        <div class="text-xs text-slate-400">Rebuilding WebGL graphics pipelines, please wait...</div>
      `;
      container.appendChild(overlay);
    }
  } else if (overlay) {
    overlay.remove();
  }
}

export function init3D() {
  if (threeInit) return;
  const container = document.getElementById('three-container');
  if (!container) return;
  const w = container.clientWidth, h = container.clientHeight;
  if (w < 10 || h < 10) {
    setTimeout(init3D, 200);
    return;
  }
  threeInit = true;

  runWebGLBoundary('init3D scene assembly', () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b18, 0.012);

    camera = new THREE.PerspectiveCamera(40, w / Math.max(h, 1), 0.1, 500);
    camera.position.set(0, 35, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x060b18, 1);
    
    // Clear previous canvases if any to prevent memory leaks
    container.querySelectorAll('canvas').forEach(c => c.remove());
    container.appendChild(renderer.domElement);

    // Context loss listeners
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[WebGL] Command view context lost!');
      showToast('WebGL Graphics context lost. Rebuilding...', 'warning');
      displayRecoveryOverlay('three-container', true);
    });

    renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('[WebGL] Command view context restored!');
      displayRecoveryOverlay('three-container', false);
      threeInit = false;
      init3D();
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 20;
    controls.maxDistance = 80;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    scene.add(new THREE.AmbientLight(0x112244, 0.8));
    const cyanLight = new THREE.PointLight(0x00f0ff, 3, 80);
    cyanLight.position.set(0, 25, 0);
    scene.add(cyanLight);

    stadiumGroup = new THREE.Group();
    scene.add(stadiumGroup);

    // Field
    const fieldGeo = new THREE.EllipseCurve(0, 0, 16, 11, 0, Math.PI * 2, false, 0);
    const fieldPoints = fieldGeo.getPoints(64);
    const fieldShape = new THREE.Shape(fieldPoints.map(p => new THREE.Vector2(p.x, p.y)));
    const fieldMesh = new THREE.Mesh(new THREE.ShapeGeometry(fieldShape), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
    fieldMesh.rotation.x = -Math.PI / 2;
    fieldMesh.position.y = 0.1;
    stadiumGroup.add(fieldMesh);

    // Seating Tori rings
    const lowerGeo = new THREE.TorusGeometry(22, 3, 8, 64);
    const lowerMesh = new THREE.Mesh(lowerGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
    lowerMesh.rotation.x = Math.PI / 2;
    lowerMesh.position.y = 5;
    stadiumGroup.add(lowerMesh);

    // Crowd particles with ShaderMaterial & dynamic color uniforms
    const crowdCount = 6000;
    const crowdGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(crowdCount * 3);
    const colors = new Float32Array(crowdCount * 3);
    const cGreen = new THREE.Color(0x00ff88);
    const cAmber = new THREE.Color(0xffb800);
    const cRed = new THREE.Color(0xff3860);

    for (let i = 0; i < crowdCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const tier = Math.random() > 0.6 ? 'upper' : 'lower';
      const r = tier === 'upper' ? 27 + Math.random() * 5 : 20 + Math.random() * 3;
      const y = tier === 'upper' ? 10 + Math.random() * 5 : 3 + Math.random() * 4;
      positions[i*3] = Math.cos(angle) * r;
      positions[i*3+1] = y;
      positions[i*3+2] = Math.sin(angle) * r;

      const density = Math.random();
      let col = density > 0.8 ? cRed : density > 0.5 ? cAmber : cGreen;
      colors[i*3] = col.r;
      colors[i*3+1] = col.g;
      colors[i*3+2] = col.b;
    }
    crowdGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    crowdGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    crowdMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uPrimaryColor: { value: new THREE.Color(activeTargetUniforms.primary) },
        uSecondaryColor: { value: new THREE.Color(activeTargetUniforms.secondary) },
        uColorInterpolation: { value: activeTargetUniforms.interp }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false
    });

    crowdParticles = new THREE.Points(crowdGeo, crowdMat);
    stadiumGroup.add(crowdParticles);

    animate3D();
  });
}

export function animate3D(time = 0) {
  requestAnimationFrame(animate3D);
  if (!renderer || !scene || !camera) return;

  runWebGLBoundary('animate3D cycle', () => {
    controls.update();

    if (crowdMat) {
      crowdMat.uniforms.uTime.value = time * 0.002;
      // Smooth interpolation in animation loop
      crowdMat.uniforms.uColorInterpolation.value += (activeTargetUniforms.interp - crowdMat.uniforms.uColorInterpolation.value) * 0.05;
      crowdMat.uniforms.uPrimaryColor.value.lerp(activeTargetUniforms.primary, 0.05);
      crowdMat.uniforms.uSecondaryColor.value.lerp(activeTargetUniforms.secondary, 0.05);
    }

    renderer.render(scene, camera);
  });
}

export function initFull3D() {
  if (fullThreeInit) return;
  const container = document.getElementById('three-container-full');
  if (!container) return;
  const w = container.clientWidth, h = container.clientHeight;
  if (w < 10 || h < 10) {
    setTimeout(initFull3D, 200);
    return;
  }
  fullThreeInit = true;

  runWebGLBoundary('initFull3D scene assembly', () => {
    fullScene = new THREE.Scene();
    fullScene.fog = new THREE.FogExp2(0x060b18, 0.008);

    fullCamera = new THREE.PerspectiveCamera(35, w / Math.max(h, 1), 0.1, 500);
    fullCamera.position.set(0, 45, 60);

    fullRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    fullRenderer.setSize(w, h);
    fullRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    fullRenderer.setClearColor(0x060b18, 1);
    
    container.querySelectorAll('canvas').forEach(c => c.remove());
    container.appendChild(fullRenderer.domElement);

    fullRenderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[WebGL] Full view context lost!');
      showToast('WebGL Graphics context lost. Rebuilding...', 'warning');
      displayRecoveryOverlay('three-container-full', true);
    });

    fullRenderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('[WebGL] Full view context restored!');
      displayRecoveryOverlay('three-container-full', false);
      fullThreeInit = false;
      initFull3D();
    });

    fullControls = new OrbitControls(fullCamera, fullRenderer.domElement);
    fullControls.enableDamping = true;
    fullControls.dampingFactor = 0.05;
    fullControls.maxPolarAngle = Math.PI / 2.1;
    fullControls.minDistance = 15;
    fullControls.maxDistance = 120;
    fullControls.autoRotate = true;
    fullControls.autoRotateSpeed = 0.5;

    fullScene.add(new THREE.AmbientLight(0x112244, 1));
    
    const grp = new THREE.Group();
    fullScene.add(grp);

    const fc = 10000;
    const fcGeo = new THREE.BufferGeometry();
    const fcPos = new Float32Array(fc * 3);
    const fcCol = new Float32Array(fc * 3);
    for (let i = 0; i < fc; i++) {
      const a = Math.random() * Math.PI * 2;
      const upper = Math.random() > 0.5;
      const r = upper ? 27 + Math.random() * 5 : 20 + Math.random() * 3;
      fcPos[i*3] = Math.cos(a) * r;
      fcPos[i*3+1] = (upper ? 10 : 3) + Math.random() * 5;
      fcPos[i*3+2] = Math.sin(a) * r;
      const d = Math.random();
      const c = d > 0.8 ? new THREE.Color(0xff3860) : d > 0.5 ? new THREE.Color(0xffb800) : new THREE.Color(0x00ff88);
      fcCol[i*3] = c.r; fcCol[i*3+1] = c.g; fcCol[i*3+2] = c.b;
    }
    fcGeo.setAttribute('position', new THREE.BufferAttribute(fcPos, 3));
    fcGeo.setAttribute('color', new THREE.BufferAttribute(fcCol, 3));

    fullCrowdMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uPrimaryColor: { value: new THREE.Color(activeTargetUniforms.primary) },
        uSecondaryColor: { value: new THREE.Color(activeTargetUniforms.secondary) },
        uColorInterpolation: { value: activeTargetUniforms.interp }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false
    });

    fullCrowdParticles = new THREE.Points(fcGeo, fullCrowdMat);
    grp.add(fullCrowdParticles);

    function animFull(time = 0) {
      requestAnimationFrame(animFull);
      if (!fullRenderer) return;

      runWebGLBoundary('animFull cycle', () => {
        fullControls.update();
        if (fullCrowdMat) {
          fullCrowdMat.uniforms.uTime.value = time * 0.002;
          fullCrowdMat.uniforms.uColorInterpolation.value += (activeTargetUniforms.interp - fullCrowdMat.uniforms.uColorInterpolation.value) * 0.05;
          fullCrowdMat.uniforms.uPrimaryColor.value.lerp(activeTargetUniforms.primary, 0.05);
          fullCrowdMat.uniforms.uSecondaryColor.value.lerp(activeTargetUniforms.secondary, 0.05);
        }
        fullRenderer.render(fullScene, fullCamera);
      });
    }
    animFull();
  });
}

window.toggle3DLayer = function(layer) {
  window.showToast(`${layer.charAt(0).toUpperCase() + layer.slice(1)} layer toggled`, 'info');
};

// Automatic 3D initialization triggers
setTimeout(init3D, 2500);

/* ============================
   RESIZE & EVENT HANDLERS
   ============================ */
window.addEventListener('resize', () => {
  if (renderer && camera) {
    const container = document.getElementById('three-container');
    if (container) {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  }
  if (fullRenderer && fullCamera) {
    const container = document.getElementById('three-container-full');
    if (container) {
      const w = container.clientWidth, h = container.clientHeight;
      if (w > 10 && h > 10) {
        fullCamera.aspect = w / Math.max(h, 1);
        fullCamera.updateProjectionMatrix();
        fullRenderer.setSize(w, h);
      }
    }
  }
});

window.addEventListener('viewChanged', (e) => {
  const viewId = e.detail.viewId;
  if (viewId === 'digital-twin') initFull3D();
});
export { renderer, camera };
