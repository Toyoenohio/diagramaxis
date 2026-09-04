import { CONCEPTS_DATA, ARTIFACTS_DATA } from '../data/architecturalMenu';

export interface DetectionResult {
  detectedConcepts: string[];
  detectedArtifacts: string[];
  allFound: string[];
}

// Normalización para eliminar tildes y diacríticos
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Mapa de sinónimos y lemas para reconocimiento robusto
const LEMMA_MAP: Record<string, string> = {
  // Conceptos
  'vertical': 'Verticalidad',
  'verticales': 'Verticalidad',
  'verticalidad': 'Verticalidad',
  'elevado': 'Elevación',
  'elevada': 'Elevación',
  'elevar': 'Elevación',
  'elevacion': 'Elevación',
  'pilotis': 'Elevación',
  'pilotes': 'Elevación',
  'monolito': 'Monolítico',
  'monolitica': 'Monolítico',
  'monolitico': 'Monolítico',
  'colosal': 'Colosal',
  'colosales': 'Colosal',
  'monumental': 'Colosal',
  'desfragmentado': 'Desfragmentación',
  'desfragmentar': 'Desfragmentación',
  'desfragmentacion': 'Desfragmentación',
  'fractura': 'Desfragmentación',
  'iluminado': 'Iluminación',
  'iluminacion': 'Iluminación',
  'luz': 'Luz',
  'luces': 'Luz',
  'perforado': 'Perforación',
  'perforar': 'Perforación',
  'perforacion': 'Perforación',
  'perforaciones': 'Perforación',
  'horadacion': 'Perforación',
  'hueco': 'Perforación',
  'vano': 'Vano',
  'vanos': 'Vano',
  'ventana': 'Vano',
  'abierto': 'Abierto',
  'abierta': 'Abierto',
  'apertura': 'Abierto',
  'horizontal': 'Horizontalidad',
  'horizontales': 'Horizontalidad',
  'horizontalidad': 'Horizontalidad',
  'recorrido': 'Recorrido',
  'recorridos': 'Recorrido',
  'promenade': 'Recorrido',
  'circulacion': 'Circulación horizontal',
  'transicion': 'Transición',
  'umbral': 'Umbral',
  'umbrales': 'Umbral',
  'patio': 'Patio',
  'patios': 'Patio',
  'claustro': 'Patio',
  'atrio': 'Atrio',
  'atrios': 'Atrio',
  'rampa': 'Rampa',
  'rampas': 'Rampa',
  'terraza': 'Terraza',
  'terrazas': 'Terraza',
  'azotea': 'Terraza',
  'marquesina': 'Marquesina',
  'voladizo': 'Marquesina',
  'basamento': 'Basamento',
  'podio': 'Basamento',
  'zocalo': 'Basamento',
  'tragaluz': 'Tragaluz',
  'lucernario': 'Tragaluz',
  'agua': 'Agua',
  'estanque': 'Agua',
  'espejo de agua': 'Agua',
  'jardin': 'Jardín',
  'jardines': 'Jardín',
  'vegetacion': 'Jardín',
  'textura': 'Textura',
  'texturas': 'Textura',
  'tactil': 'Textura',
  'sesgado': 'Sesgada',
  'sesgada': 'Sesgada',
  'diagonal': 'Sesgada',
  'oblicuo': 'Sesgada',
  'irregular': 'Irregular',
  'irregulares': 'Irregular',
  'organico': 'Irregular',
  'regular': 'Regular',
  'ortogonal': 'Regular',
  'simetria': 'Simetría',
  'simetrico': 'Simetría',
  'asimetria': 'Asimetría',
  'asimetrico': 'Asimetría',
  'hito': 'Hito',
  'torre': 'Hito',
  'escala': 'Escala',
  'proporcion': 'Proporción',
  'jerarquia': 'Jerarquía',
  'jerarquico': 'Jerarquía',
  'espacio interior': 'Espacio interior',
  'interior': 'Espacio interior',
  'espacio exterior': 'Espacio exterior',
  'exterior': 'Espacio exterior',
  'visual': 'Visuales',
  'visuales': 'Visuales',
  'vistas': 'Visuales',
  'viento': 'Viento',
  'ventilacion': 'Viento',
  'temperatura': 'Temperatura',
  'termico': 'Temperatura',
  'termica': 'Temperatura',
  'adicion': 'Adición',
  'sustraccion': 'Sustracción',
  'vaciado': 'Sustracción',
  'escalera': 'Escalera',
  'escaleras': 'Escalera',
  'escalinata': 'Escalera',
  'balcon': 'Balcón',
  'balcones': 'Balcón',
  'tamiz': 'Tamiz',
  'celosia': 'Tamiz',
  'filtro': 'Tamiz',
  'progresivo': 'Progresivo',
  'progresiva': 'Progresivo',
  'escalonado': 'Progresivo',
};

export function detectConceptsInText(text: string): DetectionResult {
  if (!text || !text.trim()) {
    return { detectedConcepts: [], detectedArtifacts: [], allFound: [] };
  }

  const normalized = normalizeText(text);
  const foundConcepts = new Set<string>();
  const foundArtifacts = new Set<string>();

  // 1. Detección directa por nombres del menú
  CONCEPTS_DATA.forEach((c) => {
    const cNorm = normalizeText(c.name);
    // Búsqueda de palabra completa o subcadena significativa
    const regex = new RegExp(`\\b${cNorm}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(cNorm)) {
      foundConcepts.add(c.name);
    }
  });

  // 2. Detección directa de artefactos
  ARTIFACTS_DATA.forEach((a) => {
    const aNorm = normalizeText(a.name);
    const regex = new RegExp(`\\b${aNorm}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(aNorm)) {
      foundArtifacts.add(a.name);
    }
  });

  // 3. Detección por lemas y sinónimos
  Object.entries(LEMMA_MAP).forEach(([lemma, targetName]) => {
    const regex = new RegExp(`\\b${lemma}\\b`, 'i');
    if (regex.test(normalized)) {
      const isArt = ARTIFACTS_DATA.some((a) => a.name === targetName);
      if (isArt) {
        foundArtifacts.add(targetName);
      } else {
        foundConcepts.add(targetName);
      }
    }
  });

  const conceptsArr = Array.from(foundConcepts);
  const artifactsArr = Array.from(foundArtifacts);

  return {
    detectedConcepts: conceptsArr,
    detectedArtifacts: artifactsArr,
    allFound: [...conceptsArr, ...artifactsArr],
  };
}
