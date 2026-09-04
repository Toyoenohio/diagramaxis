import { create } from 'zustand';
import { Node, Edge, applyNodeChanges } from '@xyflow/react';
import {
  ProjectRelation,
  NodeParam,
  ArchitecturalReference,
  CoherenceReport,
  CameraViewMode,
  RenderShadingMode,
  AISettings,
} from '../types';
import { CONCEPTS_DATA, ARTIFACTS_DATA } from '../data/architecturalMenu';
import { detectConceptsInText } from '../utils/conceptDetector';
import { STUDY_CASES } from '../data/studyCases';

// Clave de persistencia de la configuración de IA (B5 auditoría): se guarda en
// LocalStorage del navegador SOLO al guardar ajustes (apiKey/provider/customEndpoint).
const AI_SETTINGS_STORAGE_KEY = 'diagramaxis-ai-settings-v1';

interface ProjectState {
  // Metadatos
  isInitialized: boolean;
  projectName: string;
  architectName: string;
  location: string;

  // Conceptos y Artefactos activos
  activeConcepts: string[];
  activeArtifacts: string[];
  nodeParams: Record<string, NodeParam>;
  relations: ProjectRelation[];

  // React Flow Nodos & Aristas
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Discurso y Referencias
  discourse: string;
  detectedConcepts: string[];
  detectedArtifacts: string[];
  references: ArchitecturalReference[];
  isGeneratingDiscourse: boolean;
  isGeneratingReferences: boolean;

  // Parámetros Espaciales 3D
  baseDimensions: { w: number; h: number; d: number };
  northRotation: number;
  cameraMode: CameraViewMode;
  shadingMode: RenderShadingMode;
  showHumanFigure: boolean;
  showShadows: boolean;

  // Configuración de IA
  aiSettings: AISettings;

  // Modales
  isProjectModalOpen: boolean;
  isRelationModalOpen: boolean;
  isStudyCasesModalOpen: boolean;
  isSettingsModalOpen: boolean;

  // Toast
  toastMessage: string | null;

  // Acciones
  initProject: (project: string, architect: string, location: string) => void;
  setProjectMetadata: (data: { projectName?: string; architectName?: string; location?: string }) => void;
  toggleConcept: (id: string) => void;
  toggleArtifact: (id: string) => void;
  setNodeParam: (id: string, field: 'weight' | 'intensity', value: number) => void;
  addRelation: (rel: Omit<ProjectRelation, 'id'>) => void;
  removeRelation: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;

  // React Flow Sync
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  autoLayoutNodes: () => void;

  // Discurso
  setDiscourse: (text: string) => void;
  syncDiscourseToDiagram: () => void;
  setReferences: (refs: ArchitecturalReference[]) => void;
  setIsGeneratingDiscourse: (loading: boolean) => void;
  setIsGeneratingReferences: (loading: boolean) => void;

  // 3D
  setBaseDimensions: (dim: { w?: number; h?: number; d?: number }) => void;
  setNorthRotation: (rot: number) => void;
  setCameraMode: (mode: CameraViewMode) => void;
  setShadingMode: (mode: RenderShadingMode) => void;
  toggleHumanFigure: () => void;
  toggleShadows: () => void;

  // Casos de Estudio
  loadStudyCase: (caseId: string) => void;

  // Modales & Toasts
  setModalOpen: (modal: 'project' | 'relation' | 'studyCases' | 'settings', open: boolean) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  setAiSettings: (settings: Partial<AISettings>) => void;

  // Evaluación de Coherencia
  getCoherenceReport: () => CoherenceReport;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  isInitialized: false,
  projectName: 'Sin título',
  architectName: 'Arquitecto',
  location: 'Bogotá, Colombia',

  activeConcepts: [],
  activeArtifacts: [],
  nodeParams: {},
  relations: [],

  nodes: [],
  edges: [],
  selectedNodeId: null,

  discourse: '',
  detectedConcepts: [],
  detectedArtifacts: [],
  references: [],
  isGeneratingDiscourse: false,
  isGeneratingReferences: false,

  baseDimensions: { w: 16, h: 8, d: 14 },
  northRotation: 0,
  cameraMode: 'ext',
  shadingMode: 'solid',
  showHumanFigure: true,
  showShadows: true,

  aiSettings: {
    provider: 'cloudflare',
    apiKey: '',
  },

  isProjectModalOpen: false,
  isRelationModalOpen: false,
  isStudyCasesModalOpen: false,
  isSettingsModalOpen: false,

  toastMessage: null,

  initProject: (projectName, architectName, location) => {
    set({
      projectName: projectName || 'Nuevo Proyecto UPA',
      architectName: architectName || 'Arquitecto',
      location: location || 'Bogotá, Colombia',
      isInitialized: true,
      isProjectModalOpen: false,
    });
    get().showToast(`Proyecto "${projectName}" iniciado`);
  },

  setProjectMetadata: (data) => {
    set((state) => ({ ...state, ...data }));
  },

  toggleConcept: (id) => {
    const { activeConcepts, nodeParams, nodes, edges, relations } = get();
    const exists = activeConcepts.includes(id);

    if (exists) {
      // Eliminar
      const newActive = activeConcepts.filter((c) => c !== id);
      const newParams = { ...nodeParams };
      delete newParams[id];
      const newNodes = nodes.filter((n) => n.id !== id);
      const newRelations = relations.filter((r) => r.from !== id && r.to !== id);
      const newEdges = edges.filter((e) => e.source !== id && e.target !== id);

      set({
        activeConcepts: newActive,
        nodeParams: newParams,
        nodes: newNodes,
        relations: newRelations,
        edges: newEdges,
        selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      });
      get().showToast(`Concepto "${id}" retirado`);
    } else {
      // Agregar
      const conceptData = CONCEPTS_DATA.find((c) => c.id === id);
      if (!conceptData) return;

      const newActive = [...activeConcepts, id];
      const newParams = { ...nodeParams, [id]: { weight: 0.6, intensity: 0.5 } };

      // Calcular posición en espiral/radial
      const count = nodes.length;
      const angle = count * 0.75 + (Math.PI / 6);
      const radius = 90 + Math.sqrt(count) * 75;
      const posX = 380 + Math.cos(angle) * radius;
      const posY = 320 + Math.sin(angle) * radius;

      const newNode: Node = {
        id,
        type: 'conceptNode',
        position: { x: posX, y: posY },
        data: {
          id,
          name: conceptData.name,
          category: conceptData.category,
          subcategory: conceptData.subcategory,
          natures: conceptData.natures,
          has3DOperation: conceptData.has3DOperation,
          isArtifact: false,
          weight: 0.6,
        },
      };

      set({
        activeConcepts: newActive,
        nodeParams: newParams,
        nodes: [...nodes, newNode],
      });
      get().showToast(`Concepto "${id}" activado`);
    }
  },

  toggleArtifact: (id) => {
    const { activeArtifacts, nodeParams, nodes, edges, relations } = get();
    const exists = activeArtifacts.includes(id);

    if (exists) {
      const newActive = activeArtifacts.filter((a) => a !== id);
      const newParams = { ...nodeParams };
      delete newParams[id];
      const newNodes = nodes.filter((n) => n.id !== id);
      const newRelations = relations.filter((r) => r.from !== id && r.to !== id);
      const newEdges = edges.filter((e) => e.source !== id && e.target !== id);

      set({
        activeArtifacts: newActive,
        nodeParams: newParams,
        nodes: newNodes,
        relations: newRelations,
        edges: newEdges,
        selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      });
      get().showToast(`Artefacto "${id}" retirado`);
    } else {
      const artData = ARTIFACTS_DATA.find((a) => a.id === id);
      if (!artData) return;

      const newActive = [...activeArtifacts, id];
      const newParams = { ...nodeParams, [id]: { weight: 0.7, intensity: 0.6 } };

      const count = nodes.length;
      const angle = count * 0.75;
      const radius = 110 + Math.sqrt(count) * 80;
      const posX = 380 + Math.cos(angle) * radius;
      const posY = 320 + Math.sin(angle) * radius;

      const newNode: Node = {
        id,
        type: 'conceptNode',
        position: { x: posX, y: posY },
        data: {
          id,
          name: artData.name,
          category: 'Artefactos',
          subcategory: 'Biblioteca',
          natures: ['G', 'R'],
          has3DOperation: artData.has3DOperation,
          isArtifact: true,
          weight: 0.7,
        },
      };

      set({
        activeArtifacts: newActive,
        nodeParams: newParams,
        nodes: [...nodes, newNode],
      });
      get().showToast(`Artefacto "${id}" activado`);
    }
  },

  setNodeParam: (id, field, value) => {
    const { nodeParams, nodes } = get();
    const current = nodeParams[id] || { weight: 0.6, intensity: 0.5 };
    const updated = { ...current, [field]: value };

    const updatedNodes = nodes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          data: {
            ...n.data,
            [field]: value,
          },
        };
      }
      return n;
    });

    set({
      nodeParams: { ...nodeParams, [id]: updated },
      nodes: updatedNodes,
    });
  },

  addRelation: (relData) => {
    const { relations, edges } = get();
    const id = `rel_${relData.from}_${relData.to}_${Date.now()}`;
    const newRel: ProjectRelation = { ...relData, id };

    const newEdge: Edge = {
      id,
      source: relData.from,
      target: relData.to,
      type: 'customEdge',
      data: {
        relationType: relData.type,
        direction: relData.dir,
        intensity: relData.intensity,
      },
    };

    set({
      relations: [...relations, newRel],
      edges: [...edges, newEdge],
      isRelationModalOpen: false,
    });
    get().showToast(`Relación: ${relData.from} ${relData.dir} ${relData.to} [${relData.type}]`);
  },

  removeRelation: (id) => {
    const { relations, edges } = get();
    set({
      relations: relations.filter((r) => r.id !== id),
      edges: edges.filter((e) => e.id !== id),
    });
    get().showToast('Relación eliminada');
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  setNodes: (nodesOrUpdater) => {
    set((state) => ({
      nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater,
    }));
  },

  setEdges: (edgesOrUpdater) => {
    set((state) => ({
      edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater,
    }));
  },

  onNodesChange: (changes) => {
    // IMPORTANTE: applyNodeChanges devuelve NODOS NUEVOS (objetos inmutables).
    // React Flow 12 (modo controlado) compara por referencia en adoptUserNodes
    // (checkEquality): mutar node.position in-place conserva el fast-path con el
    // internals.positionAbsolute viejo y el nodo NUNCA se mueve durante el drag.
    set((state) => {
      const next = applyNodeChanges(changes, state.nodes);
      // Mantener en sync selectedNodeId con los cambios de selección de React Flow
      const sel = changes.find((c: any) => c.type === 'select');
      if (sel) {
        if (sel.selected) return { nodes: next, selectedNodeId: sel.id };
        if (state.selectedNodeId === sel.id) return { nodes: next, selectedNodeId: null };
      }
      return { nodes: next };
    });
  },

  onEdgesChange: () => {},

  autoLayoutNodes: () => {
    const { nodes } = get();
    if (!nodes.length) return;

    // Agrupación radial por subcategoría / tipo
    const groups: Record<string, Node[]> = {};
    nodes.forEach((n) => {
      const sub = (n.data?.subcategory as string) || 'General';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(n);
    });

    const groupKeys = Object.keys(groups);
    const centerX = 400;
    const centerY = 350;
    const mainRadius = Math.max(160, groupKeys.length * 40);

    const updatedNodes = nodes.map((node) => {
      const sub = (node.data?.subcategory as string) || 'General';
      const groupIdx = groupKeys.indexOf(sub);
      const groupItems = groups[sub];
      const itemIdx = groupItems.findIndex((n) => n.id === node.id);

      const groupAngle = (groupIdx / groupKeys.length) * Math.PI * 2 - Math.PI / 2;
      const gx = centerX + Math.cos(groupAngle) * mainRadius;
      const gy = centerY + Math.sin(groupAngle) * mainRadius;

      const subRadius = 40 + groupItems.length * 15;
      const subAngle = (itemIdx / Math.max(1, groupItems.length)) * Math.PI * 2;

      return {
        ...node,
        position: {
          x: gx + Math.cos(subAngle) * subRadius - 60,
          y: gy + Math.sin(subAngle) * subRadius - 25,
        },
      };
    });

    set({ nodes: updatedNodes });
    get().showToast('Nodos organizados armónicamente por subcategoría');
  },

  setDiscourse: (text) => {
    const { detectedConcepts, detectedArtifacts } = detectConceptsInText(text);
    set({
      discourse: text,
      detectedConcepts,
      detectedArtifacts,
    });
  },

  syncDiscourseToDiagram: () => {
    const { discourse } = get();
    const { detectedConcepts, detectedArtifacts } = detectConceptsInText(discourse);

    let addedCount = 0;
    detectedConcepts.forEach((c) => {
      if (!get().activeConcepts.includes(c)) {
        get().toggleConcept(c);
        addedCount++;
      }
    });

    detectedArtifacts.forEach((a) => {
      if (!get().activeArtifacts.includes(a)) {
        get().toggleArtifact(a);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      get().autoLayoutNodes();
      get().showToast(`${addedCount} concepto(s) activados desde el discurso`);
    } else {
      get().showToast('Todos los conceptos del discurso ya estaban activos');
    }
  },

  setReferences: (references) => set({ references }),
  setIsGeneratingDiscourse: (isGeneratingDiscourse) => set({ isGeneratingDiscourse }),
  setIsGeneratingReferences: (isGeneratingReferences) => set({ isGeneratingReferences }),

  setBaseDimensions: (dim) => {
    set((state) => ({
      baseDimensions: { ...state.baseDimensions, ...dim },
    }));
  },

  setNorthRotation: (northRotation) => set({ northRotation }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setShadingMode: (shadingMode) => set({ shadingMode }),
  toggleHumanFigure: () => set((state) => ({ showHumanFigure: !state.showHumanFigure })),
  toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),

  loadStudyCase: (caseId) => {
    const studyCase = STUDY_CASES.find((c) => c.id === caseId);
    if (!studyCase) return;

    // Reset y carga
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const newParams: Record<string, NodeParam> = {};

    const allItems = [...studyCase.conceptos, ...studyCase.artefactos];
    allItems.forEach((id, idx) => {
      const isArt = studyCase.artefactos.includes(id);
      const cData = CONCEPTS_DATA.find((c) => c.id === id);
      const aData = ARTIFACTS_DATA.find((a) => a.id === id);

      newParams[id] = { weight: 0.7, intensity: 0.6 };

      const angle = (idx / allItems.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 150;
      const posX = 400 + Math.cos(angle) * radius - 60;
      const posY = 350 + Math.sin(angle) * radius - 25;

      newNodes.push({
        id,
        type: 'conceptNode',
        position: { x: posX, y: posY },
        data: {
          id,
          name: isArt ? aData?.name || id : cData?.name || id,
          category: isArt ? 'Artefactos' : cData?.category || 'General',
          subcategory: isArt ? 'Biblioteca' : cData?.subcategory || 'General',
          natures: isArt ? ['G', 'R'] : cData?.natures || ['G'],
          has3DOperation: isArt ? aData?.has3DOperation ?? true : cData?.has3DOperation ?? true,
          isArtifact: isArt,
          weight: 0.7,
        },
      });
    });

    const newRelations: ProjectRelation[] = studyCase.relaciones.map((r, i) => {
      const id = `rel_case_${i}_${Date.now()}`;
      newEdges.push({
        id,
        source: r.from,
        target: r.to,
        type: 'customEdge',
        data: {
          relationType: r.type,
          direction: r.dir,
          intensity: r.intensity,
        },
      });
      return { ...r, id };
    });

    const { detectedConcepts, detectedArtifacts } = detectConceptsInText(studyCase.discurso);

    set({
      projectName: studyCase.title,
      architectName: studyCase.architect,
      location: studyCase.location,
      activeConcepts: [...studyCase.conceptos],
      activeArtifacts: [...studyCase.artefactos],
      nodeParams: newParams,
      relations: newRelations,
      nodes: newNodes,
      edges: newEdges,
      discourse: studyCase.discurso,
      detectedConcepts,
      detectedArtifacts,
      baseDimensions: { ...studyCase.baseDimensions },
      northRotation: studyCase.northRot,
      isStudyCasesModalOpen: false,
    });

    get().showToast(`Caso de estudio "${studyCase.title}" cargado con éxito`);
  },

  setModalOpen: (modal, open) => {
    if (modal === 'project') set({ isProjectModalOpen: open });
    if (modal === 'relation') set({ isRelationModalOpen: open });
    if (modal === 'studyCases') set({ isStudyCasesModalOpen: open });
    if (modal === 'settings') set({ isSettingsModalOpen: open });
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 3500);
  },

  clearToast: () => set({ toastMessage: null }),

  setAiSettings: (settings) => {
    // Persistencia real en LocalStorage (B5 auditoría): la UI promete que la clave
    // se guarda en el navegador, así que se persiste SOLO la config de IA al guardar.
    const merged = { ...get().aiSettings, ...settings };
    set({ aiSettings: merged });
    try {
      localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('No se pudo guardar la configuración de IA en LocalStorage:', e);
    }
    get().showToast('Ajustes de Inteligencia Artificial actualizados');
  },

  getCoherenceReport: () => {
    const { activeConcepts, activeArtifacts, relations, discourse, detectedConcepts, detectedArtifacts } = get();

    const totalActive = activeConcepts.length + activeArtifacts.length;
    const totalDetected = detectedConcepts.length + detectedArtifacts.length;

    if (totalActive === 0) {
      return {
        score: 0,
        level: 'Crítica',
        detectedConceptsCount: 0,
        activeConceptsCount: 0,
        activeArtifactsCount: 0,
        relationsCount: 0,
        orphanedNodes: [],
        discourseCoverage: 0,
        spatialExpressiveness: 0,
        suggestions: ['Comienza activando conceptos arquitectónicos desde el Menú Diagramático.'],
      };
    }

    // 1. Cobertura del Discurso (¿cuántos conceptos activos están narrados?)
    const activeInDiscourse = [...activeConcepts, ...activeArtifacts].filter(
      (name) => detectedConcepts.includes(name) || detectedArtifacts.includes(name)
    );
    const discourseCoverage = Math.round((activeInDiscourse.length / totalActive) * 100);

    // 2. Nodos Huérfanos (¿tienen relaciones?)
    const connectedNodes = new Set<string>();
    relations.forEach((r) => {
      connectedNodes.add(r.from);
      connectedNodes.add(r.to);
    });
    const orphanedNodes = [...activeConcepts, ...activeArtifacts].filter((n) => !connectedNodes.has(n));

    // 3. Expresividad Espacial (densidad de relaciones vs nodos)
    const idealRelations = Math.max(1, totalActive - 1);
    const connectivityRatio = Math.min(1, relations.length / idealRelations);
    const spatialExpressiveness = Math.round(connectivityRatio * 100);

    // 4. Puntuación Global Ponderada (ARPV Triádica: 40% Cobertura Discursiva + 40% Conectividad + 20% Text Length)
    const textBonus = discourse.length > 80 ? 20 : Math.round((discourse.length / 80) * 20);
    const score = Math.min(
      100,
      Math.round(discourseCoverage * 0.4 + spatialExpressiveness * 0.4 + textBonus)
    );

    let level: CoherenceReport['level'] = 'Crítica';
    if (score >= 85) level = 'Excelente';
    else if (score >= 70) level = 'Alta';
    else if (score >= 50) level = 'Media';
    else if (score >= 30) level = 'Baja';

    const suggestions: string[] = [];
    if (orphanedNodes.length > 0) {
      suggestions.push(`Conecta los nodos aislados (${orphanedNodes.slice(0, 3).join(', ')}) mediante "+ Relación".`);
    }
    if (discourseCoverage < 60) {
      suggestions.push('Redacta o actualiza el Discurso Proyectual para fundamentar los conceptos seleccionados.');
    }
    if (relations.length === 0 && totalActive >= 2) {
      suggestions.push('Establece vínculos semánticos (Compositivos, Jerárquicos o Espaciales) entre tus conceptos.');
    }
    if (suggestions.length === 0) {
      suggestions.push('¡Excelente coherencia tripartita! Tu propuesta guarda correspondencia entre el gráfico, el espacio y el discurso.');
    }

    return {
      score,
      level,
      detectedConceptsCount: totalDetected,
      activeConceptsCount: activeConcepts.length,
      activeArtifactsCount: activeArtifacts.length,
      relationsCount: relations.length,
      orphanedNodes,
      discourseCoverage,
      spatialExpressiveness,
      suggestions,
    };
  },
}));

// Hidratación al arrancar: si el usuario guardó antes la configuración de IA en
// LocalStorage, restaurarla sobre el estado inicial (sin pisar lo no persistido).
try {
  const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
  if (raw) {
    const persisted = JSON.parse(raw) as Partial<AISettings>;
    if (persisted && typeof persisted === 'object') {
      const current = useProjectStore.getState().aiSettings;
      useProjectStore.setState({
        aiSettings: {
          ...current,
          ...(typeof persisted.provider === 'string' ? { provider: persisted.provider } : {}),
          ...(typeof persisted.apiKey === 'string' ? { apiKey: persisted.apiKey } : {}),
          ...(typeof persisted.customEndpoint === 'string' ? { customEndpoint: persisted.customEndpoint } : {}),
        },
      });
    }
  }
} catch (e) {
  console.warn('No se pudo restaurar la configuración de IA guardada:', e);
}
