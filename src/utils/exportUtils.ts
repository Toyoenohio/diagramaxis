import * as THREE from 'three';

export interface ExportProjectData {
  sistema: string;
  version: string;
  proyecto: string;
  arquitecto: string;
  ubicacion: string;
  fecha: string;
  conceptos_activos: string[];
  artefactos_activos: string[];
  params: Record<string, { weight: number; intensity: number }>;
  relaciones: Array<{
    from: string;
    to: string;
    type: string;
    dir: string;
    intensity: number;
  }>;
  discurso: string;
  volumen_base: { w: number; h: number; d: number };
  northRot: number;
}

export function exportProjectToJSON(data: ExportProjectData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (data.proyecto || 'Proyecto_UPA').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `UPA_${safeName}_${new Date().toISOString().slice(0, 10)}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

export function captureCanvasPNG(
  canvas: HTMLCanvasElement,
  projectName: string,
  viewName: string
) {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const safeProj = (projectName || 'UPA').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `UPA_${safeProj}_${viewName.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.png`;
    a.href = dataUrl;
    a.click();
  } catch (err) {
    console.error('Error al capturar canvas 3D:', err);
  }
}

// Exportador procedural simple a formato 3D Wavefront OBJ
export function exportMeshesToOBJ(meshes: THREE.Mesh[], projectName: string) {
  let objOutput = `# UPA — Universo Proyectual Arquitectónico (Sistema ARPV)\n# Proyecto: ${projectName}\n# Fecha: ${new Date().toISOString()}\n\n`;
  let vertexOffset = 1;

  meshes.forEach((mesh, meshIdx) => {
    if (!mesh.geometry) return;
    objOutput += `o Objeto_${meshIdx}_${mesh.name || 'Masa'}\n`;
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);

    const pos = geo.attributes.position;
    if (!pos) return;

    // Vértices
    for (let i = 0; i < pos.count; i++) {
      objOutput += `v ${pos.getX(i).toFixed(4)} ${pos.getY(i).toFixed(4)} ${pos.getZ(i).toFixed(4)}\n`;
    }

    // Caras
    if (geo.index) {
      const idx = geo.index;
      for (let i = 0; i < idx.count; i += 3) {
        objOutput += `f ${idx.getX(i) + vertexOffset} ${idx.getX(i + 1) + vertexOffset} ${idx.getX(i + 2) + vertexOffset}\n`;
      }
      vertexOffset += pos.count;
    } else {
      for (let i = 0; i < pos.count; i += 3) {
        objOutput += `f ${i + vertexOffset} ${i + 1 + vertexOffset} ${i + 2 + vertexOffset}\n`;
      }
      vertexOffset += pos.count;
    }
    objOutput += '\n';
  });

  const blob = new Blob([objOutput], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeProj = (projectName || 'UPA').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `UPA_${safeProj}_Modelo3D.obj`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
