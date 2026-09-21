import { VolumetricOperation } from '../types';

export const VOLUMETRIC_OPERATIONS: Record<string, VolumetricOperation> = {
  // =========================================================================
  // --- TEMAS ARQUITECTÓNICOS: LOS 22 CONCEPTOS DE FIRMITAS ---
  // =========================================================================
  'Antropocéntrico': {
    op: 'anthropocentric',
    factor: 1.0,
    label: 'Escala humana focalizada',
    pedagogicalTip: 'Ajusta la jerarquía volumétrica haciendo que el cubo responda a una escala humana focalizada con convergencia de caras hacia el observador.',
  },
  'Antropométrico': {
    op: 'anthropometric',
    steps: 3,
    label: 'Modulación modular antropométrica',
    pedagogicalTip: 'Modulación dimensional en múltiplos estandarizados de altura humana (1 módulo base ≈ 1.80m).',
  },
  'Recorrido exterior': {
    op: 'perimeter_circuit',
    size: 0.35,
    angle: 45,
    label: 'Circuito perimetral y foso',
    pedagogicalTip: 'Proyecta un foso perimetral o pasarela orbital de aproximación alrededor del prisma.',
  },
  'Transición': {
    op: 'threshold_transition',
    depth: 0.3,
    factor: 0.5,
    label: 'Umbral y filtro intermedio',
    pedagogicalTip: 'Genera un umbral o diafragma de doble piel semitransparente entre el exterior y el núcleo.',
  },
  'Monolítico': {
    op: 'monolithic',
    factor: 1.0,
    mag: 0.05,
    label: 'Bloque pétreo macizo',
    pedagogicalTip: 'Suprime juntas y divisiones internas forzando un bloque continuo con biselado pétreo.',
  },
  'Colosal': {
    op: 'extend',
    axis: 'XYZ',
    factor: 4.0,
    label: 'Escala monumental colosal',
    pedagogicalTip: 'Escala volumétrica exponencial que altera drásticamente las relaciones de tamaño relativas a la escena.',
  },
  'Orden': {
    op: 'order_regularize',
    factor: 0.8,
    label: 'Regularización y armonía ortogonal',
    pedagogicalTip: 'Regulariza y alinea proporciones hacia múltiplos ortogonales claros y proporciones armónicas.',
  },
  'Verticalidad': {
    op: 'extend',
    axis: 'Y',
    factor: 2.5,
    label: 'Tensión vertical y esbeltez',
    pedagogicalTip: 'Tensión ascendente que estira el eje vertical mientras estrecha ligeramente la cúspide.',
  },
  'Elevación': {
    op: 'pilotis',
    factor: 1.4,
    height: 0.35,
    steps: 4,
    label: 'Elevación sobre pilotis',
    pedagogicalTip: 'Separa el volumen del plano cero mediante la aparición de pilotis y levitación de masa.',
  },
  'Desfragmentación': {
    op: 'fracture',
    gap: 0.18,
    steps: 3,
    label: 'Fractura en sub-bloques articulados',
    pedagogicalTip: 'Quiebra el cubo sólido en múltiples prismas menores articulados que se separan entre sí en cuadrícula regular.',
  },
  'Iluminación': {
    op: 'perforate',
    dir: 'Y',
    size: 0.25,
    factor: 1.2,
    label: 'Fisuras cenitales y penetración solar',
    pedagogicalTip: 'Genera fisuras de luz cenital o vanos reflectantes por donde entra la radiación luminosa.',
  },
  'Recorrido axial': {
    op: 'axial_path',
    dir: 'Z',
    size: 0.4,
    angle: 0,
    label: 'Túnel axial pasante',
    pedagogicalTip: 'Traza un túnel o canal lineal directo que perfora el cubo de un extremo a otro en un único eje rector.',
  },
  'Espacio interior': {
    op: 'hollow',
    factor: 0.75,
    depth: 0.15,
    label: 'Vaciado interior habitable (Hollowing)',
    pedagogicalTip: 'Vaciado interno del cubo dejando únicamente la corteza estructural con espesor calibrable.',
  },
  'Espacio exterior': {
    op: 'base',
    height: 0.2,
    size: 2.2,
    label: 'Plataformas exteriores y podio',
    pedagogicalTip: 'Proyecta plataformas horizontales bajas y losas que extienden la influencia del cubo hacia el entorno.',
  },
  'Perforación': {
    op: 'perforate',
    dir: 'Z',
    size: 0.4,
    depth: 1.0,
    label: 'Horadación pasante ortogonal',
    pedagogicalTip: 'Horadación o vaciado transversal completo de caras con profundidad de corte graduable.',
  },
  'Alineación': {
    op: 'coplanar_align',
    factor: 0.85,
    label: 'Alineación y rigidez coplanar',
    pedagogicalTip: 'Atrae aristas o bloques sueltos para que coincidan con un plano límite de referencia.',
  },
  'Hito': {
    op: 'landmark',
    factor: 1.5,
    steps: 2,
    label: 'Remate focal sobresaliente (Hito)',
    pedagogicalTip: 'Destaca una arista o torre singular por encima del conjunto para crear contraste focal.',
  },
  'Centro': {
    op: 'centripetal',
    factor: 0.6,
    size: 0.35,
    label: 'Organización centrípeta y claustro',
    pedagogicalTip: 'Organiza la masa de modo centrípeto, atrayendo volúmenes hacia un núcleo central o patio claustral.',
  },
  'Retícula': {
    op: 'grid_lattice',
    steps: 4,
    depth: 0.04,
    label: 'Trama reticular tridimensional',
    pedagogicalTip: 'Proyecta una trama de subdivisiones tridimensionales regulares sobre las caras del cubo.',
  },
  'Conectividad': {
    op: 'connector_bridge',
    steps: 2,
    size: 0.25,
    label: 'Puentes y pasarelas de conexión',
    pedagogicalTip: 'Genera pasarelas, puentes o ductos de unión física entre caras o cuerpos articulados.',
  },
  'Recorrido': {
    op: 'spiral_ramp',
    factor: 1.25,
    size: 0.3,
    label: 'Rampa helicoidal envolvente',
    pedagogicalTip: 'Genera una rampa continua que envuelve helicoidalmente el volumen desde la base hasta la cúspide.',
  },
  'Expansión': {
    op: 'cantilever_flare',
    size: 0.6,
    angle: 12,
    label: 'Proyección telescópica y voladizos',
    pedagogicalTip: 'Proyección telescópica o voladizo de caras exteriores hacia los laterales abriendo el cubo al entorno.',
  },

  // --- OTROS CONCEPTOS & PARÁMETROS GENERALES ---
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
    op: 'horizontality',
    factor: 1.8,
    label: 'Predominio horizontal rasante',
    pedagogicalTip: 'Aplana el prisma y expande su crujía horizontal respecto a la figura humana de 1.75m.',
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

  // --- SUSTRACCIONES & PERFORACIONES (VENUSTAS & CSG) ---
  'Sustracción': {
    op: 'subtraction_custom',
    face: 'front',
    size: 0.4,
    label: 'Sustracción volumétrica CSG',
    pedagogicalTip: 'Talla precisa de cavidades o sustracciones booleanas en caras específicas con ancho, alto y profundidad calibrables.',
  },
  'Abierto': {
    op: 'open_faces',
    face: 'front',
    size: 0.75,
    label: 'Liberación de fachadas múltiples',
    pedagogicalTip: 'Abre selectivamente una o más fachadas del prisma desvaneciendo el límite interior-exterior.',
  },

  // --- LUZ & PERFORACIONES CENITALES ---
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
    op: 'addition_custom',
    face: 'side',
    size: 0.4,
    label: 'Adición de cuerpo configurable',
    pedagogicalTip: 'Acopla un nuevo volumen articulado (prisma, cuña o cilindro) con posición y escala calibrables.',
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
    op: 'rotation_custom',
    axis: 'Y',
    angle: 45,
    label: 'Giro angular preciso',
    pedagogicalTip: 'Rota el prisma respecto a un eje rector calibrable (X, Y o Z).',
  },
  'Asimetría': {
    op: 'asymmetry',
    axis: 'X',
    angle: 0.25,
    label: 'Desplazamiento asimétrico de masa',
    pedagogicalTip: 'Desplaza el centro de masa y genera tensiones asimétricas en la envolvente.',
  },
  'Intersección': {
    op: 'intersection',
    factor: 0.5,
    label: 'Intersección volumétrica',
    pedagogicalTip: 'Entrecruzamiento de dos masas generando un intersticio espacial compartido.',
  },
  'Repetición': {
    op: 'repetition',
    steps: 3,
    gap: 0.4,
    axis: 'X',
    label: 'Repetición modular múltiple',
    pedagogicalTip: 'Replicación seriada del volumen a lo largo del eje rector con separación constante.',
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
    op: 'symmetry',
    axis: 'X',
    label: 'Simetría especular (Ejes X/Y/Z)',
    pedagogicalTip: 'Duplica y refleja la composición simétricamente en el eje seleccionado.',
  },

  // --- TEMAS ARQUITECTÓNICOS: UTILITAS ---
  'Contenedor': {
    op: 'container_contained',
    factor: 1.25,
    label: 'Contenedor estructural macro',
    pedagogicalTip: 'Estructura macro perimetral permeable que alberga el núcleo funcional en su interior.',
  },
  'Contenido': {
    op: 'container_contained',
    factor: 0.7,
    label: 'Masa habitable contenida',
    pedagogicalTip: 'Volumen funcional interior envuelto por una caja perimetral protectora.',
  },
  'Servido': {
    op: 'served_servant',
    factor: 1.0,
    label: 'Espacio principal servido',
    pedagogicalTip: 'Gran nave jerárquica principal exenta de obstrucciones técnicas.',
  },
  'Servidor': {
    op: 'served_servant',
    factor: 0.35,
    label: 'Núcleos de servicio servidores',
    pedagogicalTip: 'Células satélite compactas (núcleos húmedos y circulatorios) adosadas a la masa servida.',
  },
  'Vinculado': {
    op: 'linked_unlinked',
    factor: 1.0,
    label: 'Articulación vinculada',
    pedagogicalTip: 'Conexión franca entre dos cuerpos mediante una rótula o puente espacial.',
  },
  'Desvinculado': {
    op: 'linked_unlinked',
    factor: 0.0,
    label: 'Desacoplamiento e independencia',
    pedagogicalTip: 'Separación franca entre masas creando una cesura o espacio intersticial libre.',
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

  // --- COMPONENTES DE LA REALIDAD: ESPACIO & MEDIO AMBIENTE ---
  'Viento': {
    op: 'wind_flow',
    factor: 1.0,
    label: 'Canalización aerodinámica y ventilación cruzada',
    pedagogicalTip: 'Horada galerías de ventilación pasante en la dirección dominante del viento, bisela aristas y activa el flujo animado de brisas en el visor.',
  },
  'Humedad': {
    op: 'humidity_microclimate',
    factor: 1.0,
    label: 'Espejo de agua y microclima evaporativo',
    pedagogicalTip: 'Integra un espejo de agua basal para refrigeración evaporativa pasiva, abre patios de sombra y genera una neblina higrotérmica ambiental.',
  },
  'Agua': {
    op: 'water_feature',
    factor: 1.0,
    label: 'Lámina de agua basal y canal hídrico',
    pedagogicalTip: 'Extiende un plano de agua reflectante en la cota del terreno que cualifica térmicamente el entorno y refleja la masa edificada.',
  },
  'Visuales': {
    op: 'panoramic_frame',
    size: 0.55,
    label: 'Encuadre visual panorámico',
    pedagogicalTip: 'Abre un gran vano rasgado y voladizo direccionado hacia las líneas de fuga visuales y remates del paisaje exterior.',
  },
  'Orientación': {
    op: 'solar_orientation',
    angle: 0.35,
    label: 'Adaptación heliofánica y aleros',
    pedagogicalTip: 'Ajusta la orientación del volumen respecto al asoleamiento e incorpora aleros protectores contra la radiación directa.',
  },
  'Temperatura': {
    op: 'thermal_envelope',
    factor: 1.3,
    label: 'Inercia térmica y doble piel',
    pedagogicalTip: 'Engrosa la envolvente perimetral generando una cámara de aire amortiguadora que estabiliza el gradiente térmico interior.',
  },
  'Sonido': {
    op: 'acoustic_barrier',
    size: 0.35,
    label: 'Barrera acústica y deflectores',
    pedagogicalTip: 'Dispone pantallas acústicas perimetrales y muros deflectores angulados que absorben y desvían el ruido ambiental.',
  },
  'Preexistencia natural': {
    op: 'vegetation_buffer',
    factor: 1.0,
    label: 'Cinturón vegetal y relieve vivo',
    pedagogicalTip: 'Genera una barrera arbórea y masa vegetal perimetral que actúa como filtro biofílico y amortiguador microclimático.',
  },
  'Preexistencia artificial': {
    op: 'add',
    face: 'ext',
    size: 0.45,
    label: 'Consolidación de medianera y trama',
    pedagogicalTip: 'Adosa volúmenes testigo que representan la preexistencia construida y dialogan con la masa proyectada.',
  },
  'Topografía': {
    op: 'topography_terraces',
    steps: 3,
    label: 'Terrazas topográficas y zócalo',
    pedagogicalTip: 'Moldea el suelo en terrazas escalonadas adaptativas donde el edificio se enclava o suspende.',
  },
  'Vegetación': {
    op: 'vegetation_buffer',
    factor: 1.0,
    label: 'Vegetación amortiguadora',
    pedagogicalTip: 'Integra especies vegetales que sombrean fachadas, retienen humedad y oxigenan el microclima interior y exterior.',
  },
};

export function getVolumetricOperation(id: string): VolumetricOperation | null {
  return VOLUMETRIC_OPERATIONS[id] || null;
}
