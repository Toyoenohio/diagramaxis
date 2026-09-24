import * as THREE from 'three';
import { buildArchitecturalGeometry } from '../components/3d/GeometryBuilder';
import { NodeParam, RenderShadingMode, ProjectRelation } from '../types';
import { easeInOutCubic } from './exportUtils';

/* ------------------------------------------------------------------ *
 *  VIDEO EXPORTER — Exportación de video de transición del modelo 3D
 *  ------------------------------------------------------------------
 *  Genera un video WebM mostrando la construcción progresiva del volumen
 *  arquitectónico desde el cubo base hasta el estado final con todas
 *  las modificaciones aplicadas.
 *
 *  Usa MediaRecorder + captureStream(0) nativo del navegador para
 *  frame-stepping determinístico sin dependencias externas.
 * ------------------------------------------------------------------ */

export interface VideoExportConfig {
  fps: number;                 // 24 | 30 | 60
  framesPerConcept: number;    // frames para transicionar cada concepto
  framesIntro: number;         // frames mostrando cubo base
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

export const DEFAULT_VIDEO_CONFIG: VideoExportConfig = {
  fps: 30,
  framesPerConcept: 45,
  framesIntro: 30,
  framesOutro: 60,
  resolution: { width: 1920, height: 1080 },
  cameraMode: 'ext',
  includeOutroTurntable: true,
};

/**
 * Calcula el total de frames que tendrá el video.
 */
export function calculateTotalFrames(
  config: VideoExportConfig,
  conceptCount: number
): number {
  const transitionFrames = conceptCount * config.framesPerConcept;
  const outroFrames = config.includeOutroTurntable ? config.framesOutro : 0;
  return config.framesIntro + transitionFrames + outroFrames;
}

/**
 * Calcula la duración estimada del video en segundos.
 */
export function estimateDuration(
  config: VideoExportConfig,
  conceptCount: number
): number {
  return calculateTotalFrames(config, conceptCount) / config.fps;
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
  // Verificar codecs
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
 * Configura la posición de cámara para un modo dado.
 */
function setupCameraForMode(
  camera: THREE.PerspectiveCamera,
  mode: 'ext' | 'iso' | 'alz',
  maxDim: number,
  theta: number,
  lookAtY: number
) {
  let phi: number;
  let radius: number;

  if (mode === 'iso') {
    phi = Math.PI / 4;
    radius = maxDim * 3.0;
    camera.fov = 35;
  } else if (mode === 'alz') {
    phi = 0.12;
    radius = maxDim * 2.6;
    camera.fov = 25;
  } else {
    // ext
    phi = 0.55;
    radius = maxDim * 2.8;
    camera.fov = 45;
  }

  camera.position.set(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(0, lookAtY, 0);
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
 * Ejecuta la exportación de video frame-a-frame.
 *
 * @param config        Configuración de exportación
 * @param refs          Referencias al renderer, scene, camera y volumeGroup de Three.js
 * @param concepts      Lista ordenada de IDs de conceptos activos
 * @param artifacts     Lista de artefactos activos
 * @param nodeParams    Parámetros de cada nodo (weight, intensity, custom)
 * @param baseDimensions Dimensiones base del volumen
 * @param shadingMode   Modo de sombreado actual
 * @param relations     Relaciones activas
 * @param projectName   Nombre del proyecto (para el nombre del archivo)
 * @param onProgress    Callback de progreso
 * @param abortSignal   Señal de cancelación
 */
export async function exportTransitionVideo(
  config: VideoExportConfig,
  refs: VideoExportRefs,
  concepts: string[],
  artifacts: string[],
  nodeParams: Record<string, NodeParam>,
  baseDimensions: { w: number; h: number; d: number },
  shadingMode: RenderShadingMode,
  relations: ProjectRelation[],
  projectName: string,
  onProgress: (progress: VideoExportProgress) => void,
  abortSignal: AbortSignal
): Promise<void> {
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

  const stream = canvas.captureStream(0);
  const videoTrack = stream.getVideoTracks()[0];

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const totalFrames = calculateTotalFrames(config, concepts.length);
  let globalFrame = 0;

  // Ángulo de cámara para turntable
  const initialTheta = config.cameraMode === 'alz' ? 0 : 0.75;
  let theta = initialTheta;
  const thetaIncrement = (Math.PI * 3) / totalFrames; // 1.5 vueltas completas

  const maxDim = Math.max(baseDimensions.w, baseDimensions.h, baseDimensions.d);

  // Limpia luces secundarias previas
  const cleanAtriumLights = () => {
    const oldLights = scene.children.filter((c) => c.name === 'atrium_light');
    oldLights.forEach((l) => scene.remove(l));
  };

  /**
   * Renderiza un frame con un subset/interpolación de conceptos dados.
   */
  const renderFrame = (
    activeSubset: string[],
    interpolatedParams: Record<string, NodeParam>
  ) => {
    clearGroup(volumeGroup);
    cleanAtriumLights();

    const built = buildArchitecturalGeometry(
      activeSubset,
      artifacts,
      interpolatedParams,
      baseDimensions,
      shadingMode,
      relations
    );

    built.meshes.forEach((m) => volumeGroup.add(m));
    built.groups.forEach((g) => volumeGroup.add(g));
    built.lights.forEach((l) => {
      l.name = 'atrium_light';
      scene.add(l);
    });

    const lookAtY = (built.finalDimensions?.h || baseDimensions.h) * 0.45;
    setupCameraForMode(camera, config.cameraMode, maxDim, theta, lookAtY);

    renderer.render(scene, camera);

    // Solicitar frame al stream
    if (videoTrack && 'requestFrame' in videoTrack) {
      (videoTrack as any).requestFrame();
    }

    theta += thetaIncrement;
    globalFrame++;
  };

  /**
   * Pequeña pausa para liberar el hilo principal y que MediaRecorder
   * procese los frames. También verifica cancelación.
   */
  const yieldFrame = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (abortSignal.aborted) {
        reject(new DOMException('Export cancelled', 'AbortError'));
        return;
      }
      requestAnimationFrame(() => resolve());
    });

  // --------------- INICIO DE GRABACIÓN ---------------
  recorder.start();

  try {
    // === FASE INTRO: Cubo base girando ===
    for (let f = 0; f < config.framesIntro; f++) {
      if (abortSignal.aborted) throw new DOMException('Export cancelled', 'AbortError');

      onProgress({
        phase: 'intro',
        conceptIndex: -1,
        conceptName: 'Volumen Base',
        currentFrame: globalFrame,
        totalFrames,
        percent: Math.round((globalFrame / totalFrames) * 100),
      });

      renderFrame([], nodeParams);
      await yieldFrame();
    }

    // === FASE TRANSICIÓN: Concepto por concepto ===
    for (let i = 0; i < concepts.length; i++) {
      const conceptId = concepts[i];
      const targetParam = nodeParams[conceptId] || { weight: 0.6, intensity: 0.5 };

      for (let f = 0; f < config.framesPerConcept; f++) {
        if (abortSignal.aborted) throw new DOMException('Export cancelled', 'AbortError');

        const t = easeInOutCubic(f / Math.max(1, config.framesPerConcept - 1));

        // Construir parámetros interpolados: conceptos previos con valores
        // finales, concepto actual interpolado
        const interpolatedParams: Record<string, NodeParam> = { ...nodeParams };

        interpolatedParams[conceptId] = {
          weight: t * (targetParam.weight ?? 0.6),
          intensity: t * (targetParam.intensity ?? 0.5),
          custom: targetParam.custom,
        };

        // Subset: todos los conceptos hasta el actual (inclusive)
        const activeSubset = concepts.slice(0, i + 1);

        onProgress({
          phase: 'transition',
          conceptIndex: i,
          conceptName: conceptId,
          currentFrame: globalFrame,
          totalFrames,
          percent: Math.round((globalFrame / totalFrames) * 100),
        });

        renderFrame(activeSubset, interpolatedParams);
        await yieldFrame();
      }
    }

    // === FASE OUTRO: Turntable completa con resultado final ===
    if (config.includeOutroTurntable) {
      for (let f = 0; f < config.framesOutro; f++) {
        if (abortSignal.aborted) throw new DOMException('Export cancelled', 'AbortError');

        onProgress({
          phase: 'outro',
          conceptIndex: concepts.length - 1,
          conceptName: 'Resultado Final',
          currentFrame: globalFrame,
          totalFrames,
          percent: Math.round((globalFrame / totalFrames) * 100),
        });

        renderFrame(concepts, nodeParams);
        await yieldFrame();
      }
    }

    // === FINALIZAR GRABACIÓN ===
    onProgress({
      phase: 'encoding',
      conceptIndex: concepts.length,
      conceptName: 'Codificando video…',
      currentFrame: totalFrames,
      totalFrames,
      percent: 99,
    });

    // Esperar a que MediaRecorder entregue el blob final
    await new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = (e) => reject(e);
      recorder.stop();
    });

    // Descargar el archivo
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
      conceptIndex: concepts.length,
      conceptName: '¡Video exportado!',
      currentFrame: totalFrames,
      totalFrames,
      percent: 100,
    });
  } catch (err) {
    // Si fue cancelado, detener el recorder limpiamente
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
