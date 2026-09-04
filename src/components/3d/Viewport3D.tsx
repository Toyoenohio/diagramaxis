import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useProjectStore } from '../../store/useProjectStore';
import { CameraViewMode } from '../../types';
import { buildArchitecturalGeometry } from './GeometryBuilder';
import { createHumanFigure } from './HumanFigure';
import { captureCanvasPNG, exportMeshesToOBJ } from '../../utils/exportUtils';
import { Camera, Box, RotateCcw } from 'lucide-react';

export const Viewport3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const volumeGroupRef = useRef<THREE.Group | null>(null);
  const groundGroupRef = useRef<THREE.Group | null>(null);
  const humanGroupRef = useRef<THREE.Group | null>(null);

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
    scene.background = new THREE.Color(0x0f1013);
    scene.fog = new THREE.FogExp2(0x0f1013, 0.006);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 800);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xfffaed, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe5a93b, 0x0f1013, 0.45);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ea, 1.6);
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

    // Grid técnico dorado/charcoal
    const grid = new THREE.GridHelper(120, 60, 0xe5a93b, 0x2e323c);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.4;
    scene.add(grid);

    // Suelo infinito de la caja
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x14151a });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    groundGroup.add(groundMesh);

    // Bucle de animación
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
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

    const { meshes, groups, lights } = buildArchitecturalGeometry(
      activeConcepts,
      activeArtifacts,
      nodeParams,
      baseDimensions,
      shadingMode
    );

    meshes.forEach((m) => volumeGroup.add(m));
    groups.forEach((g) => volumeGroup.add(g));

    // Luces secundarias de atrio
    const oldLights = scene.children.filter((c) => c.name === 'atrium_light');
    oldLights.forEach((l) => scene.remove(l));

    lights.forEach((l) => {
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
      const figure = createHumanFigure(1.75, 0xe5a93b);
      figure.position.set(baseDimensions.w / 2 + 1.8, 0, 0);
      humanGroup.add(figure);
    }
  }, [showHumanFigure, baseDimensions]);

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
      className="relative w-full h-full bg-[#0f1013] select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Título de Cabecera 3D */}
      <div className="absolute top-3.5 left-3.5 pointer-events-none flex flex-col gap-0.5">
        <span className="font-mono text-[10px] tracking-widest text-[#e5a93b] font-bold uppercase">
          Masa Modular 3D · DIAGRAMAXIS
        </span>
        <span className="font-serif italic text-[16px] text-[#f8fafc] font-medium">
          {projectName || 'Volumen Proyectual'}
        </span>
      </div>

      {/* Selector de Vistas de Cámara */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center bg-[#17181d]/95 backdrop-blur-md border border-[#2e323c] shadow-xl rounded-sm p-1 gap-1 z-10">
        {(['ext', 'int', 'iso', 'top', 'sec', 'alz'] as CameraViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setCameraMode(mode)}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all rounded-xs ${
              cameraMode === mode
                ? 'bg-[#e5a93b] text-[#0f1013] font-bold shadow-[0_0_10px_rgba(229,169,59,0.3)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1f2128]'
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
        className="absolute top-3.5 right-3.5 pointer-events-none transition-transform duration-300 drop-shadow-[0_0_10px_rgba(229,169,59,0.3)]"
        style={{ transform: `rotate(${northRotation}deg)` }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#17181d" stroke="#2e323c" strokeWidth="1.2" />
          <polygon points="24,4 20,18 24,15 28,18" fill="#e5a93b" />
          <polygon points="24,44 20,30 24,33 28,30" fill="#64748b" />
          <text x="24" y="11" textAnchor="middle" fontSize="8" fontFamily="DM Mono" fill="#e5a93b" fontWeight="bold">
            N
          </text>
        </svg>
      </div>

      {/* Controles de Renderizado Inferiores */}
      <div className="absolute bottom-3.5 right-3.5 flex items-center bg-[#17181d]/95 backdrop-blur-md border border-[#2e323c] shadow-xl rounded-sm p-1.5 gap-1.5 z-10">
        <button
          onClick={() => setShadingMode('solid')}
          title="Modo Sólido (Bloques Blancos)"
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            shadingMode === 'solid'
              ? 'bg-[#e5a93b] text-[#0f1013] font-bold shadow-[0_0_10px_rgba(229,169,59,0.3)]'
              : 'text-[#94a3b8] hover:bg-[#1f2128] hover:text-[#f8fafc]'
          }`}
        >
          ■ Bloques
        </button>
        <button
          onClick={() => setShadingMode('wire')}
          title="Modo Alámbrico"
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            shadingMode === 'wire'
              ? 'bg-[#06b6d4] text-[#0f1013] font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'text-[#94a3b8] hover:bg-[#1f2128] hover:text-[#f8fafc]'
          }`}
        >
          □ Alambre
        </button>
        <button
          onClick={() => setShadingMode('ghost')}
          title="Modo Rayos X"
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            shadingMode === 'ghost'
              ? 'bg-[#ea580c] text-[#ffffff] font-bold shadow-[0_0_10px_rgba(234,88,12,0.3)]'
              : 'text-[#94a3b8] hover:bg-[#1f2128] hover:text-[#f8fafc]'
          }`}
        >
          ◈ Rayos X
        </button>
        <div className="w-[1px] h-5 bg-[#2e323c]" />
        <button
          onClick={toggleHumanFigure}
          title={showHumanFigure ? 'Ocultar Escala Humana (1.75m)' : 'Mostrar Escala Humana (1.75m)'}
          className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all ${
            showHumanFigure
              ? 'bg-[#e5a93b] text-[#0f1013] font-bold shadow-[0_0_10px_rgba(229,169,59,0.3)]'
              : 'text-[#94a3b8] hover:bg-[#1f2128] hover:text-[#f8fafc]'
          }`}
        >
          👤 1.75m
        </button>
        <button
          onClick={handleResetCamera}
          title="Restablecer Vista"
          className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1f2128] rounded-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-[#2e323c]" />
        <button
          onClick={handleCapturePNG}
          title="Exportar Captura PNG en alta resolución"
          className="p-1.5 text-[#94a3b8] hover:text-[#e5a93b] hover:bg-[#1f2128] rounded-xs transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportOBJ}
          title="Exportar Modelo 3D (.OBJ)"
          className="p-1.5 text-[#94a3b8] hover:text-[#e5a93b] hover:bg-[#1f2128] rounded-xs transition-colors"
        >
          <Box className="w-4 h-4" />
        </button>
      </div>

      {/* Indicador de Dimensiones en Vivo */}
      <div className="absolute bottom-3.5 left-3.5 pointer-events-none bg-[#17181d]/95 backdrop-blur-md border border-[#2e323c] px-3 py-1.5 rounded-sm shadow-xl">
        <span className="font-mono text-[11px] text-[#94a3b8] tracking-wider">
          Masa: <strong className="text-[#e5a93b]">{baseDimensions.w.toFixed(1)}m</strong> (X) ×{' '}
          <strong className="text-[#e5a93b]">{baseDimensions.d.toFixed(1)}m</strong> (Z) ×{' '}
          <strong className="text-[#e5a93b]">{baseDimensions.h.toFixed(1)}m</strong> (Y)
        </span>
      </div>
    </div>
  );
};
