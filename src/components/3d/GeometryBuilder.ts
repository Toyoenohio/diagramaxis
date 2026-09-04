import * as THREE from 'three';
import { NodeParam, RenderShadingMode } from '../../types';
import { getVolumetricOperation } from '../../data/volumetricOperations';

export interface BuiltVolumeResult {
  meshes: THREE.Mesh[];
  groups: THREE.Group[];
  lights: THREE.Light[];
  history: string[];
  finalDimensions: { w: number; h: number; d: number };
}

interface GeometricState {
  w: number;
  h: number;
  d: number;
  rotY: number;
  shearX: number;
  shearZ: number;
  additions: Array<{
    ax: number;
    ay: number;
    az: number;
    aw: number;
    ah: number;
    ad: number;
    label: string;
    isRamp?: boolean;
    isWater?: boolean;
  }>;
  subtractions: Array<{
    type: string;
    dir?: string;
    face?: string;
    cx: number;
    cy: number;
    cz: number;
    sw: number;
    sh: number;
    sd: number;
  }>;
  hollowed: boolean;
  hollowFactor: number;
  fractured: boolean;
  fracGap: number;
  gradeSteps: number;
  gradeDir: 'X' | 'Z';
  deformMag: number;
  hasCanopy: boolean;
  canopyDepth: number;
  hasBase: boolean;
  baseH: number;
  hasTerrace: boolean;
  hasCourt: boolean;
  courtSize: number;
  hasAtrium: boolean;
  atriumSize: number;
  hasPilotis: boolean;
  pilotisHeight: number;
  hasLattice: boolean;
  hasWater: boolean;
  history: string[];
}

export function buildArchitecturalGeometry(
  activeConcepts: string[],
  activeArtifacts: string[],
  nodeParams: Record<string, NodeParam>,
  baseDimensions: { w: number; h: number; d: number },
  shadingMode: RenderShadingMode
): BuiltVolumeResult {
  const resultMeshes: THREE.Mesh[] = [];
  const resultGroups: THREE.Group[] = [];
  const resultLights: THREE.Light[] = [];

  // Estado inicial
  const state: GeometricState = {
    w: Math.max(2, baseDimensions.w),
    h: Math.max(2, baseDimensions.h),
    d: Math.max(2, baseDimensions.d),
    rotY: 0,
    shearX: 0,
    shearZ: 0,
    additions: [],
    subtractions: [],
    hollowed: false,
    hollowFactor: 0.65,
    fractured: false,
    fracGap: 0,
    gradeSteps: 0,
    gradeDir: 'X',
    deformMag: 0,
    hasCanopy: false,
    canopyDepth: 0.35,
    hasBase: false,
    baseH: 0.15,
    hasTerrace: false,
    hasCourt: false,
    courtSize: 0.45,
    hasAtrium: false,
    atriumSize: 0.38,
    hasPilotis: false,
    pilotisHeight: 0.3,
    hasLattice: false,
    hasWater: false,
    history: [],
  };

  // Procesamiento de operaciones en secuencia
  const allItems = [...activeConcepts, ...activeArtifacts];
  allItems.forEach((id) => {
    const op = getVolumetricOperation(id);
    if (!op) return;

    const param = nodeParams[id] || { weight: 0.6, intensity: 0.5 };
    const weight = Math.max(0.25, param.weight || 0.6);

    state.history.push(op.label || id);

    switch (op.op) {
      case 'extend':
        if (op.axis === 'Y') state.h *= 1 + (op.factor! - 1) * weight;
        else if (op.axis === 'X') state.w *= 1 + (op.factor! - 1) * weight;
        else if (op.axis === 'XZ') {
          state.w *= 1 + (op.factor! - 1) * weight * 0.7;
          state.d *= 1 + (op.factor! - 1) * weight * 0.7;
        } else if (op.axis === 'XYZ') {
          state.w *= 1 + (op.factor! - 1) * weight * 0.55;
          state.h *= 1 + (op.factor! - 1) * weight * 0.55;
          state.d *= 1 + (op.factor! - 1) * weight * 0.55;
        }
        break;

      case 'compress':
        if (op.axis === 'Y') state.h *= op.factor! + (1 - op.factor!) * (1 - weight);
        else if (op.axis === 'X') state.w *= op.factor! + (1 - op.factor!) * (1 - weight);
        break;

      case 'perforate': {
        const pSize = Math.max(0.18, Math.min(0.7, (op.size || 0.3) * weight * 1.2));
        if (op.dir === 'Y') {
          // Cenital
          state.subtractions.push({
            type: 'hole',
            dir: 'Y',
            cx: 0,
            cy: 0,
            cz: 0,
            sw: state.w * pSize,
            sh: state.h * 1.15,
            sd: state.d * pSize,
          });
        } else if (op.dir === 'Z') {
          // Frontal pasante
          state.subtractions.push({
            type: 'hole',
            dir: 'Z',
            cx: 0,
            cy: 0,
            cz: 0,
            sw: state.w * pSize,
            sh: state.h * pSize * 1.2,
            sd: state.d * 1.15,
          });
        } else if (op.dir === 'X') {
          state.subtractions.push({
            type: 'hole',
            dir: 'X',
            cx: 0,
            cy: 0,
            cz: 0,
            sw: state.w * 1.15,
            sh: state.h * pSize * 1.1,
            sd: state.d * pSize,
          });
        }
        break;
      }

      case 'hollow':
        state.hollowed = true;
        state.hollowFactor = op.factor || 0.65;
        break;

      case 'carve': {
        const cSize = (op.size || 0.4) * weight;
        state.subtractions.push({
          type: 'carve',
          face: op.face || 'front',
          cx: 0,
          cy: -(state.h * 0.1),
          cz: -(state.d * 0.25),
          sw: state.w * cSize,
          sh: state.h * cSize * 0.85,
          sd: state.d * 0.55,
        });
        break;
      }

      case 'open':
        state.subtractions.push({
          type: 'hole',
          dir: 'Z',
          cx: 0,
          cy: 0,
          cz: 0,
          sw: state.w * (op.size || 0.75) * weight,
          sh: state.h * (op.size || 0.75) * weight,
          sd: state.d * 1.15,
        });
        break;

      case 'fracture':
        state.fractured = true;
        state.fracGap = (op.gap || 0.15) * weight;
        break;

      case 'add': {
        const aSize = (op.size || 0.38) * weight;
        let ax = 0,
          ay = 0,
          az = 0,
          aw = 0,
          ah = 0,
          ad = 0;
        if (op.face === 'side') {
          ax = state.w / 2 + (state.w * aSize) / 2;
          ay = 0;
          az = 0;
          aw = state.w * aSize;
          ah = state.h * 0.75;
          ad = state.d * 0.65;
        } else if (op.face === 'front') {
          ax = 0;
          ay = 0;
          az = -(state.d / 2 + (state.d * aSize) / 2);
          aw = state.w * 0.65;
          ah = state.h * 0.45;
          ad = state.d * aSize;
        } else if (op.face === 'top') {
          ax = 0;
          ay = state.h / 2 + (state.h * aSize) / 2;
          az = 0;
          aw = state.w * 0.35;
          ah = state.h * aSize * 1.2;
          ad = state.d * 0.35;
        } else if (op.face === 'ext') {
          ax = state.w * 0.35;
          ay = -(state.h * 0.3);
          az = -(state.d / 2 + 2);
          aw = state.w * 0.6;
          ah = state.h * 0.4;
          ad = state.d * 0.5;
        }
        state.additions.push({ ax, ay, az, aw, ah: ah || 1, ad: ad || 1, label: op.label });
        break;
      }

      case 'shear':
        if (op.axis === 'Y') state.rotY += (op.angle || 0.25) * weight;
        else if (op.axis === 'X') state.shearX += (op.angle || 0.2) * weight;
        break;

      case 'rotate':
        state.rotY += (op.angle || 0.4) * weight;
        break;

      case 'grade':
        state.gradeSteps = op.steps || 3;
        state.gradeDir = (op.dir as 'X' | 'Z') || 'X';
        break;

      case 'deform':
        state.deformMag = Math.max(state.deformMag, (op.mag || 0.12) * weight);
        break;

      case 'mirror':
        state.additions.push({
          ax: -(state.w / 2 + state.w * 0.18),
          ay: 0,
          az: 0,
          aw: state.w * 0.3,
          ah: state.h * 0.65,
          ad: state.d * 0.55,
          label: 'Ala izquierda',
        });
        state.additions.push({
          ax: state.w / 2 + state.w * 0.18,
          ay: 0,
          az: 0,
          aw: state.w * 0.3,
          ah: state.h * 0.65,
          ad: state.d * 0.55,
          label: 'Ala derecha',
        });
        break;

      case 'courtyard':
        state.hasCourt = true;
        state.courtSize = (op.size || 0.45) * weight;
        break;

      case 'atrium':
        state.hasAtrium = true;
        state.atriumSize = (op.size || 0.38) * weight;
        break;

      case 'ramp':
        state.additions.push({
          ax: 0,
          ay: -(state.h * 0.25),
          az: -(state.d / 2 + state.d * 0.2),
          aw: state.w * 0.3,
          ah: state.h * 0.5,
          ad: state.d * 0.45,
          label: 'Rampa',
          isRamp: true,
        });
        break;

      case 'base':
        state.hasBase = true;
        state.baseH = (op.height || 0.18) * weight;
        break;

      case 'terrace':
        state.hasTerrace = true;
        break;

      case 'canopy':
        state.hasCanopy = true;
        state.canopyDepth = (op.depth || 0.38) * weight;
        break;

      case 'pilotis':
        state.hasPilotis = true;
        state.pilotisHeight = (op.height || 0.3) * weight;
        break;

      case 'lattice':
        state.hasLattice = true;
        break;
    }
  });

  if (activeArtifacts.includes('Agua')) {
    state.hasWater = true;
  }

  // --- MATERIALES DE SIMULACIÓN OSCURA DE ALTO CONTRASTE ---
  const isGhost = shadingMode === 'ghost' || shadingMode === 'xray';
  const isWire = shadingMode === 'wire';

  const matMain = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0xf1f5f9), // Masa clara de alto contraste
    transparent: isGhost || isWire,
    opacity: isGhost ? 0.35 : isWire ? 0 : 0.98,
    side: THREE.FrontSide,
  });

  const matInner = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x334155), // Sombra interior oscura
    side: THREE.BackSide,
  });

  const matDarkVoid = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x0f172a), // Vaciados profundos
    side: THREE.BackSide,
  });

  const matBase = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x475569), // Podio basalto oscuro
  });

  const matRamp = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0xcbd5e1),
  });

  const matCanopy = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x0284c7), // Acento cyan brillante
  });

  const matPilotis = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x090d14), // Columnas grafito
  });

  const matWater = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x0ea5e9),
    transparent: true,
    opacity: 0.75,
  });

  const matLattice = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x22c55e),
    wireframe: true,
  });

  const posY = state.h / 2 + (state.hasPilotis ? state.h * state.pilotisHeight : 0);

  // Helper para generar geometría facetada o pura
  function makeBoxGeo(w: number, h: number, d: number, deform: number = 0): THREE.BoxGeometry {
    const segs = deform > 0 ? 8 : 1;
    const geo = new THREE.BoxGeometry(w, h, d, segs, segs, segs);
    if (deform > 0) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const onEdge =
          Math.abs(pos.getX(i)) > (w / 2) * 0.85 ||
          Math.abs(pos.getY(i)) > (h / 2) * 0.85 ||
          Math.abs(pos.getZ(i)) > (d / 2) * 0.85;
        if (!onEdge) {
          pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * deform * w);
          pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * deform * d);
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    return geo;
  }

  // 1. VOLUMEN PRINCIPAL
  if (state.fractured) {
    const hw = state.w / 2 - state.fracGap * state.w;
    const g1 = makeBoxGeo(hw, state.h, state.d, state.deformMag);
    const g2 = makeBoxGeo(hw, state.h, state.d, state.deformMag);

    const m1 = new THREE.Mesh(g1, matMain);
    const m2 = new THREE.Mesh(g2, matMain);

    m1.position.set(-(hw / 2 + state.fracGap * state.w), posY, 0);
    m2.position.set(hw / 2 + state.fracGap * state.w, posY + state.h * state.fracGap * 1.5, 0);

    m1.rotation.y = state.rotY;
    m2.rotation.y = state.rotY + 0.15;

    m1.castShadow = true;
    m1.receiveShadow = true;
    m2.castShadow = true;
    m2.receiveShadow = true;

    resultMeshes.push(m1, m2);
  } else if (state.gradeSteps > 1) {
    const steps = state.gradeSteps;
    for (let i = 0; i < steps; i++) {
      const ratio = (steps - i) / steps;
      let gw = state.w;
      let gh = state.h * ratio;
      let gd = state.d;
      let ox = 0;
      let oz = 0;

      if (state.gradeDir === 'X') {
        gw = (state.w * (i + 1)) / steps;
        ox = -(state.w / 2) + gw / 2;
      } else {
        gd = (state.d * (i + 1)) / steps;
        oz = -(state.d / 2) + gd / 2;
      }

      const gg = makeBoxGeo(gw, gh, gd, state.deformMag);
      const mg = new THREE.Mesh(gg, matMain);
      mg.position.set(ox, gh / 2 + (state.hasPilotis ? state.h * state.pilotisHeight : 0), oz);
      mg.castShadow = true;
      mg.receiveShadow = true;
      resultMeshes.push(mg);
    }
  } else {
    const baseGeo = makeBoxGeo(state.w, state.h, state.d, state.deformMag);
    const mMain = new THREE.Mesh(baseGeo, matMain);
    mMain.position.set(0, posY, 0);
    mMain.rotation.y = state.rotY;

    if (state.shearX !== 0) {
      const pos = mMain.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        pos.setX(i, pos.getX(i) + y * state.shearX);
      }
      pos.needsUpdate = true;
      mMain.geometry.computeVertexNormals();
    }

    mMain.castShadow = true;
    mMain.receiveShadow = true;
    resultMeshes.push(mMain);

    // Cara interna
    const mInner = new THREE.Mesh(baseGeo, matInner);
    mInner.position.copy(mMain.position);
    mInner.rotation.copy(mMain.rotation);
    resultMeshes.push(mInner);

    // Sustracciones y cortes de vacíos
    state.subtractions.forEach((sub) => {
      const sg = new THREE.BoxGeometry(sub.sw || 1, sub.sh || 1, sub.sd || 1);
      const sVoid = new THREE.Mesh(sg, matDarkVoid);
      const sy = posY + (sub.cy || 0);
      sVoid.position.set(sub.cx || 0, sy, sub.cz || 0);
      sVoid.rotation.y = state.rotY;
      resultMeshes.push(sVoid);
    });

    // Patio Central
    if (state.hasCourt) {
      const cs = state.courtSize || 0.45;
      const cg = new THREE.BoxGeometry(state.w * cs, state.h * 1.15, state.d * cs);
      const cVoid = new THREE.Mesh(cg, matDarkVoid);
      cVoid.position.set(0, posY, 0);
      cVoid.rotation.y = state.rotY;
      resultMeshes.push(cVoid);
    }

    // Atrio Interior
    if (state.hasAtrium) {
      const as2 = state.atriumSize || 0.38;
      const ag = new THREE.BoxGeometry(state.w * as2, state.h * 0.75, state.d * as2);
      const aVoid = new THREE.Mesh(ag, matDarkVoid);
      aVoid.position.set(0, posY + state.h * 0.15, 0);
      aVoid.rotation.y = state.rotY;
      resultMeshes.push(aVoid);

      // Luz interior del atrio
      const atriumLight = new THREE.PointLight(0xfffaed, 1.6, state.h * 3.5);
      atriumLight.position.set(0, posY + state.h * 0.5, 0);
      resultLights.push(atriumLight);
    }

    // Hueco interior total
    if (state.hollowed) {
      const hf = state.hollowFactor || 0.65;
      const hg = new THREE.BoxGeometry(state.w * hf, state.h * 0.92, state.d * hf);
      const hVoid = new THREE.Mesh(hg, matDarkVoid);
      hVoid.position.set(0, posY, 0);
      hVoid.rotation.y = state.rotY;
      resultMeshes.push(hVoid);
    }
  }

  // 2. PILOTIS (Elevación sobre columnas)
  if (state.hasPilotis) {
    const pH = state.h * state.pilotisHeight;
    const colGroup = new THREE.Group();
    const colsX = 4;
    const colsZ = 3;
    const colR = 0.15;
    const colGeo = new THREE.CylinderGeometry(colR, colR, pH, 12);

    for (let ix = 0; ix < colsX; ix++) {
      for (let iz = 0; iz < colsZ; iz++) {
        const cx = -(state.w * 0.4) + (ix / (colsX - 1)) * (state.w * 0.8);
        const cz = -(state.d * 0.4) + (iz / (colsZ - 1)) * (state.d * 0.8);
        const colMesh = new THREE.Mesh(colGeo, matPilotis);
        colMesh.position.set(cx, pH / 2, cz);
        colMesh.castShadow = true;
        colMesh.receiveShadow = true;
        colGroup.add(colMesh);
      }
    }
    resultGroups.push(colGroup);
  }

  // 3. ADICIONES DE VOLUMEN
  state.additions.forEach((add) => {
    const ag = new THREE.BoxGeometry(add.aw, add.ah, add.ad);
    const am = add.isRamp ? new THREE.Mesh(ag, matRamp) : new THREE.Mesh(ag, matMain);
    am.position.set(add.ax, posY + add.ay, add.az);
    am.castShadow = true;
    am.receiveShadow = true;
    am.userData = { conceptId: add.label };
    resultMeshes.push(am);
  });

  // 4. BASAMENTO
  if (state.hasBase) {
    const bh = Math.max(0.6, state.baseH * state.h);
    const bg = new THREE.BoxGeometry(state.w * 1.12, bh, state.d * 1.12);
    const bm = new THREE.Mesh(bg, matBase);
    bm.position.set(0, bh / 2, 0);
    bm.castShadow = true;
    bm.receiveShadow = true;
    bm.userData = { conceptId: 'Basamento' };
    resultMeshes.push(bm);
  }

  // 5. TERRAZA EN CUBIERTA
  if (state.hasTerrace) {
    const tg = new THREE.BoxGeometry(state.w * 0.9, 0.15, state.d * 0.9);
    const tm = new THREE.Mesh(tg, matBase);
    tm.position.set(0, posY * 2 - 0.1, 0);
    tm.castShadow = true;
    tm.userData = { conceptId: 'Terraza' };
    resultMeshes.push(tm);
  }

  // 6. MARQUESINA
  if (state.hasCanopy) {
    const cd = state.canopyDepth || 0.38;
    const cg = new THREE.BoxGeometry(state.w * 1.05, 0.15, state.d * cd);
    const cm = new THREE.Mesh(cg, matCanopy);
    cm.position.set(0, posY * 0.7, -(state.d / 2 + (state.d * cd) / 2));
    cm.castShadow = true;
    cm.userData = { conceptId: 'Marquesina' };
    resultMeshes.push(cm);
  }

  // 7. CELOSÍA / TAMIZ
  if (state.hasLattice) {
    const latG = new THREE.PlaneGeometry(state.w * 0.8, state.h * 0.7, 12, 8);
    const latM = new THREE.Mesh(latG, matLattice);
    latM.position.set(0, posY, -(state.d / 2 + 0.05));
    latM.userData = { conceptId: 'Tamiz' };
    resultMeshes.push(latM);
  }

  // 8. ESPEJO DE AGUA
  if (state.hasWater) {
    const waterG = new THREE.BoxGeometry(state.w * 1.6, 0.1, state.d * 1.4);
    const waterM = new THREE.Mesh(waterG, matWater);
    waterM.position.set(0, 0.05, state.d * 0.6);
    waterM.receiveShadow = true;
    waterM.userData = { conceptId: 'Agua' };
    resultMeshes.push(waterM);
  }

  // 9. WIREFRAME OVERLAY (para modos wire / ghost)
  if (isWire || isGhost) {
    resultMeshes.forEach((mesh) => {
      if (mesh.geometry) {
        const wireGeo = mesh.geometry.clone();
        const wireMat = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: isWire ? 0x06b6d4 : 0x22c55e,
          transparent: true,
          opacity: isWire ? 0.95 : 0.45,
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        wireMesh.position.copy(mesh.position);
        wireMesh.rotation.copy(mesh.rotation);
        wireMesh.scale.copy(mesh.scale);
        resultMeshes.push(wireMesh);
      }
    });
  }

  return {
    meshes: resultMeshes,
    groups: resultGroups,
    lights: resultLights,
    history: state.history,
    finalDimensions: { w: state.w, h: state.h, d: state.d },
  };
}
