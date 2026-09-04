import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
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
  /**
   * Sustracciones reales (CSG). Las dimensiones se guardan como FRACCIONES de
   * las dimensiones del estado en el momento de crearse la operación, y al
   * construir el CSG se multiplican por las dimensiones FINALES del sólido:
   * así el vacío escala de forma coherente con el sólido aunque una operación
   * de extensión llegue después, y los cortes pasantes atraviesan de verdad.
   */
  subtractions: Array<{
    type: string;
    dir?: string;
    face?: string;
    fracW?: number;
    fracH?: number;
    fracD?: number;
    cyFrac?: number;
    czFrac?: number;
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

/* ------------------------------------------------------------------ *
 *  CSG REAL (three-bvh-csg)
 *  ------------------------------------------------------------------
 *  DECISIÓN DE DISEÑO (auditoría de vacíos volumétricos):
 *
 *  - Antes los vacíos eran MALLAS SEPARADAS (matDarkVoid) superpuestas a un
 *    sólido cerrado, con cajas 1.15x que sobresalían de las caras ("capas que
 *    sobresalen" del bug) y un mInner gemelo del sólido (riesgo de z-fighting).
 *    Un "túnel" no se veía hueco porque la caja oscura vivía dentro de un cubo
 *    opaco y cerrado.
 *
 *  - Ahora cada vacío se SUSTRAE de verdad del sólido con geometría booleana
 *    (Evaluator + Brush + SUBTRACTION de three-bvh-csg). El resultado es una
 *    única malla 2-manifold con el túnel / patio / atrio / hueco realmente
 *    horadados de lado a lado. Se eliminan mInner, matDarkVoid y las mallas de
 *    vacío: ya no existen capas fantasma ni protuberancias.
 *
 *  - Para que las paredes interiores de los vacíos se perciban (y no se cierren
 *    por backface culling), el material principal se renderiza en DoubleSide
 *    cuando la geometría fue perforada. En modo sólido la cara exterior se ve
 *    idéntica a antes; las superficies interiores reciben solo luz ambiental,
 *    así el vacío se lee como cavidad sombreada (función que cumplía matInner).
 *
 *  - PELIGRO CSG: los planos coplanares (caja de corte exactamente del mismo
 *    tamaño que la cara que atraviesa) degeneran el booleano. Por eso los cortes
 *    pasantes sobresalen 1.02x (2%) en su eje: atraviesan la cara con holgura
 *    numérica pero quedan fundidos dentro del sólido, SIN sobresalir visualmente
 *    (a diferencia del 1.15x anterior que era una caja visible aparte).
 *
 *  - ORDEN DE OPERACIONES: CSG sobre la caja limpia → deform (perturbación
 *    determinista XZ de vértices interiores/no-de-borde) → shear (x += y·k) →
 *    computeVertexNormals → rotación de la malla en state.rotY (igual que antes,
 *    rotY vive en la malla, no en la geometría). Deformar DESPUÉS del CSG es lo
 *    correcto: shear y deform mutan el sólido final (vacíos incluidos) como si
 *    se hubiera tallado el bloque y luego deformado el conjunto, y el CSG recibe
 *    siempre cajas limpias (robusto).
 *  ------------------------------------------------------------------ */
const EVALUATOR = new Evaluator();

/** Penetración de los cortes pasantes: 2% más allá de la cara (evita planos
 *  coplanares en el CSG sin protuberancia visible). */
const PASS_EPS = 1.02;

/** PRNG determinista (mulberry32): el deform anterior usaba Math.random() y al
 *  hacerse visible a través de los vacíos parpadearía en cada rebuild con
 *  sliders. Con semilla por estado, idéntico estado ⇒ idéntico deform. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
        // Túnel / Vano / lucernarios: corte REAL pasante en el eje dir
        const pSize = Math.max(0.18, Math.min(0.7, (op.size || 0.3) * weight * 1.2));
        if (op.dir === 'Y') {
          // Cenital: pozo vertical pasante (también atravesaba antes con h*1.15)
          state.subtractions.push({
            type: 'hole',
            dir: 'Y',
            fracW: pSize,
            fracD: pSize,
          });
        } else if (op.dir === 'Z') {
          // Frontal pasante (Túnel, Vano)
          state.subtractions.push({
            type: 'hole',
            dir: 'Z',
            fracW: pSize,
            fracH: pSize * 1.2,
          });
        } else if (op.dir === 'X') {
          state.subtractions.push({
            type: 'hole',
            dir: 'X',
            fracH: pSize * 1.1,
            fracD: pSize,
          });
        }
        break;
      }

      case 'hollow':
        state.hollowed = true;
        state.hollowFactor = op.factor || 0.65;
        break;

      case 'carve': {
        // Sustracción / Umbral: nicho que abre la cara frontal sin ser pasante
        const cSize = (op.size || 0.4) * weight;
        state.subtractions.push({
          type: 'carve',
          face: op.face || 'front',
          fracW: cSize,
          fracH: cSize * 0.85,
          fracD: 0.55,
          cyFrac: -0.1,
          czFrac: -0.25,
        });
        break;
      }

      case 'open':
        // Abierto: liberación frontal total (corte pasante profundo)
        state.subtractions.push({
          type: 'hole',
          dir: 'Z',
          fracW: (op.size || 0.75) * weight,
          fracH: (op.size || 0.75) * weight,
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
    // DoubleSide cuando hay vacíos reales (o en ghost/wire) para que las
    // paredes interiores de los cortes sean visibles; FrontSide conserva el
    // look clásico en el sólido simple opaco.
    side: isGhost || isWire ? THREE.DoubleSide : THREE.FrontSide,
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

  // Helper para generar geometría facetada o pura (sólido simple, sin CSG)
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

  /**
   * Cortes CSG en espacio LOCAL del sólido (antes de rotY): cada sustracción se
   * materializa como una caja que se resta del volumen. Los cortes pasantes
   * (dir X/Y/Z) sobresalen PASS_EPS en su eje para garantizar el horadado;
   * carve conserva su profundidad parcial (nicho en la cara frontal).
   * La caja de sustracción comparte material con el sólido: el evaluador
   * consolida grupos y el resultado final es UNA sola malla con material único.
   */
  function buildCutBoxes(): Array<{ geo: THREE.BoxGeometry; x: number; y: number; z: number }> {
    const cuts: Array<{ geo: THREE.BoxGeometry; x: number; y: number; z: number }> = [];
    const minDim = Math.min(state.w, state.h, state.d);

    state.subtractions.forEach((sub) => {
      let cw = state.w;
      let ch = state.h;
      let cd = state.d;
      let cy = 0;
      let cz = 0;
      if (sub.type === 'hole') {
        if (sub.dir === 'Z') {
          cw = (sub.fracW ?? 0) * state.w;
          ch = (sub.fracH ?? 0) * state.h;
          cd = state.d * PASS_EPS;
        } else if (sub.dir === 'X') {
          cw = state.w * PASS_EPS;
          ch = (sub.fracH ?? 0) * state.h;
          cd = (sub.fracD ?? 0) * state.d;
        } else if (sub.dir === 'Y') {
          cw = (sub.fracW ?? 0) * state.w;
          ch = state.h * PASS_EPS;
          cd = (sub.fracD ?? 0) * state.d;
        }
      } else if (sub.type === 'carve') {
        // Nicho frontal: atraviesa la cara (2% de holgura) pero NO es pasante
        cw = (sub.fracW ?? 0) * state.w;
        ch = (sub.fracH ?? 0) * state.h;
        cd = (sub.fracD ?? 0) * state.d;
        cy = (sub.cyFrac ?? 0) * state.h;
        cz = (sub.czFrac ?? 0) * state.d;
      }
      if (cw < minDim * 0.01 || ch < minDim * 0.01 || cd < minDim * 0.01) return;
      cuts.push({ geo: new THREE.BoxGeometry(cw, ch, cd), x: 0, y: cy, z: cz });
    });

    // Patio central: pozo vertical pasante de lado a lado (semántica h*1.15
    // previa, ahora horadado real: se ve a través y las paredes son visibles).
    if (state.hasCourt) {
      const cs = Math.max(0.05, state.courtSize || 0.45);
      cuts.push({
        geo: new THREE.BoxGeometry(state.w * cs, state.h * PASS_EPS, state.d * cs),
        x: 0,
        y: 0,
        z: 0,
      });
    }

    // Atrio: DECISIÓN — el antiguo vacío cerrado (h*0.75 sin llegar a la cara
    // superior) era invisible dentro del sólido opaco. Ahora es PAsante
    // SUPERIOR: pozo de luz que conserva su piso original a -0.225h y abre la
    // cubierta (+0.51h), de modo que se percibe desde arriba/axonométrica y
    // recibe la luz puntual del atrio.
    if (state.hasAtrium) {
      const as2 = Math.max(0.05, state.atriumSize || 0.38);
      cuts.push({
        geo: new THREE.BoxGeometry(
          state.w * as2,
          state.h * 0.735, // piso -0.225h → cubierta +0.51h
          state.d * as2
        ),
        x: 0,
        y: state.h * 0.1425,
        z: 0,
      });
    }

    // Espacio interior (hueco total): DECISIÓN — la cavidad cerrada previa
    // (h*0.92, no llegaba a ninguna cara) era invisible. Ahora es pasante
    // superior: luz cenital con muros perimetrales (espesor 1-hollowFactor) y
    // piso cercano a cota baja (-0.46h).
    if (state.hollowed) {
      const hf = Math.max(0.15, Math.min(0.9, state.hollowFactor || 0.65));
      cuts.push({
        geo: new THREE.BoxGeometry(state.w * hf, state.h * 0.97, state.d * hf),
        x: 0,
        y: state.h * 0.025, // -0.46h → +0.51h
        z: 0,
      });
    }
    return cuts;
  }

  /** Deform determinista sobre geometría ya perforada (CSG): perturba XZ de
   *  vértices que NO están en el borde exterior (misma regla 0.85 que el modo
   *  simple), por lo que las paredes de los vacíos se vuelven orgánicas y la
   *  piel exterior se conserva nítida. */
  function deformGeometry(geometry: THREE.BufferGeometry, mag: number) {
    const seed =
      (Math.round(state.w * 100) * 73856093) ^
      (Math.round(state.h * 100) * 19349663) ^
      (Math.round(state.d * 100) * 83492791) ^
      (Math.round(mag * 10000));
    const rand = mulberry32(seed >>> 0);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const onEdge =
        Math.abs(pos.getX(i)) > (state.w / 2) * 0.85 ||
        Math.abs(pos.getY(i)) > (state.h / 2) * 0.85 ||
        Math.abs(pos.getZ(i)) > (state.d / 2) * 0.85;
      if (!onEdge) {
        pos.setX(i, pos.getX(i) + (rand() - 0.5) * mag * state.w);
        pos.setZ(i, pos.getZ(i) + (rand() - 0.5) * mag * state.d);
      }
    }
    pos.needsUpdate = true;
  }

  /** Shear (sesgo): x += y·shearX sobre el sólido final (vacíos incluidos). */
  function shearGeometry(geometry: THREE.BufferGeometry, k: number) {
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + pos.getY(i) * k);
    }
    pos.needsUpdate = true;
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
    const hasVoids =
      state.subtractions.length > 0 || state.hasCourt || state.hasAtrium || state.hollowed;
    const cuts = buildCutBoxes();

    if (hasVoids && cuts.length > 0) {
      // ---- SÓLIDO PERFORADO REAL (CSG) ------------------------------
      const solidGeo = new THREE.BoxGeometry(state.w, state.h, state.d);
      const dummyMat = new THREE.MeshBasicMaterial(); // mismo material ⇒ 1 grupo

      let current = new Brush(solidGeo, dummyMat);
      current.updateMatrixWorld(true);
      let first = true;
      for (const cut of cuts) {
        const cutBrush = new Brush(cut.geo, dummyMat);
        cutBrush.position.set(cut.x, cut.y, cut.z);
        cutBrush.updateMatrixWorld(true);
        const next = EVALUATOR.evaluate(current, cutBrush, SUBTRACTION);
        if (!first) current.geometry.dispose();
        current = next;
        first = false;
        cut.geo.dispose();
      }
      // first === false porque hasVoids garantiza al menos un corte
      const csgGeo = current.geometry;
      solidGeo.dispose(); // geometría base original (ya fusionada en el resultado)

      // deform → shear → normales (ver nota de orden arriba)
      if (state.deformMag > 0) deformGeometry(csgGeo, state.deformMag);
      if (state.shearX !== 0) shearGeometry(csgGeo, state.shearX);
      csgGeo.computeVertexNormals();

      // Un solo material para TODO el sólido perforado (matMain en DoubleSide
      // para que las paredes interiores de túnel/patio/atrio se perciban).
      let mainMat: THREE.Material = matMain;
      if (!(isGhost || isWire)) {
        mainMat = matMain.clone();
        (mainMat as THREE.MeshLambertMaterial).side = THREE.DoubleSide;
      }
      const mMain = new THREE.Mesh(csgGeo, mainMat);
      mMain.position.set(0, posY, 0);
      mMain.rotation.y = state.rotY;
      mMain.castShadow = true;
      mMain.receiveShadow = true;
      resultMeshes.push(mMain);

      // Luz interior del atrio (pozo de luz ya real)
      if (state.hasAtrium) {
        const atriumLight = new THREE.PointLight(0xfffaed, 1.6, state.h * 3.5);
        atriumLight.position.set(0, posY + state.h * 0.5, 0);
        resultLights.push(atriumLight);
      }
    } else {
      // ---- SÓLIDO SIMPLE (sin vacíos: camino rápido, sin CSG) ------
      const baseGeo = makeBoxGeo(state.w, state.h, state.d, state.deformMag);
      const mMain = new THREE.Mesh(baseGeo, matMain);
      mMain.position.set(0, posY, 0);
      mMain.rotation.y = state.rotY;

      if (state.shearX !== 0) {
        shearGeometry(mMain.geometry as THREE.BufferGeometry, state.shearX);
        mMain.geometry.computeVertexNormals();
      }

      mMain.castShadow = true;
      mMain.receiveShadow = true;
      resultMeshes.push(mMain);
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

  // 9. WIREFRAME OVERLAY (para modos wire / ghost) — sigue funcionando sobre la
  // geometría perforada: clona la malla CSG resultante, hoyos incluidos.
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
