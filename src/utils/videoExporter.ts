import * as THREE from 'three';
import { buildArchitecturalGeometry } from '../components/3d/GeometryBuilder';
import { createHumanFigure } from '../components/3d/HumanFigure';
import { NodeParam, RenderShadingMode, ProjectRelation, ProjectObject } from '../types';
import { easeInOutCubic } from './exportUtils';

/* ------------------------------------------------------------------ *
 *  VIDEO EXPORTER — Exportación de video de transición de la composición 3D
 *  ------------------------------------------------------------------
 *  Genera un video WebM mostrando la construcción progresiva de TODOS
 *  los objetos y volúmenes de la composición arquitectónica, desde sus
 *  volúmenes base hasta el estado final con todos sus modificadores aplicados.
 *
 *  Mantiene una toma arquitectónica a nivel de ojo (frontal / alzado con
 *  inclinación suave ~12°) con cámara completamente fija durante la
 *  construcción para evitar mareos, y al finalizar realiza un paneo suave
 *  360° en torno al centro baricéntrico de la composición completa.
 *
 *  Usa MediaRecorder + captureStream nativo del navegador.
 * ------------------------------------------------------------------ */

export interface VideoExportConfig {
  fps: number;                 // 24 | 30 | 60
  framesPerConcept: number;    // frames para transicionar cada concepto
  framesIntro: number;         // frames mostrando volumen base
  framesOutro: number;         // frames turntable final
  resolution: { width: number; height: number };
  cameraMode: 'ext' | 'iso' | 'alz';
  includeOutroTurntable: boolean;
}

export interface VideoExportProgress {
  phase: 'intro' | 'transition' | 'outro' | 'encoding' | 'done';
  conceptIndex: number;
  conceptName: string;
  currentFrame: number;
  totalFrames: number;
  percent: number;
}

export interface VideoExportRefs {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  volumeGroup: THREE.Group;
}

export interface VideoExportParams {
  config: VideoExportConfig;
  refs: VideoExportRefs;
  objects: ProjectObject[];
  baseDimensions: { w: number; h: number; d: number };
  activeConcepts: string[];
  activeArtifacts: string[];
  globalNodeParams: Record<string, NodeParam>;
  shadingMode: RenderShadingMode;
  relations: ProjectRelation[];
  projectName: string;
  showHumanFigure?: boolean;
  onProgress: (progress: VideoExportProgress) => void;
  abortSignal: AbortSignal;
}

export interface CompositionStep {
  id: string;
  conceptId: string;
  targetObjectIds: string[];
  stepTitle: string;
}

export const DEFAULT_VIDEO_CONFIG: VideoExportConfig = {
  fps: 30,
  framesPerConcept: 45,
  framesIntro: 30,
  framesOutro: 90, // 3 segundos a 30fps para un paneo 360 majestuoso y detallado
  resolution: { width: 1920, height: 1080 },
  cameraMode: 'ext',
  includeOutroTurntable: true,
};

/**
 * Construye la secuencia ordenada de pasos de transformación para toda la composición.
 * Respeta el encadenamiento en serie de cada objeto y agrupa modificadores compartidos.
 */
export function buildCompositionSteps(
  objects: ProjectObject[],
  activeConcepts: string[]
): CompositionStep[] {
  const steps: CompositionStep[] = [];

  if (objects.length <= 1) {
    const singleObj = objects[0];
    const concepts =
      singleObj?.assignedConcepts && singleObj.assignedConcepts.length > 0
        ? singleObj.assignedConcepts
        : activeConcepts;

    concepts.forEach((cId) => {
      steps.push({
        id: `step-${cId}-${singleObj?.id || 'obj-1'}`,
        conceptId: cId,
        targetObjectIds: [singleObj?.id || 'obj-1'],
        stepTitle: cId,
      });
    });
    return steps;
  }

  // Composición con 2 o más objetos:
  // Mapear qué objetos tienen asignado cada concepto
  const conceptToObjects = new Map<string, string[]>();
  objects.forEach((obj) => {
    (obj.assignedConcepts || []).forEach((cId) => {
      const list = conceptToObjects.get(cId) || [];
      if (!list.includes(obj.id)) list.push(obj.id);
      conceptToObjects.set(cId, list);
    });
  });

  const individualAdded = new Set<string>();
  const sharedAdded = new Set<string>();

  // 1. Modificaciones individuales por objeto (respetando el orden topológico de cada cadena)
  objects.forEach((obj) => {
    (obj.assignedConcepts || []).forEach((cId) => {
      const sharing = conceptToObjects.get(cId) || [];
      if (sharing.length === 1) {
        const key = `${obj.id}_${cId}`;
        if (!individualAdded.has(key)) {
          individualAdded.add(key);
          steps.push({
            id: `step-${key}`,
            conceptId: cId,
            targetObjectIds: [obj.id],
            stepTitle: `${obj.name} · ${cId}`,
          });
        }
      }
    });
  });

  // 2. Modificaciones compartidas que conectan o articulan a 2 o más objetos
  // (se ejecutan como articulación colectiva del conjunto arquitectónico)
  objects.forEach((obj) => {
    (obj.assignedConcepts || []).forEach((cId) => {
      const sharing = conceptToObjects.get(cId) || [];
      if (sharing.length > 1 && !sharedAdded.has(cId)) {
        sharedAdded.add(cId);
        const objNames = sharing
          .map((id) => objects.find((o) => o.id === id)?.name || id)
          .join(' + ');
        steps.push({
          id: `step-shared-${cId}`,
          conceptId: cId,
          targetObjectIds: sharing,
          stepTitle: `${objNames} · ${cId}`,
        });
      }
    });
  });

  return steps;
}

/**
 * Calcula el total de frames que tendrá el video.
 */
export function calculateTotalFrames(
  config: VideoExportConfig,
  stepCount: number
): number {
  const transitionFrames = stepCount * config.framesPerConcept;
  const outroFrames = config.includeOutroTurntable ? config.framesOutro : 0;
  return config.framesIntro + transitionFrames + outroFrames;
}

/**
 * Calcula la duración estimada del video en segundos.
 */
export function estimateDuration(
  config: VideoExportConfig,
  stepCount: number
): number {
  return calculateTotalFrames(config, stepCount) / config.fps;
}

/**
 * Verifica que el navegador soporte MediaRecorder + captureStream.
 */
export function checkBrowserSupport(): { supported: boolean; reason?: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { supported: false, reason: 'MediaRecorder API no disponible en este navegador.' };
  }
  const canvas = document.createElement('canvas');
  if (typeof canvas.captureStream !== 'function') {
    return { supported: false, reason: 'canvas.captureStream() no disponible en este navegador.' };
  }
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const supported = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m));
  if (!supported) {
    return { supported: false, reason: 'Ningún codec WebM soportado por el navegador.' };
  }
  return { supported: true };
}

/**
 * Calcula el centro baricéntrico y la distancia de cámara necesaria para
 * encuadrar simultáneamente TODOS los objetos de la composición con holgura.
 */
export function calculateCompositionBounds(
  objects: ProjectObject[],
  baseDimensions: { w: number; h: number; d: number }
): { targetCenter: THREE.Vector3; cameraRadius: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = 0;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  objects.forEach((obj) => {
    const w = obj.dimensions?.w || baseDimensions.w;
    const h = obj.dimensions?.h || baseDimensions.h;
    const d = obj.dimensions?.d || baseDimensions.d;

    // Margen holgado para contemplar elevaciones sobre pilotis o voladizos
    const effectiveH = h * 1.65;
    const effectiveW = w * 1.25;
    const effectiveD = d * 1.25;

    const px = obj.position.x;
    const py = obj.position.y;
    const pz = obj.position.z;

    minX = Math.min(minX, px - effectiveW / 2);
    maxX = Math.max(maxX, px + effectiveW / 2);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py + effectiveH);
    minZ = Math.min(minZ, pz - effectiveD / 2);
    maxZ = Math.max(maxZ, pz + effectiveD / 2);
  });

  if (!isFinite(minX) || !isFinite(maxX)) {
    minX = -baseDimensions.w / 2;
    maxX = baseDimensions.w / 2;
    minY = 0;
    maxY = baseDimensions.h;
    minZ = -baseDimensions.d / 2;
    maxZ = baseDimensions.d / 2;
  }

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const spanZ = maxZ - minZ;

  // Centro geométrico equilibrado hacia el zócalo/altura visual humana
  const targetCenter = new THREE.Vector3(
    (minX + maxX) / 2,
    minY + spanY * 0.42,
    (minZ + maxZ) / 2
  );

  // Dimensiones para encuadre 16:9 con FOV = 38°
  const fovRad = (38 * Math.PI) / 180;
  const aspect = 16 / 9;

  // Radio horizontal en el plano (X, Z) desde targetCenter
  const radiusXZ = Math.sqrt(Math.pow(spanX / 2, 2) + Math.pow(spanZ / 2, 2));

  // Distancia horizontal para encajar con ~30% de margen lateral
  const distHoriz = (radiusXZ / (Math.tan(fovRad / 2) * aspect)) * 1.32;

  // Distancia vertical para encajar la altura con suelo y aire superior
  const distVert = ((spanY / 2) / Math.tan(fovRad / 2)) * 1.45;

  const cameraRadius = Math.max(distHoriz, distVert, baseDimensions.w * 2.2, 32);

  return { targetCenter, cameraRadius };
}

/**
 * Configura la posición de cámara para la composición.
 * En modo 'ext', implementa la toma frontal arquitectónica con inclinación suave (~12°)
 * que permite percibir con máxima nitidez los módulos, pilotis, desfragmentaciones y alturas.
 */
export function setupCompositionCamera(
  camera: THREE.PerspectiveCamera,
  mode: 'ext' | 'iso' | 'alz',
  targetCenter: THREE.Vector3,
  radius: number,
  theta: number
) {
  let phi: number;

  if (mode === 'iso') {
    phi = Math.PI / 4;
    camera.fov = 35;
  } else if (mode === 'alz') {
    phi = Math.PI / 2 - 0.04;
    camera.fov = 25;
  } else {
    // Modo Perspectiva ('ext'):
    // Ángulo bajo ~12° sobre la horizontal (phi = 1.36 rad / 78° desde el eje vertical Y)
    // Coincide con la toma frontal a nivel humano enviada en la imagen de referencia:
    // encuadre apaisado, silueta completa, módulos de fachada, zócalos y pilotis visibles con máxima nitidez.
    phi = Math.PI / 2 - 0.21;
    camera.fov = 38;
  }

  camera.position.set(
    targetCenter.x + radius * Math.sin(phi) * Math.sin(theta),
    targetCenter.y + radius * Math.cos(phi),
    targetCenter.z + radius * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(targetCenter.x, targetCenter.y, targetCenter.z);
  camera.updateProjectionMatrix();
}

/**
 * Limpia los hijos de un grupo, liberando geometrías y materiales.
 */
function clearGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    if ((child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
    if ((child as THREE.Mesh).material) {
      const mat = (child as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        (mat as THREE.Material).dispose();
      }
    }
  }
}

/**
 * Interpola numéricamente los parámetros personalizados de sliders.
 */
function interpolateCustomSliders(
  targetCustom: Record<string, any> | undefined,
  t: number
): Record<string, any> {
  const interpolated: Record<string, any> = {};
  if (!targetCustom) return interpolated;

  for (const [key, val] of Object.entries(targetCustom)) {
    if (typeof val === 'number') {
      const k = key.toLowerCase();
      if (
        k.includes('escala') ||
        k.includes('esbeltez') ||
        k.includes('factor') ||
        k.includes('proporcion')
      ) {
        interpolated[key] = 1.0 + (val - 1.0) * t;
      } else if (
        k.includes('subdivision') ||
        k.includes('modulos') ||
        k.includes('count') ||
        k.includes('pisos')
      ) {
        interpolated[key] = Math.max(1, Math.round(val * t));
      } else {
        interpolated[key] = val * t;
      }
    } else {
      interpolated[key] = val;
    }
  }
  return interpolated;
}

/**
 * Ejecuta la exportación de video frame-a-frame de toda la composición.
 */
export async function exportTransitionVideo(
  params: VideoExportParams
): Promise<void> {
  const {
    config,
    refs,
    objects,
    baseDimensions,
    activeConcepts,
    activeArtifacts,
    globalNodeParams,
    shadingMode,
    relations,
    projectName,
    showHumanFigure = true,
    onProgress,
    abortSignal,
  } = params;

  const { renderer, scene, camera, volumeGroup } = refs;

  // Guardar estado original del renderer
  const origSize = new THREE.Vector2();
  renderer.getSize(origSize);
  const origPixelRatio = renderer.getPixelRatio();

  // Configurar resolución de exportación
  renderer.setSize(config.resolution.width, config.resolution.height);
  renderer.setPixelRatio(1);
  camera.aspect = config.resolution.width / config.resolution.height;
  camera.updateProjectionMatrix();

  const canvas = renderer.domElement;

  // Configurar MediaRecorder
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  const stream = canvas.captureStream(config.fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  // Normalizar lista de objetos de la composición
  const renderObjects = objects && objects.length > 0 ? objects : [
    {
      id: 'obj-1',
      name: 'Objeto 1',
      dimensions: baseDimensions,
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      assignedConcepts: activeConcepts,
      nodeParams: globalNodeParams,
    },
  ];

  // Construir pasos ordenados de animación morfológica
  const steps = buildCompositionSteps(renderObjects, activeConcepts);

  const totalFrames = calculateTotalFrames(config, steps.length);
  let globalFrame = 0;

  // Calcular centro y radio de encuadre para que TODOS los objetos sean visibles
  const { targetCenter, cameraRadius } = calculateCompositionBounds(renderObjects, baseDimensions);

  // Ángulo de cámara inicial: 0 para toma frontal a nivel de alzado/perspectiva ('ext' y 'alz')
  const initialTheta = config.cameraMode === 'iso' ? Math.PI / 4 : 0;
  let currentTheta = initialTheta;

  // Incremento para el paneo 360° del Outro
  const outroThetaIncrement = config.framesOutro > 0 ? (Math.PI * 2) / config.framesOutro : 0;

  // Limpia luces secundarias previas
  const cleanAtriumLights = () => {
    const oldLights = scene.children.filter((c) => c.name === 'atrium_light');
    oldLights.forEach((l) => scene.remove(l));
  };

  /**
   * Renderiza un fotograma completo de la composición.
   *
   * @param currentStepIdx Índice del paso actual (-1 en intro, >= steps.length en outro)
   * @param t Progreso de interpolación del paso actual [0, 1]
   * @param frameTheta Ángulo azimutal de la cámara
   */
  const renderFrame = (
    currentStepIdx: number,
    t: number,
    frameTheta: number
  ) => {
    clearGroup(volumeGroup);
    cleanAtriumLights();

    const currentStep =
      currentStepIdx >= 0 && currentStepIdx < steps.length ? steps[currentStepIdx] : null;

    // Registro de conceptos activos por objeto en este fotograma
    const activeConceptsPerObj: Record<string, string[]> = {};

    renderObjects.forEach((obj) => {
      const objGroup = new THREE.Group();
      objGroup.name = `volume_${obj.id}`;
      objGroup.position.set(obj.position.x, obj.position.y, obj.position.z);
      if (obj.rotationY) {
        objGroup.rotation.y = (obj.rotationY * Math.PI) / 180;
      }

      // Determinar qué conceptos están activos para este objeto en este frame
      const objConcepts: string[] = [];
      const objParams: Record<string, NodeParam> = {
        ...globalNodeParams,
        ...(obj.nodeParams || {}),
      };

      // 1. Conceptos de pasos previos ya completados para este objeto
      for (let s = 0; s < currentStepIdx; s++) {
        const step = steps[s];
        if (step.targetObjectIds.includes(obj.id)) {
          if (!objConcepts.includes(step.conceptId)) {
            objConcepts.push(step.conceptId);
          }
        }
      }

      // 2. Concepto del paso actual en proceso de interpolación
      if (currentStep && currentStep.targetObjectIds.includes(obj.id)) {
        if (!objConcepts.includes(currentStep.conceptId)) {
          objConcepts.push(currentStep.conceptId);
        }

        const targetP = objParams[currentStep.conceptId] || { weight: 0.6, intensity: 0.5 };
        objParams[currentStep.conceptId] = {
          weight: Math.max(0.01, t * (targetP.weight ?? 0.6)),
          intensity: Math.max(0.01, t * (targetP.intensity ?? 0.5)),
          custom: interpolateCustomSliders(targetP.custom, t),
        };
      }

      // 3. En la fase Outro, todos los conceptos asignados están activos al 100%
      if (currentStepIdx >= steps.length) {
        (obj.assignedConcepts || []).forEach((c) => {
          if (!objConcepts.includes(c)) objConcepts.push(c);
        });
      }

      activeConceptsPerObj[obj.id] = objConcepts;

      const built = buildArchitecturalGeometry(
        objConcepts,
        activeArtifacts,
        objParams,
        obj.dimensions || baseDimensions,
        shadingMode,
        relations
      );

      built.meshes.forEach((m) => objGroup.add(m));
      built.groups.forEach((g) => objGroup.add(g));
      built.lights.forEach((l) => {
        l.name = 'atrium_light';
        scene.add(l);
      });

      volumeGroup.add(objGroup);
    });

    // =====================================================================
    // MODIFICADORES COMPARTIDOS MULTIVOLUMEN (Suma Colectiva)
    // =====================================================================
    if (renderObjects.length > 1) {
      // 1. Recorrido exterior compartido entre 2 o más volúmenes
      const objsWithRecorrido = renderObjects.filter((o) =>
        activeConceptsPerObj[o.id]?.includes('Recorrido exterior')
      );
      if (objsWithRecorrido.length >= 2) {
        for (let i = 0; i < objsWithRecorrido.length - 1; i++) {
          const objA = objsWithRecorrido[i];
          const objB = objsWithRecorrido[i + 1];
          const pA = new THREE.Vector3(objA.position.x, objA.position.y, objA.position.z);
          const pB = new THREE.Vector3(objB.position.x, objB.position.y, objB.position.z);
          const dist = pA.distanceTo(pB);
          const midPoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
          const angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);

          const sharedCircuitGroup = new THREE.Group();
          sharedCircuitGroup.name = `shared_circuit_${objA.id}_${objB.id}`;

          const pathWidth = 4.2;
          const pathMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
          const promenadeGeo = new THREE.BoxGeometry(pathWidth, 0.08, dist);
          const promenade = new THREE.Mesh(promenadeGeo, pathMat);
          promenade.position.set(midPoint.x, 0.04, midPoint.z);
          promenade.rotation.y = angle;
          promenade.receiveShadow = true;
          sharedCircuitGroup.add(promenade);

          const curbMat = new THREE.LineBasicMaterial({ color: 0x18181b, linewidth: 2 });
          const curbGeo = new THREE.EdgesGeometry(promenadeGeo);
          promenade.add(new THREE.LineSegments(curbGeo, curbMat));

          const gardenMat = new THREE.MeshLambertMaterial({ color: 0x22543d });
          const gardenGeo = new THREE.BoxGeometry(pathWidth * 0.45, 0.12, dist * 0.85);
          const garden = new THREE.Mesh(gardenGeo, gardenMat);
          garden.position.set(midPoint.x, 0.06, midPoint.z);
          garden.rotation.y = angle;
          sharedCircuitGroup.add(garden);

          volumeGroup.add(sharedCircuitGroup);
        }
      }

      // 2. Puentes y conectividad aérea compartida
      const objsWithBridges = renderObjects.filter((o) =>
        activeConceptsPerObj[o.id]?.some((c) => c === 'Conectividad' || c === 'Vinculado')
      );
      if (objsWithBridges.length >= 2) {
        for (let i = 0; i < objsWithBridges.length - 1; i++) {
          const objA = objsWithBridges[i];
          const objB = objsWithBridges[i + 1];
          const pA = new THREE.Vector3(objA.position.x, objA.position.y, objA.position.z);
          const pB = new THREE.Vector3(objB.position.x, objB.position.y, objB.position.z);
          const dist = pA.distanceTo(pB);
          const midPoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
          const angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);

          const bridgeGroup = new THREE.Group();
          bridgeGroup.name = `shared_bridge_${objA.id}_${objB.id}`;

          const bridgeWidth = 3.2;
          const bridgeHeight = Math.max(2.8, (objA.dimensions.h + objB.dimensions.h) * 0.25);
          const bridgeElev = Math.min(objA.dimensions.h, objB.dimensions.h) * 0.45;
          const bridgeMat = new THREE.MeshLambertMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.9,
          });

          const bridgeGeo = new THREE.BoxGeometry(bridgeWidth, bridgeHeight, dist * 0.95);
          const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
          bridgeMesh.position.set(midPoint.x, bridgeElev, midPoint.z);
          bridgeMesh.rotation.y = angle;
          bridgeMesh.castShadow = true;
          bridgeMesh.receiveShadow = true;

          const edgeMat = new THREE.LineBasicMaterial({ color: 0x18181b, linewidth: 2 });
          bridgeMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(bridgeGeo), edgeMat));
          bridgeGroup.add(bridgeMesh);

          volumeGroup.add(bridgeGroup);
        }
      }

      // 3. Relaciones explícitas de tablero entre volúmenes
      relations.forEach((rel) => {
        let idA: string | null = null;
        let idB: string | null = null;

        if (rel.from.startsWith('vol-') && rel.to.startsWith('vol-')) {
          idA = rel.from.replace('vol-', '');
          idB = rel.to.replace('vol-', '');
        }

        if (idA && idB && idA !== idB) {
          const objA = renderObjects.find((o) => o.id === idA);
          const objB = renderObjects.find((o) => o.id === idB);
          if (!objA || !objB) return;

          const interGroup = new THREE.Group();
          interGroup.name = `inter_rel_${idA}_${idB}`;

          const pA = new THREE.Vector3(objA.position.x, objA.position.y, objA.position.z);
          const pB = new THREE.Vector3(objB.position.x, objB.position.y, objB.position.z);
          const dist = pA.distanceTo(pB);
          const midPoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
          const angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);

          if (rel.type === 'restringe' || rel.type === 'tensiona') {
            const pathWidth = Math.max(3.5, 4.0 * (rel.intensity || 0.8));
            const pathMat = new THREE.MeshLambertMaterial({ color: 0x475569 });

            const promenadeGeo = new THREE.BoxGeometry(pathWidth, 0.08, dist);
            const promenade = new THREE.Mesh(promenadeGeo, pathMat);
            promenade.position.set(midPoint.x, 0.04, midPoint.z);
            promenade.rotation.y = angle;
            promenade.receiveShadow = true;
            interGroup.add(promenade);

            const curbMat = new THREE.LineBasicMaterial({ color: 0x18181b, linewidth: 2 });
            const curbGeo = new THREE.EdgesGeometry(promenadeGeo);
            promenade.add(new THREE.LineSegments(curbGeo, curbMat));

            if (rel.type === 'restringe') {
              const gardenMat = new THREE.MeshLambertMaterial({ color: 0x22543d });
              const gardenGeo = new THREE.BoxGeometry(pathWidth * 0.45, 0.12, dist * 0.8);
              const garden = new THREE.Mesh(gardenGeo, gardenMat);
              garden.position.set(midPoint.x, 0.06, midPoint.z);
              garden.rotation.y = angle;
              interGroup.add(garden);
            }
          } else {
            const bridgeWidth = Math.max(2.5, 3.0 * (rel.intensity || 0.8));
            const bridgeHeight = Math.max(2.8, (objA.dimensions.h + objB.dimensions.h) * 0.25);
            const bridgeElev = Math.min(objA.dimensions.h, objB.dimensions.h) * 0.45;
            const bridgeMat = new THREE.MeshLambertMaterial({
              color: 0x0284c7,
              transparent: true,
              opacity: 0.9,
            });

            const bridgeGeo = new THREE.BoxGeometry(bridgeWidth, bridgeHeight, dist * 0.95);
            const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
            bridgeMesh.position.set(midPoint.x, bridgeElev, midPoint.z);
            bridgeMesh.rotation.y = angle;
            bridgeMesh.castShadow = true;
            bridgeMesh.receiveShadow = true;

            const edgeMat = new THREE.LineBasicMaterial({ color: 0x18181b, linewidth: 2 });
            bridgeMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(bridgeGeo), edgeMat));
            interGroup.add(bridgeMesh);
          }

          volumeGroup.add(interGroup);
        }
      });
    }

    // Escala humana técnica (1.75m)
    if (showHumanFigure) {
      const figure = createHumanFigure(1.75, 0xe5a93b);
      if (renderObjects.length >= 2) {
        const p0 = renderObjects[0].position;
        const p1 = renderObjects[1].position;
        const hx = (p0.x + p1.x) / 2;
        const hz = Math.max(p0.z, p1.z) + (renderObjects[0].dimensions?.d || 14) * 0.5 + 2.0;
        figure.position.set(hx, 0, hz);
      } else {
        const curW = renderObjects[0].dimensions?.w || 16;
        figure.position.set(renderObjects[0].position.x + curW / 2 + 1.8, 0, renderObjects[0].position.z);
      }
      volumeGroup.add(figure);
    }

    // Configurar cámara sobre el encuadre general de la composición
    setupCompositionCamera(camera, config.cameraMode, targetCenter, cameraRadius, frameTheta);
    renderer.render(scene, camera);
    globalFrame++;
  };

  /**
   * Pausa calculada para dar a MediaRecorder el tiempo exacto de reloj.
   */
  const frameDelayMs = Math.max(16, Math.floor(1000 / config.fps));
  const yieldFrame = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (abortSignal.aborted) {
        reject(new DOMException('Export cancelled', 'AbortError'));
        return;
      }
      setTimeout(() => resolve(), frameDelayMs);
    });

  // --------------- INICIO DE GRABACIÓN ---------------
  recorder.start();

  try {
    // === FASE INTRO: Volúmenes base estáticos en toma frontal a nivel de ojo ===
    for (let f = 0; f < config.framesIntro; f++) {
      if (abortSignal.aborted) throw new DOMException('Export cancelled', 'AbortError');

      onProgress({
        phase: 'intro',
        conceptIndex: -1,
        conceptName: 'Composición Base',
        currentFrame: globalFrame,
        totalFrames,
        percent: Math.round((globalFrame / totalFrames) * 100),
      });

      // Cámara ESTÁTICA en la toma frontal para apreciar la composición inicial sin mareos
      renderFrame(-1, 0, initialTheta);
      await yieldFrame();
    }

    // === FASE TRANSICIÓN: Construcción paso a paso de cada modificador ===
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      for (let f = 0; f < config.framesPerConcept; f++) {
        if (abortSignal.aborted) throw new DOMException('Export cancelled', 'AbortError');

        const t = easeInOutCubic(f / Math.max(1, config.framesPerConcept - 1));

        onProgress({
          phase: 'transition',
          conceptIndex: i,
          conceptName: step.stepTitle,
          currentFrame: globalFrame,
          totalFrames,
          percent: Math.round((globalFrame / totalFrames) * 100),
        });

        // Cámara ESTÁTICA en la toma frontal durante la transformación morfológica
        renderFrame(i, t, initialTheta);
        await yieldFrame();
      }
    }

    // === FASE OUTRO: Paneo final 360° en torno a toda la composición terminada ===
    if (config.includeOutroTurntable) {
      for (let f = 0; f < config.framesOutro; f++) {
        if (abortSignal.aborted) throw new DOMException('Export cancelled', 'AbortError');

        onProgress({
          phase: 'outro',
          conceptIndex: steps.length - 1,
          conceptName: 'Paneo 360° de la Composición',
          currentFrame: globalFrame,
          totalFrames,
          percent: Math.round((globalFrame / totalFrames) * 100),
        });

        // Paneo suave 360° manteniendo la misma toma arquitectónica baja
        renderFrame(steps.length, 1.0, currentTheta);
        currentTheta += outroThetaIncrement;
        await yieldFrame();
      }
    }

    // === FINALIZAR GRABACIÓN ===
    onProgress({
      phase: 'encoding',
      conceptIndex: steps.length,
      conceptName: 'Codificando video…',
      currentFrame: totalFrames,
      totalFrames,
      percent: 99,
    });

    await new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = (e) => reject(e);
      recorder.stop();
    });

    // Descargar el archivo de video
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (projectName || 'UPA').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `UPA_${safeName}_Transicion_${new Date().toISOString().slice(0, 10)}.webm`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);

    onProgress({
      phase: 'done',
      conceptIndex: steps.length,
      conceptName: '¡Video exportado!',
      currentFrame: totalFrames,
      totalFrames,
      percent: 100,
    });
  } catch (err) {
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
    throw err;
  } finally {
    // Restaurar tamaño original del renderer
    renderer.setSize(origSize.x, origSize.y);
    renderer.setPixelRatio(origPixelRatio);
    camera.aspect = origSize.x / origSize.y;
    camera.updateProjectionMatrix();
  }
}
