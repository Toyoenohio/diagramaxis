import { VolumetricOperation } from '../types';

export const VOLUMETRIC_OPERATIONS: Record<string, VolumetricOperation> = {
  // --- EXTENSIONES & ESCALA ---
  'Verticalidad': {
    op: 'extend',
    axis: 'Y',
    factor: 1.7,
    label: 'Extensión vertical',
    pedagogicalTip: 'Eleva la proporción del prisma acentuando la verticalidad frente a la gravedad.',
  },
  'Elevación': {
    op: 'pilotis',
    factor: 1.4,
    height: 0.35,
    label: 'Elevación sobre pilotis',
    pedagogicalTip: 'Despeja la planta baja mediante pilotis, despegando la masa habitada del terreno.',
  },
  'Alto': {
    op: 'extend',
    axis: 'Y',
    factor: 1.6,
    label: 'Desarrollo en altura',
    pedagogicalTip: 'Aumenta la dimensión en Z/Y otorgando esbeltez al volumen.',
  },
  'Expansión': {
    op: 'extend',
    axis: 'XZ',
    factor: 1.45,
    label: 'Expansión horizontal',
    pedagogicalTip: 'Extiende los límites laterales hacia el exterior.',
  },
  'Colosal': {
    op: 'extend',
    axis: 'XYZ',
    factor: 1.6,
    label: 'Escala monumental',
    pedagogicalTip: 'Escala la masa en las tres dimensiones hacia proporciones monumentales.',
  },
  'Ancho': {
    op: 'extend',
    axis: 'X',
    factor: 1.55,
    label: 'Extensión longitudinal',
    pedagogicalTip: 'Amplía la crujía principal en el eje X.',
  },
  'Esbelto': {
    op: 'extend',
    axis: 'Y',
    factor: 1.9,
    label: 'Proporción esbelta',
    pedagogicalTip: 'Comprime la base e incrementa drásticamente la altura.',
  },
  'Horizontalidad': {
    op: 'extend',
    axis: 'XZ',
    factor: 1.4,
    label: 'Predominio horizontal',
    pedagogicalTip: 'Aplana el prisma enfatizando la línea rasante del horizonte.',
  },
  'Lineal (Euclidianas)': {
    op: 'extend',
    axis: 'X',
    factor: 1.8,
    label: 'Volumen longitudinal',
    pedagogicalTip: 'Estira el volumen en un único vector longitudinal.',
  },

  // --- COMPRESIONES ---
  'Angosto': {
    op: 'compress',
    axis: 'X',
    factor: 0.45,
    label: 'Compresión transversal',
    pedagogicalTip: 'Estrecha la sección para crear un pasaje angosto.',
  },
  'Bajo': {
    op: 'compress',
    axis: 'Y',
    factor: 0.45,
    label: 'Compresión vertical',
    pedagogicalTip: 'Reduce la altura acercando la cubierta al plano del suelo.',
  },
  'Robusto': {
    op: 'compress',
    axis: 'Y',
    factor: 0.7,
    label: 'Masa pesada y compacta',
    pedagogicalTip: 'Aumenta el grosor visual asentando firmemente el volumen.',
  },

  // --- SUSTRACCIONES & PERFORACIONES ---
  'Perforación': {
    op: 'perforate',
    dir: 'Z',
    size: 0.35,
    label: 'Perforación pasante',
    pedagogicalTip: 'Sustrae un túnel pasante de lado a lado permitiendo cruzar visualmente la masa.',
  },
  'Espacio interior': {
    op: 'hollow',
    factor: 0.65,
    label: 'Vaciado interior',
    pedagogicalTip: 'Crea una cavidad interna habitable conservando el espesor de los muros perimetrales.',
  },
  'Sustracción': {
    op: 'carve',
    face: 'front',
    size: 0.4,
    label: 'Sustracción volumétrica',
    pedagogicalTip: 'Talla una porción del volumen exterior modelando terrazas o entrantes.',
  },
  'Desfragmentación': {
    op: 'fracture',
    gap: 0.15,
    label: 'Fractura y dislocación',
    pedagogicalTip: 'Quiebra el bloque único en dos masas dislocadas conectadas por el intersticio.',
  },
  'Abierto': {
    op: 'open',
    face: 'front',
    size: 0.75,
    label: 'Liberación de fachada',
    pedagogicalTip: 'Abre completamente la cara frontal desvaneciendo el límite interior-exterior.',
  },

  // --- LUZ & PERFORACIONES CENITALES ---
  'Iluminación': {
    op: 'perforate',
    dir: 'Y',
    size: 0.3,
    label: 'Perforación cenital',
    pedagogicalTip: 'Abre lucernarios en la cubierta permitiendo la entrada cenital de rayos de sol.',
  },
  'Luz': {
    op: 'perforate',
    dir: 'Y',
    size: 0.25,
    label: 'Hendidura de luz cenital',
    pedagogicalTip: 'Corte cenital que proyecta haces lumínicos sobre los muros interiores.',
  },
  'Tragaluz': {
    op: 'perforate',
    dir: 'Y',
    size: 0.2,
    label: 'Lucernario puntual',
    pedagogicalTip: 'Abertura superior que ilumina un punto focal del interior.',
  },

  // --- ADICIONES & CONEXIONES ---
  'Adición': {
    op: 'add',
    face: 'side',
    size: 0.4,
    label: 'Volumen adosado',
    pedagogicalTip: 'Acopla un nuevo cuerpo volumétrico articulado a la masa principal.',
  },
  'Conectividad': {
    op: 'add',
    face: 'side',
    size: 0.35,
    label: 'Cuerpo articulador',
    pedagogicalTip: 'Añade un volumen conector lateral que enlaza recintos.',
  },
  'Hito': {
    op: 'add',
    face: 'top',
    size: 0.25,
    label: 'Remate sobresaliente',
    pedagogicalTip: 'Eleva una torre o hito en cubierta como referencia visual dominante.',
  },

  // --- SESGO, ROTACIÓN & ASIMETRÍA ---
  'Sesgada': {
    op: 'shear',
    axis: 'Y',
    angle: 0.25,
    label: 'Sesgo oblicuo',
    pedagogicalTip: 'Inclina las aristas en diagonal rompiendo la ortogonalidad estricta.',
  },
  'Rotación': {
    op: 'rotate',
    axis: 'Y',
    angle: 0.4,
    label: 'Giro angular',
    pedagogicalTip: 'Rota el prisma respecto a la orientación solar o la trama del sitio.',
  },
  'Asimetría': {
    op: 'shear',
    axis: 'X',
    angle: 0.2,
    label: 'Deformación asimétrica',
    pedagogicalTip: 'Desplaza el eje de gravedad rompiendo la simetría estática.',
  },
  'Angulado': {
    op: 'shear',
    axis: 'Y',
    angle: 0.3,
    label: 'Geometría angulada',
    pedagogicalTip: 'Genera quiebres poliédricos en las esquinas.',
  },

  // --- ESCALONADOS & PROGRESIÓN ---
  'Progresivo': {
    op: 'grade',
    steps: 3,
    dir: 'X',
    label: 'Escalonado progresivo',
    pedagogicalTip: 'Dispone la masa en terrazas escalonadas que descienden suavemente.',
  },
  'Secuencial': {
    op: 'grade',
    steps: 4,
    dir: 'Z',
    label: 'Secuencia escalonada',
    pedagogicalTip: 'Crea una procesión volumétrica escalonada en profundidad.',
  },

  // --- IRREGULARIDAD & ORGÁNICO ---
  'Irregular': {
    op: 'deform',
    mag: 0.14,
    label: 'Facetado irregular',
    pedagogicalTip: 'Perturba los vértices de la geometría generando una topología facetada.',
  },
  'Ritmo Irregular': {
    op: 'deform',
    mag: 0.1,
    label: 'Cadencia sincopada',
    pedagogicalTip: 'Modula las caras con variaciones rítmicas alternadas.',
  },

  // --- SIMETRÍA ---
  'Simetría': {
    op: 'mirror',
    axis: 'X',
    label: 'Composición simétrica',
    pedagogicalTip: 'Duplica las adiciones simétricamente a ambos lados del eje central.',
  },

  // --- ARTEFACTOS DE LA BIBLIOTECA ---
  'Patio': {
    op: 'courtyard',
    size: 0.45,
    label: 'Patio central excavado',
    pedagogicalTip: 'Sustrae el núcleo central abriendo un claustro claustral al cielo.',
  },
  'Atrio': {
    op: 'atrium',
    size: 0.38,
    label: 'Atrio a doble altura',
    pedagogicalTip: 'Crea un vacío interior de gran altura iluminado cenitalmente.',
  },
  'Rampa': {
    op: 'ramp',
    dir: 'X',
    label: 'Rampa arquitectónica',
    pedagogicalTip: 'Incorpora una rampa que conecta el suelo con el nivel principal (promenade).',
  },
  'Basamento': {
    op: 'base',
    height: 0.18,
    label: 'Basamento pétreo',
    pedagogicalTip: 'Eleva el prisma sobre un zócalo sólido que absorbe la topografía.',
  },
  'Túnel': {
    op: 'perforate',
    dir: 'Z',
    size: 0.28,
    label: 'Túnel de penetración',
    pedagogicalTip: 'Horada un pasaje en cota baja para atravesar el edificio.',
  },
  'Vano': {
    op: 'perforate',
    dir: 'Z',
    size: 0.22,
    label: 'Vano rasgado',
    pedagogicalTip: 'Abre una ventana rasgada en la envolvente.',
  },
  'Umbral': {
    op: 'carve',
    face: 'front',
    size: 0.28,
    label: 'Umbral de acceso',
    pedagogicalTip: 'Sustrae una hendidura en la entrada marcando la transición.',
  },
  'Recinto': {
    op: 'add',
    face: 'ext',
    size: 0.5,
    label: 'Pabellón adosado',
    pedagogicalTip: 'Agrega un recinto exterior cerrado en el plano del terreno.',
  },
  'Terraza': {
    op: 'terrace',
    height: 0.2,
    label: 'Terraza jardín en cubierta',
    pedagogicalTip: 'Habilita la azotea como espacio habitable con vistas panorámicas.',
  },
  'Marquesina': {
    op: 'canopy',
    depth: 0.38,
    label: 'Marquesina en voladizo',
    pedagogicalTip: 'Proyecta un plano voladizo sobre el acceso para cobijo del usuario.',
  },
  'Escalera': {
    op: 'grade',
    steps: 5,
    dir: 'X',
    label: 'Escalinata monumental',
    pedagogicalTip: 'Dispone una escalinata que salva el desnivel del basamento.',
  },
  'Balcón': {
    op: 'add',
    face: 'front',
    size: 0.22,
    label: 'Balcón voladizo',
    pedagogicalTip: 'Añade una terraza en voladizo en fachada.',
  },
  'Tamiz': {
    op: 'lattice',
    size: 0.4,
    label: 'Celosía tamizadora',
    pedagogicalTip: 'Añade una pantalla perforada que tamiza la luz solar directa.',
  },
  'Sist. aporticado': {
    op: 'pilotis',
    factor: 1.2,
    height: 0.3,
    label: 'Estructura aporticada',
    pedagogicalTip: 'Malla de soportes puntuales que liberan la envolvente de cargas.',
  },
};

export function getVolumetricOperation(id: string): VolumetricOperation | null {
  return VOLUMETRIC_OPERATIONS[id] || null;
}
