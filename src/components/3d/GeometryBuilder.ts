import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { NodeParam, RenderShadingMode, ProjectRelation } from '../../types';
import { getVolumetricOperation } from '../../data/volumetricOperations';

export interface BuiltVolumeResult {
  meshes: THREE.Mesh[];
  groups: THREE.Group[];
  lights: THREE.Light[];
  history: string[];
  finalDimensions: { w: number; h: number; d: number };
  hasWindFlow?: boolean;
  windIntensity?: number;
  hasHumidity?: boolean;
  humidityIntensity?: number;
  hasVegetation?: boolean;
  hasTopography?: boolean;
}

interface GeometricState {
  w: number;
  h: number;
  d: number;
  rotY: number;
  shearX: number;
  shearZ: number;
  taperTop: number;
  taperFront: number;
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
   * construir el CSG se multiplican por las dimensiones FINALES del sólido.
   */
  subtractions: Array<{
    type: string;
    dir?: string;
    face?: string;
    fracW?: number;
    fracH?: number;
    fracD?: number;
    cxFrac?: number;
    cyFrac?: number;
    czFrac?: number;
  }>;
  hollowed: boolean;
  hollowFactor: number;
  wallThickness: number;
  fractured: boolean;
  fracGap: number;
  fracCount?: number;
  fracDislocation?: number;
  gradeSteps: number;
  gradeDir: 'X' | 'Z';
  deformMag: number;
  hasCanopy: boolean;
  canopyDepth: number;
  hasBase: boolean;
  baseH: number;
  baseRadius: number;
  hasTerrace: boolean;
  hasCourt: boolean;
  courtSize: number;
  courtW?: number;
  courtD?: number;
  courtX?: number;
  courtZ?: number;
  hasAtrium: boolean;
  atriumSize: number;
  hasPilotis: boolean;
  pilotisHeight: number;
  pilotisCount: number;
  hasLattice: boolean;
  latticeDensity: number;
  latticeThickness: number;
  hasBridges: boolean;
  bridgeCount: number;
  bridgeThickness: number;
  hasSpiralRamp: boolean;
  rampTurns: number;
  rampWidth: number;
  hasCantilever: boolean;
  cantileverLength: number;
  cantileverAngle: number;
  hasPerimeterCircuit: boolean;
  circuitWidth: number;
  circuitAngle: number;
  hasThreshold: boolean;
  thresholdDepth: number;
  thresholdPermeability: number;
  isMonolithic: boolean;
  monolithicBevel: number;
  hasLandmark: boolean;
  landmarkHeight: number;
  landmarkScale: number;
  isAnthropocentric: boolean;
  hasLightFissure: boolean;
  lightFissureWidth: number;
  solarIntensity: number;
  hasWater: boolean;
  hasWindFlow: boolean;
  windIntensity: number;
  hasHumidity: boolean;
  humidityIntensity: number;
  hasVegetation: boolean;
  hasTopography: boolean;
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
  shadingMode: RenderShadingMode,
  relations: ProjectRelation[] = []
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
    taperTop: 0,
    taperFront: 0,
    additions: [],
    subtractions: [],
    hollowed: false,
    hollowFactor: 0.65,
    wallThickness: 0.15,
    fractured: false,
    fracGap: 0.18,
    fracCount: 3,
    fracDislocation: 0.12,
    gradeSteps: 0,
    gradeDir: 'X',
    deformMag: 0,
    hasCanopy: false,
    canopyDepth: 0.35,
    hasBase: false,
    baseH: 0.15,
    baseRadius: 2.2,
    hasTerrace: false,
    hasCourt: false,
    courtSize: 0.45,
    courtW: 0.45,
    courtD: 0.45,
    courtX: 0,
    courtZ: 0,
    hasAtrium: false,
    atriumSize: 0.38,
    hasPilotis: false,
    pilotisHeight: 2.0,
    pilotisCount: 4,
    hasLattice: false,
    latticeDensity: 4,
    latticeThickness: 0.04,
    hasBridges: false,
    bridgeCount: 2,
    bridgeThickness: 0.25,
    hasSpiralRamp: false,
    rampTurns: 1.25,
    rampWidth: 0.3,
    hasCantilever: false,
    cantileverLength: 0.6,
    cantileverAngle: 12,
    hasPerimeterCircuit: false,
    circuitWidth: 0.35,
    circuitAngle: 45,
    hasThreshold: false,
    thresholdDepth: 0.3,
    thresholdPermeability: 0.5,
    isMonolithic: false,
    monolithicBevel: 0.05,
    hasLandmark: false,
    landmarkHeight: 1.5,
    landmarkScale: 2.0,
    isAnthropocentric: false,
    hasLightFissure: false,
    lightFissureWidth: 0.25,
    solarIntensity: 1.2,
    hasWater: false,
    hasWindFlow: false,
    windIntensity: 0.5,
    hasHumidity: false,
    humidityIntensity: 0.5,
    hasVegetation: false,
    hasTopography: false,
    history: [],
  };

  // Procesamiento de operaciones en secuencia
  const allItems = [...activeConcepts, ...activeArtifacts];
  allItems.forEach((id) => {
    const op = getVolumetricOperation(id);
    if (!op) return;

    // Modulación relacional en tiempo real
    let factorMod = 1.0;
    let contradiction = false;

    relations.forEach((rel) => {
      const isTarget = rel.to === id;
      const isSource = rel.from === id;
      const isBidi = rel.dir === 'A↔B';
      const intensity = rel.intensity ?? 0.7;

      if (isTarget || (isBidi && isSource)) {
        if (rel.type === 'amplifica') {
          factorMod *= 1 + intensity * 0.45;
        } else if (rel.type === 'restringe') {
          factorMod *= Math.max(0.2, 1 - intensity * 0.45);
        } else if (rel.type === 'contradice') {
          contradiction = true;
        } else if (rel.type === 'tensiona') {
          factorMod *= 1 + intensity * 0.25;
        }
      }
    });

    const param = nodeParams[id] || { weight: 0.6, intensity: 0.5 };
    const weight = Math.max(0.2, (param.weight || 0.6) * factorMod);
    const custom = param.custom || {};

    if (contradiction) {
      state.rotY += 0.25 * weight;
      state.shearX += 0.15 * weight;
    }

    state.history.push(op.label || id);

    switch (op.op) {
      case 'extend': {
        if (id === 'Colosal') {
          const colScale = typeof custom.escalaMonumental === 'number'
            ? (custom.escalaMonumental as number)
            : typeof custom.colossalScale === 'number'
            ? (custom.colossalScale as number)
            : 4.0;
          state.w *= colScale;
          state.h *= colScale;
          state.d *= colScale;
        } else if (id === 'Verticalidad') {
          const esb = typeof custom.esbeltez === 'number' ? (custom.esbeltez as number) : 2.5;
          state.h *= esb;
          state.taperTop = typeof custom.conicidad === 'number' ? (custom.conicidad as number) / 100 : 0.15;
        } else if (op.axis === 'Y') {
          state.h *= 1 + (op.factor! - 1) * weight;
        } else if (op.axis === 'X') {
          state.w *= 1 + (op.factor! - 1) * weight;
        } else if (op.axis === 'XZ') {
          state.w *= 1 + (op.factor! - 1) * weight * 0.7;
          state.d *= 1 + (op.factor! - 1) * weight * 0.7;
        } else if (op.axis === 'XYZ') {
          state.w *= 1 + (op.factor! - 1) * weight * 0.55;
          state.h *= 1 + (op.factor! - 1) * weight * 0.55;
          state.d *= 1 + (op.factor! - 1) * weight * 0.55;
        }
        break;
      }

      case 'anthropocentric': {
        state.isAnthropocentric = true;
        state.taperFront = typeof custom.proximidadConvergencia === 'number' ? (custom.proximidadConvergencia as number) : 0.5;
        break;
      }

      case 'anthropometric': {
        const mod = typeof custom.escalaModulos === 'number' ? (custom.escalaModulos as number) : 3;
        const unit = 1.8;
        state.w = Math.max(1, Math.round(mod)) * unit;
        state.h = Math.max(1, Math.round(mod)) * unit;
        state.d = Math.max(1, Math.round(mod)) * unit;
        break;
      }

      case 'perimeter_circuit': {
        state.hasPerimeterCircuit = true;
        state.circuitWidth = typeof custom.anchoCircuito === 'number' ? (custom.anchoCircuito as number) : 0.35;
        state.circuitAngle = typeof custom.anguloAproximacion === 'number' ? (custom.anguloAproximacion as number) : 45;
        break;
      }

      case 'threshold_transition': {
        state.hasThreshold = true;
        state.thresholdDepth = typeof custom.profundidadUmbral === 'number' ? (custom.profundidadUmbral as number) : 0.3;
        state.thresholdPermeability = typeof custom.permeabilidad === 'number' ? (custom.permeabilidad as number) / 100 : 0.5;
        break;
      }

      case 'monolithic': {
        state.isMonolithic = true;
        state.monolithicBevel = typeof custom.bisel === 'number' ? (custom.bisel as number) : 0.05;
        state.fractured = false;
        state.additions = [];
        break;
      }

      case 'order_regularize': {
        const sym = typeof custom.fuerzaSimetria === 'number' ? (custom.fuerzaSimetria as number) / 100 : 0.8;
        state.shearX *= (1 - sym);
        state.shearZ *= (1 - sym);
        const mean = (state.w + state.d) / 2;
        state.w = state.w * (1 - sym) + mean * sym;
        state.d = state.d * (1 - sym) + mean * sym;
        break;
      }

      case 'axial_path': {
        const axW = typeof custom.aperturaEje === 'number' ? (custom.aperturaEje as number) : 0.4;
        const axAng = typeof custom.orientacionEje === 'number' ? (custom.orientacionEje as number) : 0;
        state.subtractions.push({
          type: 'hole',
          dir: 'Z',
          fracW: Math.max(0.1, axW),
          fracH: Math.max(0.1, axW * 1.3),
          fracD: 1.05,
        });
        if (axAng !== 0) state.rotY += (axAng * Math.PI) / 180 * 0.2;
        break;
      }

      case 'coplanar_align': {
        const snap = typeof custom.rigidezCoplanar === 'number' ? (custom.rigidezCoplanar as number) / 100 : 0.85;
        state.rotY *= (1 - snap);
        state.shearX *= (1 - snap);
        state.shearZ *= (1 - snap);
        break;
      }

      case 'landmark': {
        state.hasLandmark = true;
        state.landmarkHeight = typeof custom.prominenciaRemate === 'number' ? (custom.prominenciaRemate as number) : 1.5;
        state.landmarkScale = typeof custom.contrasteEscala === 'number' ? (custom.contrasteEscala as number) : 2.0;
        break;
      }

      case 'centripetal': {
        state.hasCourt = true;
        state.courtSize = typeof custom.radioNucleo === 'number' ? (custom.radioNucleo as number) : 0.35;
        break;
      }

      case 'grid_lattice': {
        state.hasLattice = true;
        state.latticeDensity = typeof custom.densidadSubdivisiones === 'number' ? Math.max(1, Math.min(10, Math.round(custom.densidadSubdivisiones as number))) : 4;
        state.latticeThickness = typeof custom.grosorPerfil === 'number' ? (custom.grosorPerfil as number) : 0.04;
        break;
      }

      case 'connector_bridge': {
        state.hasBridges = true;
        state.bridgeCount = typeof custom.numeroPuentes === 'number' ? Math.max(1, Math.min(5, Math.round(custom.numeroPuentes as number))) : 2;
        state.bridgeThickness = typeof custom.grosorConector === 'number' ? (custom.grosorConector as number) : 0.25;
        break;
      }

      case 'spiral_ramp': {
        state.hasSpiralRamp = true;
        state.rampTurns = typeof custom.vueltasRampa === 'number' ? (custom.vueltasRampa as number) : 1.25;
        state.rampWidth = typeof custom.anchoBanda === 'number' ? (custom.anchoBanda as number) : 0.3;
        break;
      }

      case 'cantilever_flare': {
        state.hasCantilever = true;
        state.cantileverLength = typeof custom.longitudProyeccion === 'number' ? (custom.longitudProyeccion as number) : 0.6;
        state.cantileverAngle = typeof custom.anguloFlare === 'number' ? (custom.anguloFlare as number) : 12;
        break;
      }

      case 'compress':
        if (op.axis === 'Y') state.h *= op.factor! + (1 - op.factor!) * (1 - weight);
        else if (op.axis === 'X') state.w *= op.factor! + (1 - op.factor!) * (1 - weight);
        break;

      case 'perforate': {
        if (id === 'Iluminación') {
          state.hasLightFissure = true;
          state.lightFissureWidth = typeof custom.aperturaFisura === 'number' ? (custom.aperturaFisura as number) / 100 : 0.25;
          state.solarIntensity = typeof custom.penetracionSolar === 'number' ? (custom.penetracionSolar as number) : 1.2;
          state.subtractions.push({
            type: 'hole',
            dir: 'Y',
            fracW: Math.max(0.08, state.lightFissureWidth),
            fracH: 1.05,
            fracD: 0.8,
          });
        } else if (id === 'Perforación') {
          const rad = typeof custom.radioHoradacion === 'number' ? (custom.radioHoradacion as number) / 100 : 0.4;
          const prof = typeof custom.profundidadCorte === 'number' ? (custom.profundidadCorte as number) : 1.0;
          state.subtractions.push({
            type: 'hole',
            dir: 'Z',
            fracW: Math.max(0.1, rad),
            fracH: Math.max(0.1, rad),
            fracD: prof >= 0.95 ? 1.05 : prof,
          });
        } else {
          // Túnel / Vano / lucernarios: corte REAL pasante en el eje dir con modificadores configurables
          const pSize = Math.max(0.12, Math.min(0.85, (op.size || 0.3) * weight * 1.2));
          const cDir = (custom.voidAxis as string) || op.dir || 'Z';
          const fracW = typeof custom.voidW === 'number' ? (custom.voidW as number) : pSize;
          const fracH = typeof custom.voidH === 'number' ? (custom.voidH as number) : (cDir === 'Z' ? pSize * 1.2 : pSize);
          const fracD = typeof custom.voidD === 'number' ? (custom.voidD as number) : (cDir === 'X' ? pSize : 1.0);
          const cxFrac = typeof custom.voidX === 'number' ? (custom.voidX as number) : 0;
          const cyFrac = typeof custom.voidY === 'number' ? (custom.voidY as number) : 0;
          const czFrac = typeof custom.voidZ === 'number' ? (custom.voidZ as number) : 0;

          state.subtractions.push({
            type: 'hole',
            dir: cDir,
            fracW,
            fracH,
            fracD,
            cxFrac,
            cyFrac,
            czFrac,
          });
        }
        break;
      }

      case 'hollow': {
        state.hollowed = true;
        const thick = typeof custom.espesorMuro === 'number' ? (custom.espesorMuro as number) : 0.15;
        const air = typeof custom.camaraAire === 'number' ? (custom.camaraAire as number) / 100 : 0.75;
        state.wallThickness = thick;
        state.hollowFactor = Math.max(0.2, air * (1 - thick));
        break;
      }

      case 'carve': {
        // Sustracción / Umbral: nicho con modificadores configurables
        const cSize = (op.size || 0.4) * weight;
        const fracW = typeof custom.voidW === 'number' ? (custom.voidW as number) : cSize;
        const fracH = typeof custom.voidH === 'number' ? (custom.voidH as number) : cSize * 0.85;
        const fracD = typeof custom.voidD === 'number' ? (custom.voidD as number) : 0.55;
        const cxFrac = typeof custom.voidX === 'number' ? (custom.voidX as number) : 0;
        const cyFrac = typeof custom.voidY === 'number' ? (custom.voidY as number) : -0.1;
        const czFrac = typeof custom.voidZ === 'number' ? (custom.voidZ as number) : -0.25;

        state.subtractions.push({
          type: 'carve',
          face: op.face || 'front',
          fracW,
          fracH,
          fracD,
          cxFrac,
          cyFrac,
          czFrac,
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

      case 'fracture': {
        state.fractured = true;
        state.fracGap = typeof custom.dispersion === 'number'
          ? (custom.dispersion as number)
          : typeof custom.gap === 'number'
          ? (custom.gap as number)
          : 0.18;
        state.fracCount = typeof custom.subdivision === 'number'
          ? Math.max(2, Math.min(8, Math.round(custom.subdivision as number)))
          : typeof custom.fragments === 'number'
          ? Math.max(2, Math.min(8, Math.round(custom.fragments as number)))
          : 3;
        state.fracDislocation = typeof custom.dislocation === 'number' ? (custom.dislocation as number) : 0.12;
        break;
      }

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

      case 'courtyard': {
        const custom = param.custom || {};
        state.hasCourt = true;
        state.courtSize = (op.size || 0.45) * weight;
        state.courtW = typeof custom.courtW === 'number' ? (custom.courtW as number) : state.courtSize;
        state.courtD = typeof custom.courtD === 'number' ? (custom.courtD as number) : state.courtSize;
        state.courtX = typeof custom.courtX === 'number' ? (custom.courtX as number) : 0;
        state.courtZ = typeof custom.courtZ === 'number' ? (custom.courtZ as number) : 0;
        break;
      }

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
        if (typeof custom.radioInfluencia === 'number') {
          state.baseRadius = custom.radioInfluencia as number;
        }
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
        state.pilotisHeight = typeof custom.alturaDespegue === 'number'
          ? (custom.alturaDespegue as number)
          : (op.height ? op.height * state.h : 2.0);
        state.pilotisCount = typeof custom.densidadPilotis === 'number'
          ? Math.round(custom.densidadPilotis as number)
          : (op.steps || 4);
        break;

      case 'lattice':
        state.hasLattice = true;
        break;

      case 'wind_flow':
        state.hasWindFlow = true;
        state.windIntensity = weight;
        // Horada galería pasante de ventilación cruzada
        state.subtractions.push({
          type: 'hole',
          dir: 'Z',
          fracW: Math.max(0.2, 0.4 * weight),
          fracH: Math.max(0.18, 0.3 * weight),
        });
        // Añade aletas deflectoras / captadores de viento aerodinámicos
        state.additions.push({
          ax: -(state.w * 0.32),
          ay: -(state.h * 0.1),
          az: -(state.d / 2 + 0.8),
          aw: Math.max(0.6, state.w * 0.35 * weight),
          ah: state.h * 0.6,
          ad: 0.35,
          label: 'Deflector de Viento',
        });
        break;

      case 'humidity_microclimate':
        state.hasHumidity = true;
        state.humidityIntensity = weight;
        state.hasWater = true;
        state.hasCourt = true;
        state.courtSize = Math.max(0.25, 0.42 * weight);
        break;

      case 'water_feature':
        state.hasWater = true;
        break;

      case 'vegetation_buffer':
        state.hasVegetation = true;
        break;

      case 'topography_terraces':
        state.hasTopography = true;
        state.hasBase = true;
        state.baseH = Math.max(0.15, 0.28 * weight);
        break;

      case 'solar_orientation':
        state.rotY += (op.angle || 0.35) * weight;
        state.hasCanopy = true;
        state.canopyDepth = Math.max(0.25, 0.45 * weight);
        break;

      case 'solar_shading':
        state.hasCanopy = true;
        state.hasLattice = true;
        state.canopyDepth = Math.max(0.3, 0.5 * weight);
        break;

      case 'thermal_envelope':
        state.w *= 1 + 0.12 * weight;
        state.d *= 1 + 0.12 * weight;
        state.additions.push({
          ax: 0,
          ay: 0,
          az: state.d / 2 + 0.3,
          aw: state.w * 1.02,
          ah: state.h * 0.85,
          ad: 0.35,
          label: 'Doble Piel Térmica',
        });
        break;

      case 'acoustic_barrier':
        state.additions.push({
          ax: state.w / 2 + 1.6,
          ay: -(state.h * 0.2),
          az: 0,
          aw: 0.35,
          ah: state.h * 0.6,
          ad: state.d * 1.15,
          label: 'Barrera Acústica',
        });
        break;

      case 'panoramic_frame':
        state.subtractions.push({
          type: 'hole',
          dir: 'Z',
          fracW: Math.max(0.35, 0.62 * weight),
          fracH: Math.max(0.2, 0.38 * weight),
        });
        state.additions.push({
          ax: 0,
          ay: state.h * 0.1,
          az: -(state.d / 2 + 0.6),
          aw: state.w * 0.68,
          ah: state.h * 0.42,
          ad: 0.9,
          label: 'Marco Visual Panorámico',
        });
        break;
    }
  });

  if (activeArtifacts.includes('Agua') || activeConcepts.includes('Humedad')) {
    state.hasWater = true;
  }
  if (activeConcepts.includes('Viento')) {
    state.hasWindFlow = true;
  }
  if (activeConcepts.includes('Preexistencia natural') || activeConcepts.includes('Vegetación')) {
    state.hasVegetation = true;
  }
  if (activeConcepts.includes('Topografía')) {
    state.hasTopography = true;
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

  const posY = state.h / 2 + (state.hasPilotis ? state.pilotisHeight : 0);

  // Helper para generar geometría facetada o pura (sólido simple, sin CSG)
  function makeBoxGeo(w: number, h: number, d: number, deform: number = 0): THREE.BoxGeometry {
    const segs = deform > 0 || state.taperTop > 0 || state.taperFront > 0 ? 8 : 1;
    const geo = new THREE.BoxGeometry(w, h, d, segs, segs, segs);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Verticalidad: Conicidad superior (afinamiento progresivo en la cúspide)
      if (state.taperTop > 0 && y > 0) {
        const factor = Math.max(0.2, 1 - (y / (h / 2)) * state.taperTop);
        pos.setX(i, pos.getX(i) * factor);
        pos.setZ(i, pos.getZ(i) * factor);
      }

      // Antropocéntrico: Convergencia focal hacia el observador frontal
      if (state.taperFront > 0 && z > 0) {
        const factor = Math.max(0.3, 1 - (z / (d / 2)) * (state.taperFront * 0.4));
        pos.setX(i, pos.getX(i) * factor);
      }

      if (deform > 0) {
        const onEdge =
          Math.abs(pos.getX(i)) > (w / 2) * 0.85 ||
          Math.abs(pos.getY(i)) > (h / 2) * 0.85 ||
          Math.abs(pos.getZ(i)) > (d / 2) * 0.85;
        if (!onEdge) {
          pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * deform * w);
          pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * deform * d);
        }
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
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
      let cx = (sub.cxFrac ?? 0) * state.w;
      let cy = (sub.cyFrac ?? 0) * state.h;
      let cz = (sub.czFrac ?? 0) * state.d;
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
      }
      if (cw < minDim * 0.01 || ch < minDim * 0.01 || cd < minDim * 0.01) return;
      cuts.push({ geo: new THREE.BoxGeometry(cw, ch, cd), x: cx, y: cy, z: cz });
    });

    // Patio central: pozo vertical pasante de lado a lado
    if (state.hasCourt) {
      const cw = Math.max(0.05, state.courtW || state.courtSize || 0.45);
      const cd = Math.max(0.05, state.courtD || state.courtSize || 0.45);
      cuts.push({
        geo: new THREE.BoxGeometry(state.w * cw, state.h * PASS_EPS, state.d * cd),
        x: (state.courtX || 0) * state.w,
        y: 0,
        z: (state.courtZ || 0) * state.d,
      });
    }

    // Atrio: DECISIÓN — el antiguo vacío cerrado (h*0.75 sin llegar a la cara
    // superior) era invisible dentro del sólido opaco. Ahora es pasante
    // superior: pozo de luz que conserva su piso original a -0.225h y abre la
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
    const count = Math.max(2, Math.min(8, state.fracCount || 3));
    const Nx = count;
    const Ny = count > 3 ? 2 : count;
    const Nz = count;
    const gapX = state.fracGap * (state.w / Nx);
    const gapY = state.fracGap * (state.h / Ny);
    const gapZ = state.fracGap * (state.d / Nz);
    const bw = Math.max(0.15, (state.w - (Nx - 1) * gapX) / Nx);
    const bh = Math.max(0.15, (state.h - (Ny - 1) * gapY) / Ny);
    const bd = Math.max(0.15, (state.d - (Nz - 1) * gapZ) / Nz);

    const startX = -state.w / 2 + bw / 2;
    const startY = posY - state.h / 2 + bh / 2;
    const startZ = -state.d / 2 + bd / 2;

    const fracGroup = new THREE.Group();
    fracGroup.name = 'fractured_mass';
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x1c1917, linewidth: 1.5 });

    for (let ix = 0; ix < Nx; ix++) {
      for (let iy = 0; iy < Ny; iy++) {
        for (let iz = 0; iz < Nz; iz++) {
          const bx = startX + ix * (bw + gapX);
          const by = startY + iy * (bh + gapY);
          const bz = startZ + iz * (bd + gapZ);

          const bg = makeBoxGeo(bw, bh, bd, state.deformMag);
          const bm = new THREE.Mesh(bg, matMain);
          bm.position.set(bx, by, bz);
          bm.castShadow = true;
          bm.receiveShadow = true;
          fracGroup.add(bm);

          const edgeGeo = new THREE.EdgesGeometry(bg);
          const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);
          bm.add(edgeMesh);
        }
      }
    }
    fracGroup.rotation.y = state.rotY;
    resultGroups.push(fracGroup);
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
    const pH = state.pilotisHeight;
    const colGroup = new THREE.Group();
    colGroup.name = 'pilotis_group';
    const count = state.pilotisCount;
    if (count > 0) {
      const colR = Math.max(0.1, Math.min(0.35, state.w * 0.025));
      const colGeo = new THREE.CylinderGeometry(colR, colR, pH, 16);
      const colsPerSide = Math.max(2, Math.ceil(Math.sqrt(count)));
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / colsPerSide);
        const col = i % colsPerSide;
        const cx = -state.w * 0.4 + (colsPerSide > 1 ? (col / (colsPerSide - 1)) * (state.w * 0.8) : 0);
        const cz = -state.d * 0.4 + (colsPerSide > 1 ? (row / (colsPerSide - 1)) * (state.d * 0.8) : 0);
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

  // 4. BASAMENTO / ESPACIO EXTERIOR
  if (state.hasBase) {
    const bRad = state.baseRadius || 2.2;
    const bh = Math.max(0.4, state.baseH * state.h);
    const bg = new THREE.BoxGeometry(state.w + bRad * 2, bh, state.d + bRad * 2);
    const bm = new THREE.Mesh(bg, matBase);
    bm.position.set(0, bh / 2, 0);
    bm.castShadow = true;
    bm.receiveShadow = true;
    bm.userData = { conceptId: 'Espacio exterior' };
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

  // 7. RETÍCULA MODULAR 3D
  if (state.hasLattice) {
    const latticeGroup = new THREE.Group();
    latticeGroup.name = 'grid_lattice_group';
    const dens = state.latticeDensity || 4;
    const thick = Math.max(0.02, state.latticeThickness || 0.04) * (state.w / 4);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xca8a04 });

    for (let i = 0; i <= dens; i++) {
      const vx = -state.w / 2 + (i / dens) * state.w;
      const vGeo = new THREE.BoxGeometry(thick, state.h, thick);
      const vMesh = new THREE.Mesh(vGeo, frameMat);
      vMesh.position.set(vx, posY, state.d / 2 + thick / 2);
      latticeGroup.add(vMesh);

      const hy = posY - state.h / 2 + (i / dens) * state.h;
      const hGeo = new THREE.BoxGeometry(state.w, thick, thick);
      const hMesh = new THREE.Mesh(hGeo, frameMat);
      hMesh.position.set(0, hy, state.d / 2 + thick / 2);
      latticeGroup.add(hMesh);
    }
    resultGroups.push(latticeGroup);
  }

  // 8. RECORRIDO EXTERIOR (Circuito perimetral y foso)
  if (state.hasPerimeterCircuit) {
    const circuitGroup = new THREE.Group();
    circuitGroup.name = 'perimeter_circuit_group';
    const cWidth = Math.max(0.6, (state.circuitWidth || 0.35) * state.w);
    const cMat = new THREE.MeshLambertMaterial({ color: 0x78716c });
    const outerRadius = Math.max(state.w, state.d) * 0.75;

    const circGeo = new THREE.RingGeometry(outerRadius, outerRadius + cWidth, 32);
    circGeo.rotateX(-Math.PI / 2);
    const circMesh = new THREE.Mesh(circGeo, cMat);
    circMesh.position.set(0, 0.02, 0);
    circMesh.receiveShadow = true;
    circuitGroup.add(circMesh);

    const appAngleRad = ((state.circuitAngle || 45) * Math.PI) / 180;
    const pathLen = outerRadius + cWidth * 2;
    const pathGeo = new THREE.BoxGeometry(cWidth, 0.04, pathLen);
    const pathMesh = new THREE.Mesh(pathGeo, cMat);
    pathMesh.position.set(Math.sin(appAngleRad) * (pathLen / 2), 0.02, Math.cos(appAngleRad) * (pathLen / 2));
    pathMesh.rotation.y = appAngleRad;
    circuitGroup.add(pathMesh);

    resultGroups.push(circuitGroup);
  }

  // 9. TRANSICIÓN (Umbral de doble piel permeable)
  if (state.hasThreshold) {
    const threshGroup = new THREE.Group();
    threshGroup.name = 'threshold_transition_group';
    const tDepth = Math.max(0.4, (state.thresholdDepth || 0.3) * state.w);
    const opacity = Math.max(0.15, Math.min(0.95, 1 - (state.thresholdPermeability || 0.5)));
    const tMat = new THREE.MeshLambertMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
    });
    const paneGeo = new THREE.BoxGeometry(state.w * 1.08, state.h * 1.02, tDepth);
    const paneMesh = new THREE.Mesh(paneGeo, tMat);
    paneMesh.position.set(0, posY, state.d / 2 + tDepth / 2 + 0.05);
    threshGroup.add(paneMesh);
    resultGroups.push(threshGroup);
  }

  // 10. CONECTIVIDAD (Puentes y ductos de enlace)
  if (state.hasBridges) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = 'bridges_group';
    const bCount = state.bridgeCount || 2;
    const bThick = Math.max(0.3, (state.bridgeThickness || 0.25) * state.w * 0.4);
    const bMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });

    for (let b = 0; b < bCount; b++) {
      const bLen = state.w * 0.75;
      const bGeo = new THREE.BoxGeometry(bLen, bThick, bThick);
      const bMesh = new THREE.Mesh(bGeo, bMat);
      const bY = posY - state.h * 0.2 + (b / Math.max(1, bCount - 1)) * (state.h * 0.4);
      const sign = b % 2 === 0 ? 1 : -1;
      bMesh.position.set(sign * (state.w / 2 + bLen / 2), bY, 0);
      bMesh.castShadow = true;
      bridgeGroup.add(bMesh);
    }
    resultGroups.push(bridgeGroup);
  }

  // 11. RECORRIDO (Rampa helicoidal continua)
  if (state.hasSpiralRamp) {
    const rampGroup = new THREE.Group();
    rampGroup.name = 'spiral_ramp_group';
    const turns = state.rampTurns || 1.25;
    const rampW = Math.max(0.4, (state.rampWidth || 0.3) * state.w);
    const rampMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const steps = Math.round(turns * 28);
    const radius = Math.max(state.w, state.d) * 0.68;

    for (let s = 0; s < steps; s++) {
      const theta = (s / steps) * turns * Math.PI * 2;
      const yPos = (s / steps) * state.h;
      const segGeo = new THREE.BoxGeometry(rampW, 0.12, (radius * turns * Math.PI * 2) / steps * 1.2);
      const segMesh = new THREE.Mesh(segGeo, rampMat);
      segMesh.position.set(Math.cos(theta) * radius, yPos + (state.hasPilotis ? state.pilotisHeight : 0), Math.sin(theta) * radius);
      segMesh.rotation.y = -theta;
      segMesh.castShadow = true;
      rampGroup.add(segMesh);
    }
    resultGroups.push(rampGroup);
  }

  // 12. EXPANSIÓN (Proyección telescópica y voladizos en flare)
  if (state.hasCantilever) {
    const cGroup = new THREE.Group();
    cGroup.name = 'cantilever_group';
    const cLen = Math.max(0.5, (state.cantileverLength || 0.6) * state.w);
    const cAngleRad = ((state.cantileverAngle || 12) * Math.PI) / 180;
    const cMat = new THREE.MeshLambertMaterial({ color: 0xe5a93b });

    const trayGeo = new THREE.BoxGeometry(cLen, 0.22, state.d * 0.85);
    const trayL = new THREE.Mesh(trayGeo, cMat);
    trayL.position.set(-(state.w / 2 + cLen / 2), posY + state.h * 0.1, 0);
    trayL.rotation.z = cAngleRad;
    trayL.castShadow = true;
    cGroup.add(trayL);

    const trayR = new THREE.Mesh(trayGeo, cMat);
    trayR.position.set(state.w / 2 + cLen / 2, posY + state.h * 0.2, 0);
    trayR.rotation.z = -cAngleRad;
    trayR.castShadow = true;
    cGroup.add(trayR);

    resultGroups.push(cGroup);
  }

  // 13. HITO (Torre o remate focal destacado)
  if (state.hasLandmark) {
    const lmGroup = new THREE.Group();
    lmGroup.name = 'landmark_group';
    const lmHeight = (state.landmarkHeight || 1.5) * state.h;
    const lmScale = state.landmarkScale || 2.0;
    const lmSize = (state.w * 0.2) * (lmScale / 2);
    const lmMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const lmGeo = new THREE.BoxGeometry(lmSize, lmHeight, lmSize);
    const lmMesh = new THREE.Mesh(lmGeo, lmMat);
    lmMesh.position.set(state.w / 2 - lmSize / 2, posY + state.h / 2 + lmHeight / 2, state.d / 2 - lmSize / 2);
    lmMesh.castShadow = true;
    lmGroup.add(lmMesh);
    resultGroups.push(lmGroup);
  }

  // 14. ILUMINACIÓN CENITAL (Haz solar)
  if (state.hasLightFissure) {
    const sunLight = new THREE.PointLight(0xfff7ed, 2.5 * state.solarIntensity, state.h * 5);
    sunLight.position.set(0, posY + state.h * 0.6, 0);
    sunLight.castShadow = true;
    resultLights.push(sunLight);
  }

  // 8. ESPEJO DE AGUA Y MICROCLIMA
  if (state.hasWater) {
    const waterG = new THREE.BoxGeometry(state.w * 1.5, 0.12, state.d * 1.35);
    const waterM = new THREE.Mesh(waterG, matWater);
    waterM.position.set(0, 0.06, state.d * 0.55);
    waterM.receiveShadow = true;
    waterM.userData = { conceptId: 'Humedad' };
    resultMeshes.push(waterM);

    // Borde pétreo del estanque
    const rimG = new THREE.BoxGeometry(state.w * 1.56, 0.18, state.d * 1.41);
    const rimM = new THREE.Mesh(rimG, matBase);
    rimM.position.set(0, 0.05, state.d * 0.55);
    rimM.receiveShadow = true;
    resultMeshes.push(rimM);
  }

  // 9. VEGETACIÓN & CINTURÓN BIOFÍLICO
  if (state.hasVegetation) {
    const vegGroup = new THREE.Group();
    vegGroup.name = 'vegetation_group';
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.8, 8);
    const foliageGeo = new THREE.SphereGeometry(1.2, 10, 8);

    const treePositions = [
      { x: -(state.w * 0.75), z: -(state.d * 0.65) },
      { x: -(state.w * 0.85), z: 0 },
      { x: -(state.w * 0.7), z: state.d * 0.7 },
      { x: state.w * 0.8, z: -(state.d * 0.6) },
      { x: state.w * 0.85, z: state.d * 0.5 },
      { x: 0, z: -(state.d * 0.85) },
    ];

    treePositions.forEach((pos, idx) => {
      const tree = new THREE.Group();
      const scale = 0.8 + (idx % 3) * 0.25;
      
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.4 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = (2.8 + 0.8) * scale;
      foliage.scale.set(scale, scale * 1.25, scale);
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      tree.add(foliage);

      tree.position.set(pos.x, 0, pos.z);
      vegGroup.add(tree);
    });

    resultGroups.push(vegGroup);
  }

  // 10. TERRAZAS TOPOGRÁFICAS
  if (state.hasTopography) {
    const topoGroup = new THREE.Group();
    topoGroup.name = 'topography_group';
    const topoMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    
    for (let t = 1; t <= 3; t++) {
      const tw = state.w * (1.3 + t * 0.25);
      const td = state.d * (1.3 + t * 0.25);
      const th = 0.45;
      const tGeo = new THREE.BoxGeometry(tw, th, td);
      const tMesh = new THREE.Mesh(tGeo, topoMat);
      tMesh.position.set(t * 0.8, -th * t, t * 0.5);
      tMesh.receiveShadow = true;
      topoGroup.add(tMesh);
    }
    resultGroups.push(topoGroup);
  }

  // 11. WIREFRAME OVERLAY (para modos wire / ghost) — sigue funcionando sobre la
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
    hasWindFlow: state.hasWindFlow,
    windIntensity: state.windIntensity,
    hasHumidity: state.hasHumidity,
    humidityIntensity: state.humidityIntensity,
    hasVegetation: state.hasVegetation,
    hasTopography: state.hasTopography,
  };
}
