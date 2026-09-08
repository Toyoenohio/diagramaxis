import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useProjectStore } from '../../store/useProjectStore';
import { CameraViewMode } from '../../types';
import { buildArchitecturalGeometry } from './GeometryBuilder';
import { createHumanFigure } from './HumanFigure';
import { captureCanvasPNG, exportMeshesToOBJ } from '../../utils/exportUtils';
import { Camera, Box, RotateCcw, PersonStanding } from 'lucide-react';
import { useTheme } from '../../theme';

/**
 * Resuelve un token de tema CSS (canales "r g b") a color number de THREE.
 * El visor lee del CSS para mantener una única fuente de verdad con el tema.
 */
function cssVarColorHex(varName: string, fallback: number): number {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parts = raw.split(/\s+/).map(Number);
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      return ((parts[0] & 0xff) << 16) | ((parts[1] & 0xff) << 8) | (parts[2] & 0xff);
    }
  } catch {
    /* noop */
  }
  return fallback;
}

const SCENE_BG_VAR = '--da-3d-bg';
const SCENE_GROUND_VAR = '--da-3d-ground';
const SCENE_GRID_MAJOR_VAR = '--da-3d-grid-major';
const SCENE_GRID_MINOR_VAR = '--da-3d-grid-minor';

export const Viewport3D: React.FC = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const volumeGroupRef = useRef<THREE.Group | null>(null);
  const groundGroupRef = useRef<THREE.Group | null>(null);
  const humanGroupRef = useRef<THREE.Group | null>(null);
  const windGroupRef = useRef<THREE.Group | null>(null);
  const mistGroupRef = useRef<THREE.Group | null>(null);
  const windParticlesRef = useRef<{ positions: Float32Array; speeds: Float32Array; geom: THREE.BufferGeometry } | null>(null);
  const mistParticlesRef = useRef<{ positions: Float32Array; geom: THREE.BufferGeometry } | null>(null);

  const [envInfo, setEnvInfo] = useState<{
    hasWind: boolean;
    windSpeed: number;
    hasHumidity: boolean;
    hasVegetation: boolean;
    hasTopography: boolean;
  }>({
    hasWind: false,
    windSpeed: 0,
    hasHumidity: false,
    hasVegetation: false,
    hasTopography: false,
  });

  // Fallo de WebGL (B3 auditoría): si no se puede crear el contexto, mostramos
  // un aviso y el tablero 2D sigue operativo en lugar de tumbar la app entera.
  const [webglFailed, setWebglFailed] = useState(false);

  // Estado de órbita / cámara
  const orbitRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    theta: 0.75,
    phi: 0.55,
    radius: 38,
    isInterior: false,
    eyePos: new THREE.Vector3(0, 1.75, 4),
    yaw: Math.PI,
    pitch: 0,
  });

  const {
    projectName,
    activeConcepts,
    activeArtifacts,
    nodeParams,
    baseDimensions,
    northRotation,
    cameraMode,
    shadingMode,
    showHumanFigure,
    setCameraMode,
    setShadingMode,
    toggleHumanFigure,
    showToast,
  } = useProjectStore();

  // Actualizar posición de la cámara según el modo
  const updateCameraPosition = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const orb = orbitRef.current;

    if (orb.isInterior) {
      camera.position.copy(orb.eyePos);
      const target = new THREE.Vector3(
        orb.eyePos.x + Math.sin(orb.yaw) * Math.cos(orb.pitch),
        orb.eyePos.y + Math.sin(orb.pitch),
        orb.eyePos.z + Math.cos(orb.yaw) * Math.cos(orb.pitch)
      );
      camera.lookAt(target);
    } else {
      camera.position.set(
        orb.radius * Math.sin(orb.phi) * Math.sin(orb.theta),
        orb.radius * Math.cos(orb.phi),
        orb.radius * Math.sin(orb.phi) * Math.cos(orb.theta)
      );
      camera.lookAt(0, baseDimensions.h * 0.45, 0);
    }
  }, [baseDimensions]);

  // Aplicar modo de cámara seleccionado
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const orb = orbitRef.current;
    const maxDim = Math.max(baseDimensions.w, baseDimensions.h, baseDimensions.d);
    orb.isInterior = cameraMode === 'int';

    if (cameraMode === 'ext') {
      orb.theta = 0.75;
      orb.phi = 0.55;
      orb.radius = maxDim * 2.8;
      camera.fov = 45;
    } else if (cameraMode === 'int') {
      orb.eyePos.set(0, 1.75, baseDimensions.d * 0.25);
      orb.yaw = Math.PI;
      orb.pitch = 0;
      camera.fov = 65;
    } else if (cameraMode === 'iso') {
      orb.theta = Math.PI / 4;
      orb.phi = Math.PI / 4;
      orb.radius = maxDim * 3.0;
      camera.fov = 35;
    } else if (cameraMode === 'top') {
      orb.theta = 0.001;
      orb.phi = 0.005;
      orb.radius = maxDim * 3.2;
      camera.fov = 22;
    } else if (cameraMode === 'sec') {
      orb.theta = Math.PI / 2;
      orb.phi = 0.28;
      orb.radius = maxDim * 2.6;
      camera.fov = 25;
    } else if (cameraMode === 'alz') {
      orb.theta = 0;
      orb.phi = 0.12;
      orb.radius = maxDim * 2.6;
      camera.fov = 25;
    }

    camera.updateProjectionMatrix();
    updateCameraPosition();
  }, [cameraMode, baseDimensions, updateCameraPosition]);

  // Inicialización Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const bgHex = cssVarColorHex(SCENE_BG_VAR, 0x0f1013);
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, theme === 'dark' ? 0.006 : 0.0042);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 800);
    cameraRef.current = camera;

    // Protección WebGL (B3): si el contexto no puede crearse (sin GPU, VM,
    // escritorio remoto, etc.) THREE lanza un error que antes dejaba la app en
    // blanco. Aquí se captura, se avisa al usuario y el tablero 2D sigue vivo.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch (err) {
      console.error('WebGL no disponible; visor 3D desactivado:', err);
      setWebglFailed(true);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Luces (matizadas por tema: día = papel claro con sol suave)
    const isDarkScene = theme === 'dark';
    const ambientLight = new THREE.AmbientLight(
      isDarkScene ? 0xfffaed : 0xffffff,
      isDarkScene ? 0.7 : 0.55
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(
      isDarkScene ? 0xe5a93b : 0xf8edcf,
      isDarkScene ? 0x0f1013 : 0xd8ceb6,
      isDarkScene ? 0.45 : 0.85
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(isDarkScene ? 0xfff8ea : 0xfff7e3, isDarkScene ? 1.6 : 1.45);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 180;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Grupos
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);
    groundGroupRef.current = groundGroup;

    const volumeGroup = new THREE.Group();
    scene.add(volumeGroup);
    volumeGroupRef.current = volumeGroup;

    const humanGroup = new THREE.Group();
    scene.add(humanGroup);
    humanGroupRef.current = humanGroup;

    const windGroup = new THREE.Group();
    scene.add(windGroup);
    windGroupRef.current = windGroup;

    const mistGroup = new THREE.Group();
    scene.add(mistGroup);
    mistGroupRef.current = mistGroup;

    // Grid técnico dorado/charcoal (colores por tema)
    const grid = new THREE.GridHelper(
      120,
      60,
      cssVarColorHex(SCENE_GRID_MAJOR_VAR, 0xe5a93b),
      cssVarColorHex(SCENE_GRID_MINOR_VAR, 0x2e323c)
    );
    grid.position.y = 0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = theme === 'dark' ? 0.4 : 0.55;
    scene.add(grid);
    gridRef.current = grid;

    // Suelo infinito de la caja (papel cálido en día / basalto en noche)
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshLambertMaterial({
      color: cssVarColorHex(SCENE_GROUND_VAR, 0x14151a),
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    groundGroup.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // Bucle de animación
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Animar partículas de flujo de viento
      if (windParticlesRef.current) {
        const { positions, speeds, geom } = windParticlesRef.current;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          positions[idx + 2] += speeds[i];
          if (positions[idx + 2] > 45) {
            positions[idx + 2] = -45;
            positions[idx] = (Math.random() - 0.5) * 35;
          }
        }
        geom.attributes.position.needsUpdate = true;
      }

      // Animar neblina de humedad
      if (mistParticlesRef.current) {
        const { positions, geom } = mistParticlesRef.current;
        const count = positions.length / 3;
        const time = Date.now() * 0.002;
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          positions[idx + 1] = 0.2 + Math.sin(time + i * 0.5) * 0.2 + 0.15;
        }
        geom.attributes.position.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Redimensionado
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Aplicar el tema al visor (fondo, niebla, luces, grid y suelo) sin
  // reconstruir el renderer: modo claro = papel de atelier, oscuro = look actual
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const isDarkScene = theme === 'dark';

    const bgHex = cssVarColorHex(SCENE_BG_VAR, 0x0f1013);
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, isDarkScene ? 0.006 : 0.0042);

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(isDarkScene ? 0xfffaed : 0xffffff);
      ambientLightRef.current.intensity = isDarkScene ? 0.7 : 0.55;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(isDarkScene ? 0xe5a93b : 0xf8edcf);
      hemiLightRef.current.groundColor.setHex(isDarkScene ? 0x0f1013 : 0xd8ceb6);
      hemiLightRef.current.intensity = isDarkScene ? 0.45 : 0.85;
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(isDarkScene ? 0xfff8ea : 0xfff7e3);
      dirLightRef.current.intensity = isDarkScene ? 1.6 : 1.45;
    }
    if (groundMeshRef.current) {
      (groundMeshRef.current.material as THREE.MeshLambertMaterial).color.setHex(
        cssVarColorHex(SCENE_GROUND_VAR, 0x14151a)
      );
    }
    if (gridRef.current && scene) {
      scene.remove(gridRef.current);
      const grid = new THREE.GridHelper(
        120,
        60,
        cssVarColorHex(SCENE_GRID_MAJOR_VAR, 0xe5a93b),
        cssVarColorHex(SCENE_GRID_MINOR_VAR, 0x2e323c)
      );
      grid.position.y = 0.01;
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = isDarkScene ? 0.4 : 0.55;
      scene.add(grid);
      gridRef.current = grid;
    }
  }, [theme]);

  // Actualizar orientación solar según Norte
  useEffect(() => {
    if (!dirLightRef.current) return;
    const rad = (northRotation * Math.PI) / 180;
    const sunDist = 35;
    dirLightRef.current.position.set(
      Math.sin(rad) * sunDist + 15,
      38,
      Math.cos(rad) * sunDist + 15
    );
  }, [northRotation]);

  // Reconstruir geometría al cambiar conceptos, artefactos o parámetros
  useEffect(() => {
    const volumeGroup = volumeGroupRef.current;
    const scene = sceneRef.current;
    if (!volumeGroup || !scene) return;

    // Limpiar geometrías previas
    while (volumeGroup.children.length > 0) {
      const obj = volumeGroup.children[0] as THREE.Mesh;
      volumeGroup.remove(obj);
      obj.geometry?.dispose();
    }

    const built = buildArchitecturalGeometry(
      activeConcepts,
      activeArtifacts,
      nodeParams,
      baseDimensions,
      shadingMode
    );

    built.meshes.forEach((m) => volumeGroup.add(m));
    built.groups.forEach((g) => volumeGroup.add(g));

    setEnvInfo({
      hasWind: !!built.hasWindFlow,
      windSpeed: built.hasWindFlow ? 2.5 + (built.windIntensity || 0.5) * 4.5 : 0,
      hasHumidity: !!built.hasHumidity,
      hasVegetation: !!built.hasVegetation,
      hasTopography: !!built.hasTopography,
    });

    // Reconstruir viento animado
    if (windGroupRef.current) {
      while (windGroupRef.current.children.length > 0) {
        windGroupRef.current.remove(windGroupRef.current.children[0]);
      }
      windParticlesRef.current = null;

      if (built.hasWindFlow) {
        const count = 320;
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          const isTunnel = Math.random() < 0.4;
          positions[idx] = isTunnel
            ? (Math.random() - 0.5) * (baseDimensions.w * 0.45)
            : (Math.random() - 0.5) * (baseDimensions.w * 2.4);
          positions[idx + 1] = isTunnel
            ? 1.2 + Math.random() * (baseDimensions.h * 0.45)
            : Math.random() * (baseDimensions.h * 1.5) + 0.4;
          positions[idx + 2] = (Math.random() - 0.5) * 80;
          speeds[i] = 0.35 + (built.windIntensity || 0.5) * 0.5 + Math.random() * 0.2;
        }

        const pGeom = new THREE.BufferGeometry();
        pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
          color: 0x06b6d4, // Cyan técnico
          size: 0.4,
          transparent: true,
          opacity: 0.85,
        });
        const points = new THREE.Points(pGeom, pMat);
        windGroupRef.current.add(points);

        windParticlesRef.current = { positions, speeds, geom: pGeom };
      }
    }

    // Reconstruir neblina de humedad
    if (mistGroupRef.current) {
      while (mistGroupRef.current.children.length > 0) {
        mistGroupRef.current.remove(mistGroupRef.current.children[0]);
      }
      mistParticlesRef.current = null;

      if (built.hasHumidity) {
        const count = 140;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          positions[idx] = (Math.random() - 0.5) * (baseDimensions.w * 1.5);
          positions[idx + 1] = 0.2 + Math.random() * 0.6;
          positions[idx + 2] = baseDimensions.d * 0.55 + (Math.random() - 0.5) * (baseDimensions.d * 1.3);
        }
        const mGeom = new THREE.BufferGeometry();
        mGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mMat = new THREE.PointsMaterial({
          color: 0x38bdf8,
          size: 0.55,
          transparent: true,
          opacity: 0.5,
        });
        const mPoints = new THREE.Points(mGeom, mMat);
        mistGroupRef.current.add(mPoints);
        mistParticlesRef.current = { positions, geom: mGeom };
      }
    }

    // Luces secundarias de atrio
    const oldLights = scene.children.filter((c) => c.name === 'atrium_light');
    oldLights.forEach((l) => scene.remove(l));

    built.lights.forEach((l) => {
      l.name = 'atrium_light';
      scene.add(l);
    });

    updateCameraPosition();
  }, [activeConcepts, activeArtifacts, nodeParams, baseDimensions, shadingMode, updateCameraPosition]);

  // Actualizar figura humana
  useEffect(() => {
    const humanGroup = humanGroupRef.current;
    if (!humanGroup) return;

    while (humanGroup.children.length > 0) {
      humanGroup.remove(humanGroup.children[0]);
    }

    if (showHumanFigure) {
      const goldHex = cssVarColorHex('--da-gold', 0xe5a93b);
      const figure = createHumanFigure(1.75, goldHex);
      figure.position.set(baseDimensions.w / 2 + 1.8, 0, 0);
      humanGroup.add(figure);
    }
  }, [showHumanFigure, baseDimensions, theme]);

  // Raycaster para selección directa de cajas 3D
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  // Controladores de ratón (Orbit / Pan / Walk / Raycast Click)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    orbitRef.current.isDragging = true;
    orbitRef.current.prevX = e.clientX;
    orbitRef.current.prevY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const orb = orbitRef.current;
    if (!orb.isDragging) {
      // Raycasting al pasar el cursor
      if (containerRef.current && cameraRef.current && volumeGroupRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(volumeGroupRef.current.children, true);
        if (intersects.length > 0 && intersects[0].object.userData?.conceptId) {
          if (containerRef.current) containerRef.current.style.cursor = 'pointer';
        } else {
          if (containerRef.current) containerRef.current.style.cursor = 'grab';
        }
      }
      return;
    }

    const dx = (e.clientX - orb.prevX) * 0.0055;
    const dy = (e.clientY - orb.prevY) * 0.0055;

    if (orb.isInterior) {
      orb.yaw -= dx;
      orb.pitch = Math.max(-0.7, Math.min(0.7, orb.pitch - dy));
    } else {
      orb.theta -= dx;
      orb.phi = Math.max(0.04, Math.min(Math.PI / 2 - 0.02, orb.phi - dy));
    }

    orb.prevX = e.clientX;
    orb.prevY = e.clientY;
    updateCameraPosition();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Si fue un clic simple sin arrastre, ejecutar raycasting para seleccionar la caja 3D
    const orb = orbitRef.current;
    const dragDistance = Math.abs(e.clientX - orb.prevX) + Math.abs(e.clientY - orb.prevY);

    if (dragDistance < 4 && containerRef.current && cameraRef.current && volumeGroupRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);

      const intersects = raycasterRef.current.intersectObjects(volumeGroupRef.current.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const conceptId = hit.userData?.conceptId;
        if (conceptId) {
          useProjectStore.getState().setSelectedNodeId(conceptId);
          showToast(`Caja 3D seleccionada: "${conceptId}"`);
        }
      }
    }

    orbitRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const orb = orbitRef.current;

    if (orb.isInterior) {
      const speed = 0.35;
      const dir = e.deltaY > 0 ? -1 : 1;
      orb.eyePos.x += Math.sin(orb.yaw) * speed * dir;
      orb.eyePos.z += Math.cos(orb.yaw) * speed * dir;
    } else {
      orb.radius = Math.max(4, Math.min(180, orb.radius + e.deltaY * 0.04));
    }

    updateCameraPosition();
  };

  const handleCapturePNG = () => {
    if (!canvasRef.current) return;
    captureCanvasPNG(canvasRef.current, projectName, cameraMode);
    showToast('Imagen arquitectónica PNG exportada');
  };

  const handleExportOBJ = () => {
    if (!volumeGroupRef.current) return;
    const meshes: THREE.Mesh[] = [];
    volumeGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh);
      }
    });
    exportMeshesToOBJ(meshes, projectName);
    showToast('Modelo 3D OBJ exportado');
  };

  const handleResetCamera = () => {
    setCameraMode('ext');
    showToast('Cámara restablecida');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-diagramaxis-bg select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {!webglFailed ? (
        <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-orange font-bold">
            Visor 3D no disponible
          </span>
          <p className="font-mono text-[11px] text-diagramaxis-textMuted max-w-[300px] leading-relaxed">
            Tu navegador o dispositivo no pudo crear un contexto WebGL, por lo que el visor volumétrico
            quedó desactivado. El tablero 2D y el resto de la herramienta siguen operativos.
          </p>
        </div>
      )}

      {/* Título de Cabecera 3D y Telemetría Ambiental */}
      <div className="absolute top-3.5 left-3.5 pointer-events-none flex flex-col gap-1.5 z-10">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] tracking-widest text-diagramaxis-gold font-bold uppercase">
            Masa Modular 3D · DIAGRAMAXIS
          </span>
          <span className="font-serif italic text-[16px] text-diagramaxis-text font-medium">
            {projectName || 'Volumen Proyectual'}
          </span>
        </div>

        {/* Badges de Simulación Ambiental Activa */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {envInfo.hasWind && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-diagramaxis-surface/90 backdrop-blur-md border border-diagramaxis-cyan/50 text-diagramaxis-cyan rounded-xs font-mono text-[10.5px] font-semibold shadow-md">
              <span className="w-2 h-2 rounded-full bg-diagramaxis-cyan animate-pulse" />
              <span>Viento: {envInfo.windSpeed.toFixed(1)} m/s (Ventilación Cruzada)</span>
            </div>
          )}
          {envInfo.hasHumidity && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-diagramaxis-surface/90 backdrop-blur-md border border-sky-400/50 text-sky-400 rounded-xs font-mono text-[10.5px] font-semibold shadow-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Humedad: Microclima Evaporativo</span>
            </div>
          )}
          {envInfo.hasVegetation && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-diagramaxis-surface/90 backdrop-blur-md border border-emerald-400/50 text-emerald-400 rounded-xs font-mono text-[10.5px] font-semibold shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Cinturón Biofílico</span>
            </div>
          )}
          {envInfo.hasTopography && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-diagramaxis-surface/90 backdrop-blur-md border border-amber-400/50 text-amber-400 rounded-xs font-mono text-[10.5px] font-semibold shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Terrazas Topográficas</span>
            </div>
          )}
        </div>
      </div>

      {/* Selector de Vistas de Cámara */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center bg-diagramaxis-surface/95 backdrop-blur-md border border-diagramaxis-border shadow-xl rounded-sm p-1 gap-1 z-10">
        {(['ext', 'int', 'iso', 'top', 'sec', 'alz'] as CameraViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setCameraMode(mode)}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all rounded-xs ${
              cameraMode === mode
                ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold shadow-[0_0_10px_rgb(var(--da-gold)/0.3)]'
                : 'text-diagramaxis-textMuted hover:text-diagramaxis-text hover:bg-diagramaxis-surface2'
            }`}
          >
            {mode === 'ext' && 'Perspectiva'}
            {mode === 'int' && 'Interior'}
            {mode === 'iso' && 'Axonometría'}
            {mode === 'top' && 'Planta'}
            {mode === 'sec' && 'Sección'}
            {mode === 'alz' && 'Alzado'}
          </button>
        ))}
      </div>

      {/* Rosa de los Vientos / Norte */}
      <div
        className="absolute top-3.5 right-3.5 pointer-events-none transition-transform duration-300 drop-shadow-[0_0_10px_rgb(var(--da-gold)/0.3)]"
        style={{ transform: `rotate(${northRotation}deg)` }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="22"
            style={{ fill: 'rgb(var(--da-surface))', stroke: 'rgb(var(--da-border))' }}
            strokeWidth="1.2"
          />
          <polygon points="24,4 20,18 24,15 28,18" style={{ fill: 'rgb(var(--da-gold))' }} />
          <polygon points="24,44 20,30 24,33 28,30" style={{ fill: 'rgb(var(--da-text-dim))' }} />
          <text
            x="24"
            y="11"
            textAnchor="middle"
            fontSize="8"
            fontFamily="DM Mono"
            style={{ fill: 'rgb(var(--da-gold))' }}
            fontWeight="bold"
          >
            N
          </text>
        </svg>
      </div>

      {/* Controles de Renderizado Inferiores */}
      <div className="absolute bottom-3.5 right-3.5 flex items-center bg-diagramaxis-surface/95 backdrop-blur-md border border-diagramaxis-border shadow-xl rounded-sm p-1.5 gap-1.5 z-10">
        <button
          onClick={() => setShadingMode('solid')}
          title="Modo Sólido (Bloques Blancos)"
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            shadingMode === 'solid'
              ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold shadow-[0_0_10px_rgb(var(--da-gold)/0.3)]'
              : 'text-diagramaxis-textMuted hover:bg-diagramaxis-surface2 hover:text-diagramaxis-text'
          }`}
        >
          ■ Bloques
        </button>
        <button
          onClick={() => setShadingMode('wire')}
          title="Modo Alámbrico"
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            shadingMode === 'wire'
              ? 'bg-diagramaxis-cyan text-diagramaxis-bg font-bold shadow-[0_0_10px_rgb(var(--da-cyan)/0.3)]'
              : 'text-diagramaxis-textMuted hover:bg-diagramaxis-surface2 hover:text-diagramaxis-text'
          }`}
        >
          □ Alambre
        </button>
        <button
          onClick={() => setShadingMode('ghost')}
          title="Modo Rayos X"
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            shadingMode === 'ghost'
              ? 'bg-diagramaxis-orange text-diagramaxis-white font-bold shadow-[0_0_10px_rgb(var(--da-orange)/0.3)]'
              : 'text-diagramaxis-textMuted hover:bg-diagramaxis-surface2 hover:text-diagramaxis-text'
          }`}
        >
          ◈ Rayos X
        </button>
        <div className="w-[1px] h-5 bg-diagramaxis-border" />
        <button
          onClick={toggleHumanFigure}
          title={showHumanFigure ? 'Ocultar Escala Humana (1.75m)' : 'Mostrar Escala Humana (1.75m)'}
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            showHumanFigure
              ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold shadow-[0_0_10px_rgb(var(--da-gold)/0.3)]'
              : 'text-diagramaxis-textMuted hover:bg-diagramaxis-surface2 hover:text-diagramaxis-text'
          }`}
        >
          <PersonStanding className="w-3.5 h-3.5" /> 1.75m
        </button>
        <button
          onClick={handleResetCamera}
          title="Restablecer Vista"
          className="p-1.5 text-diagramaxis-textMuted hover:text-diagramaxis-text hover:bg-diagramaxis-surface2 rounded-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-diagramaxis-border" />
        <button
          onClick={handleCapturePNG}
          title="Exportar Captura PNG en alta resolución"
          className="p-1.5 text-diagramaxis-textMuted hover:text-diagramaxis-gold hover:bg-diagramaxis-surface2 rounded-xs transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportOBJ}
          title="Exportar Modelo 3D (.OBJ)"
          className="p-1.5 text-diagramaxis-textMuted hover:text-diagramaxis-gold hover:bg-diagramaxis-surface2 rounded-xs transition-colors"
        >
          <Box className="w-4 h-4" />
        </button>
      </div>

      {/* Indicador de Dimensiones en Vivo */}
      <div className="absolute bottom-3.5 left-3.5 pointer-events-none bg-diagramaxis-surface/95 backdrop-blur-md border border-diagramaxis-border px-3 py-1.5 rounded-sm shadow-xl">
        <span className="font-mono text-[11px] text-diagramaxis-textMuted tracking-wider">
          Masa: <strong className="text-diagramaxis-gold">{baseDimensions.w.toFixed(1)}m</strong> (X) ×{' '}
          <strong className="text-diagramaxis-gold">{baseDimensions.d.toFixed(1)}m</strong> (Z) ×{' '}
          <strong className="text-diagramaxis-gold">{baseDimensions.h.toFixed(1)}m</strong> (Y)
        </span>
      </div>
    </div>
  );
};
