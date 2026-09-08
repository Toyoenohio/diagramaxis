// Tipos para el Universo Proyectual Arquitectónico (UPA - ARPV)

export type NatureType = 'G' | 'R' | 'Co'; // Generador, Relacional, Condicionante

export interface ArchitecturalConcept {
  id: string;
  name: string;
  category: 'Temas Arquitectónicos' | 'Componentes de la Realidad' | 'Relaciones Paralógicas';
  subcategory: string;
  natures: NatureType[];
  description: string;
  icon?: string;
  has3DOperation: boolean;
}

export interface ArchitecturalArtifact {
  id: string;
  name: string;
  category: 'Artefactos';
  description: string;
  icon?: string;
  has3DOperation: boolean;
}

export type RelationTypeCategory = 'Compositivas' | 'Jerárquicas' | 'Espaciales' | 'Personalizada';

export interface RelationDefinition {
  type: string;
  category: RelationTypeCategory;
  description: string;
  defaultIntensity: number;
}

export interface ProjectRelation {
  id: string;
  from: string;
  to: string;
  type: string;
  dir: 'A→B' | 'B→A' | 'A↔B';
  intensity: number; // 0.0 - 1.0
  notes?: string;
}

export interface NodeParam {
  weight: number;    // 0.1 - 1.0 (peso jerárquico)
  intensity: number; // 0.0 - 1.0 (intensidad/fuerza)
  custom?: Record<string, number | string | boolean>;
}

export type OperationType =
  | 'extend'
  | 'compress'
  | 'perforate'
  | 'hollow'
  | 'carve'
  | 'open'
  | 'fracture'
  | 'add'
  | 'shear'
  | 'rotate'
  | 'grade'
  | 'deform'
  | 'mirror'
  | 'courtyard'
  | 'atrium'
  | 'ramp'
  | 'base'
  | 'terrace'
  | 'canopy'
  | 'pilotis'
  | 'lattice'
  | 'wind_flow'
  | 'humidity_microclimate'
  | 'solar_orientation'
  | 'solar_shading'
  | 'vegetation_buffer'
  | 'topography_terraces'
  | 'acoustic_barrier'
  | 'thermal_envelope'
  | 'panoramic_frame'
  | 'water_feature';

export interface VolumetricOperation {
  op: OperationType;
  axis?: 'X' | 'Y' | 'Z' | 'XZ' | 'XYZ';
  factor?: number;
  dir?: 'X' | 'Y' | 'Z';
  size?: number;
  face?: 'front' | 'back' | 'side' | 'top' | 'ext';
  gap?: number;
  angle?: number;
  steps?: number;
  mag?: number;
  height?: number;
  depth?: number;
  label: string;
  pedagogicalTip?: string;
}

export interface ArchitecturalReference {
  obra: string;
  arquitecto: string;
  año: string;
  ubicacion?: string;
  explicacion: string;
  conceptosClave: string[];
}

export interface StudyCase {
  id: string;
  title: string;
  architect: string;
  year: string;
  location: string;
  description: string;
  conceptos: string[];
  artefactos: string[];
  relaciones: Omit<ProjectRelation, 'id'>[];
  discurso: string;
  baseDimensions: { w: number; h: number; d: number };
  northRot: number;
}

export interface CoherenceReport {
  score: number; // 0 - 100%
  level: 'Excelente' | 'Alta' | 'Media' | 'Baja' | 'Crítica';
  detectedConceptsCount: number;
  activeConceptsCount: number;
  activeArtifactsCount: number;
  relationsCount: number;
  orphanedNodes: string[];
  discourseCoverage: number; // 0 - 100%
  spatialExpressiveness: number; // 0 - 100%
  suggestions: string[];
}

export type CameraViewMode = 'ext' | 'int' | 'iso' | 'top' | 'sec' | 'alz';
export type RenderShadingMode = 'solid' | 'wire' | 'ghost' | 'xray';

export interface AISettings {
  provider: 'cloudflare' | 'anthropic' | 'gemini' | 'openai' | 'local';
  apiKey?: string;
  customEndpoint?: string;
}
