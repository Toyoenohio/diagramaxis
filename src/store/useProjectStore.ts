import { create } from 'zustand';
import { Node, Edge, applyNodeChanges } from '@xyflow/react';
import {
  ProjectRelation,
  NodeParam,
  ProjectObject,
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

  // Objetos 3D Principales (Multivolumen)
  objects: ProjectObject[];
  selectedObjectId: string;

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
  setNodeCustomParam: (id: string, key: string, value: any) => void;
  addRelation: (rel: Omit<ProjectRelation, 'id'>) => void;
  updateRelation: (id: string, updates: Partial<ProjectRelation>) => void;
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

  // Acciones Multi-Objeto 3D
  addObject: (name?: string) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<ProjectObject>) => void;
  setObjectPosition: (id: string, pos: { x?: number; y?: number; z?: number }) => void;
  setObjectDimensions: (id: string, dim: { w?: number; h?: number; d?: number }) => void;
  assignConceptToObject: (conceptId: string, objectId: string) => void;
  unassignConceptFromObject: (conceptId: string, objectId: string) => void;
  setObjectNodeParam: (objectId: string, conceptId: string, field: 'weight' | 'intensity', value: number) => void;
  setObjectNodeCustomParam: (objectId: string, conceptId: string, key: string, value: any) => void;

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

  nodes: [
    {
      id: 'vol-obj-1',
      type: 'volumeNode',
      position: { x: 300, y: 220 },
      data: {
        id: 'vol-obj-1',
        objectId: 'obj-1',
        name: 'Volumen Base 1',
        dimensions: { w: 16, h: 8, d: 14 },
        position: { x: 0, y: 0, z: 0 },
      },
    },
  ],
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

  objects: [
    {
      id: 'obj-1',
      name: 'Objeto 1',
      dimensions: { w: 16, h: 8, d: 14 },
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      assignedConcepts: [],
      nodeParams: {},
    },
  ],
  selectedObjectId: 'obj-1',

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
    const { activeConcepts, nodeParams, nodes, edges, relations, objects } = get();
    const exists = activeConcepts.includes(id);

    if (exists) {
      // Eliminar
      const newActive = activeConcepts.filter((c) => c !== id);
      const newParams = { ...nodeParams };
      delete newParams[id];
      const newNodes = nodes.filter((n) => n.id !== id);
      const newRelations = relations.filter((r) => r.from !== id && r.to !== id);
      const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
      const updatedObjects = objects.map((obj) => ({
        ...obj,
        assignedConcepts: obj.assignedConcepts.filter((c) => c !== id),
        nodeParams: obj.nodeParams
          ? Object.fromEntries(Object.entries(obj.nodeParams).filter(([k]) => k !== id))
          : {},
      }));

      set({
        activeConcepts: newActive,
        nodeParams: newParams,
        nodes: newNodes,
        relations: newRelations,
        edges: newEdges,
        objects: updatedObjects,
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
      get().showToast(`Ficha "${id}" en el tablero. Conecta un hilo al volumen para aplicarla.`);
    }
  },

  toggleArtifact: (id) => {
    const { activeArtifacts, nodeParams, nodes, edges, relations, objects } = get();
    const exists = activeArtifacts.includes(id);

    if (exists) {
      // Eliminar
      const newActive = activeArtifacts.filter((a) => a !== id);
      const newParams = { ...nodeParams };
      delete newParams[id];
      const newNodes = nodes.filter((n) => n.id !== id);
      const newRelations = relations.filter((r) => r.from !== id && r.to !== id);
      const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
      const updatedObjects = objects.map((obj) => ({
        ...obj,
        assignedConcepts: obj.assignedConcepts.filter((c) => c !== id),
        nodeParams: obj.nodeParams
          ? Object.fromEntries(Object.entries(obj.nodeParams).filter(([k]) => k !== id))
          : {},
      }));

      set({
        activeArtifacts: newActive,
        nodeParams: newParams,
        nodes: newNodes,
        relations: newRelations,
        edges: newEdges,
        objects: updatedObjects,
        selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      });
      get().showToast(`Artefacto "${id}" retirado`);
    } else {
      // Agregar
      const artData = ARTIFACTS_DATA.find((a) => a.id === id);
      if (!artData) return;

      const newActive = [...activeArtifacts, id];
      const newParams = { ...nodeParams, [id]: { weight: 0.7, intensity: 0.5 } };

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
      get().showToast(`Artefacto "${id}" en el tablero. Conecta un hilo al volumen para aplicarlo.`);
    }
  },

  setNodeParam: (id, field, value) => {
    const { nodeParams, nodes, objects, selectedObjectId } = get();
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

    const updatedObjects = objects.map((obj) => {
      if (obj.assignedConcepts.includes(id) || obj.id === selectedObjectId) {
        const cur = obj.nodeParams?.[id] || current;
        return {
          ...obj,
          nodeParams: {
            ...(obj.nodeParams || {}),
            [id]: { ...cur, [field]: value },
          },
        };
      }
      return obj;
    });

    set({
      nodeParams: { ...nodeParams, [id]: updated },
      nodes: updatedNodes,
      objects: updatedObjects,
    });
  },

  setNodeCustomParam: (id, key, value) => {
    const { nodeParams, nodes, objects, selectedObjectId } = get();
    const current = nodeParams[id] || { weight: 0.6, intensity: 0.5, custom: {} };
    const custom = { ...(current.custom || {}), [key]: value };
    const updated = { ...current, custom };

    const updatedNodes = nodes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          data: {
            ...n.data,
            custom,
          },
        };
      }
      return n;
    });

    const updatedObjects = objects.map((obj) => {
      if (obj.assignedConcepts.includes(id) || obj.id === selectedObjectId) {
        const cur = obj.nodeParams?.[id] || current;
        const curCustom = { ...(cur.custom || {}), [key]: value };
        return {
          ...obj,
          nodeParams: {
            ...(obj.nodeParams || {}),
            [id]: { ...cur, custom: curCustom },
          },
        };
      }
      return obj;
    });

    set({
      nodeParams: { ...nodeParams, [id]: updated },
      nodes: updatedNodes,
      objects: updatedObjects,
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
      sourceHandle: relData.sourceHandle || undefined,
      targetHandle: relData.targetHandle || undefined,
      type: 'customEdge',
      data: {
        relationType: relData.type,
        direction: relData.dir,
        intensity: relData.intensity,
      },
    };

    // Si la conexión involucra un VolumeNode (e.g. vol-obj-1), vincular el concepto a ese objeto
    let objIdToAssign: string | null = null;
    let conceptIdToAssign: string | null = null;
    let connectedHandle: string | null = null;

    if (relData.from.startsWith('vol-')) {
      objIdToAssign = relData.from.replace('vol-', '');
      conceptIdToAssign = relData.to;
      connectedHandle = relData.sourceHandle ? relData.sourceHandle.replace('-src', '').replace('-tgt', '') : null;
    } else if (relData.to.startsWith('vol-')) {
      objIdToAssign = relData.to.replace('vol-', '');
      conceptIdToAssign = relData.from;
      connectedHandle = relData.targetHandle ? relData.targetHandle.replace('-src', '').replace('-tgt', '') : null;
    }

    if (objIdToAssign && conceptIdToAssign && !conceptIdToAssign.startsWith('vol-')) {
      get().assignConceptToObject(conceptIdToAssign, objIdToAssign);

      // Calibrar peso e intensidad según el pin de conexión en el volumen
      if (connectedHandle === 'port-top') {
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'weight', 0.9);
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'intensity', 0.75);
      } else if (connectedHandle === 'port-bottom') {
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'weight', 0.7);
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'intensity', 0.9);
      } else if (connectedHandle === 'port-left') {
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'weight', 0.5);
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'intensity', 0.65);
      } else if (connectedHandle === 'port-right') {
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'weight', 0.65);
        get().setObjectNodeParam(objIdToAssign, conceptIdToAssign, 'intensity', 0.7);
      }
    }

    set({
      relations: [...relations, newRel],
      edges: [...edges, newEdge],
      isRelationModalOpen: false,
    });
    get().showToast(`Relación: ${relData.from} ${relData.dir} ${relData.to} [${relData.type}]`);
  },

  updateRelation: (id, updates) => {
    const { relations, edges } = get();
    const updatedRelations = relations.map((r) => {
      if (r.id === id) {
        return { ...r, ...updates };
      }
      return r;
    });

    const targetRel = updatedRelations.find((r) => r.id === id);
    const updatedEdges = edges.map((e) => {
      if (e.id === id && targetRel) {
        return {
          ...e,
          data: {
            ...e.data,
            relationType: targetRel.type,
            direction: targetRel.dir,
            intensity: targetRel.intensity,
          },
        };
      }
      return e;
    });

    set({
      relations: updatedRelations,
      edges: updatedEdges,
    });
    if (targetRel) {
      get().showToast(`Relación actualizada: ${targetRel.type} (${targetRel.dir})`);
    }
  },

  removeRelation: (id) => {
    const { relations, edges } = get();
    const relToRemove = relations.find((r) => r.id === id);
    const newRelations = relations.filter((r) => r.id !== id);
    const newEdges = edges.filter((e) => e.id !== id);

    // Si la relación involucraba un volumen y un concepto, revisar si quedan otras relaciones entre ellos
    if (relToRemove) {
      let objId: string | null = null;
      let conceptId: string | null = null;
      if (relToRemove.from.startsWith('vol-')) {
        objId = relToRemove.from.replace('vol-', '');
        conceptId = relToRemove.to;
      } else if (relToRemove.to.startsWith('vol-')) {
        objId = relToRemove.to.replace('vol-', '');
        conceptId = relToRemove.from;
      }

      if (objId && conceptId && !conceptId.startsWith('vol-')) {
        const stillConnected = newRelations.some(
          (r) =>
            (r.from === `vol-${objId}` && r.to === conceptId) ||
            (r.to === `vol-${objId}` && r.from === conceptId)
        );
        if (!stillConnected) {
          get().unassignConceptFromObject(conceptId, objId);
        }
      }
    }

    set({
      relations: newRelations,
      edges: newEdges,
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

  onEdgesChange: (changes) => {
    changes.forEach((change: any) => {
      if (change.type === 'remove') {
        get().removeRelation(change.id);
      }
    });
  },

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
      if (node.type === 'volumeNode') {
        const volNodes = nodes.filter((n) => n.type === 'volumeNode');
        const volIdx = volNodes.findIndex((n) => n.id === node.id);
        const totalVols = volNodes.length;
        const offsetX = (volIdx - (totalVols - 1) / 2) * 260;
        return {
          ...node,
          position: {
            x: centerX + offsetX - 110,
            y: centerY - 70,
          },
        };
      }

      const sub = (node.data?.subcategory as string) || 'General';
      const groupIdx = groupKeys.indexOf(sub);
      const groupItems = groups[sub];
      const itemIdx = groupItems.findIndex((n) => n.id === node.id);

      const groupAngle = (groupIdx / Math.max(1, groupKeys.length)) * Math.PI * 2 - Math.PI / 2;
      const gx = centerX + Math.cos(groupAngle) * (mainRadius + 80);
      const gy = centerY + Math.sin(groupAngle) * (mainRadius + 80);

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
    const { selectedObjectId, baseDimensions, nodes, objects } = get();
    const updatedDims = { ...baseDimensions, ...dim };
    const updatedNodes = nodes.map((n) => {
      if (n.type === 'volumeNode' && n.data?.objectId === selectedObjectId) {
        return {
          ...n,
          data: {
            ...n.data,
            dimensions: updatedDims,
          },
        };
      }
      return n;
    });
    set({
      baseDimensions: updatedDims,
      objects: objects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, dimensions: updatedDims }
          : obj
      ),
      nodes: updatedNodes,
    });
  },

  setNorthRotation: (northRotation) => set({ northRotation }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setShadingMode: (shadingMode) => set({ shadingMode }),
  toggleHumanFigure: () => set((state) => ({ showHumanFigure: !state.showHumanFigure })),
  toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),

  addObject: (name?: string) => {
    const { objects, nodes } = get();
    const nextIdx = objects.length + 1;
    const newId = `obj-${Date.now().toString(36)}`;
    const lastObj = objects[objects.length - 1];
    const offsetX = lastObj ? lastObj.position.x + lastObj.dimensions.w + 6 : 20;
    const newObj: ProjectObject = {
      id: newId,
      name: name || `Objeto ${nextIdx}`,
      dimensions: { w: 14, h: 8, d: 14 },
      position: { x: offsetX, y: 0, z: 0 },
      rotationY: 0,
      assignedConcepts: [],
      nodeParams: {},
    };
    const newVolNode: Node = {
      id: `vol-${newId}`,
      type: 'volumeNode',
      position: { x: 300 + objects.length * 280, y: 220 },
      data: {
        id: `vol-${newId}`,
        objectId: newId,
        name: newObj.name,
        dimensions: newObj.dimensions,
        position: newObj.position,
      },
    };
    set({
      objects: [...objects, newObj],
      selectedObjectId: newId,
      nodes: [...nodes, newVolNode],
    });
    get().showToast(`Nuevo "${newObj.name}" añadido al espacio y tablero`);
  },

  removeObject: (id: string) => {
    const { objects, selectedObjectId, nodes, edges } = get();
    if (objects.length <= 1) {
      get().showToast('Se requiere al menos un objeto principal');
      return;
    }
    const newObjects = objects.filter((o) => o.id !== id);
    const newSelected = selectedObjectId === id ? newObjects[0].id : selectedObjectId;
    const volNodeId = `vol-${id}`;
    set({
      objects: newObjects,
      selectedObjectId: newSelected,
      nodes: nodes.filter((n) => n.id !== volNodeId),
      edges: edges.filter((e) => e.source !== volNodeId && e.target !== volNodeId),
    });
    get().showToast('Objeto eliminado');
  },

  selectObject: (id: string) => {
    const { objects } = get();
    const found = objects.find((o) => o.id === id);
    if (found) {
      set({
        selectedObjectId: id,
      });
    }
  },

  updateObject: (id: string, updates: Partial<ProjectObject>) => {
    const { nodes } = get();
    const updatedNodes = nodes.map((n) => {
      if (n.type === 'volumeNode' && n.data?.objectId === id) {
        return {
          ...n,
          data: {
            ...n.data,
            name: updates.name || n.data.name,
            dimensions: updates.dimensions || n.data.dimensions,
            position: updates.position || n.data.position,
          },
        };
      }
      return n;
    });
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      nodes: updatedNodes,
    }));
  },

  setObjectPosition: (id: string, pos: { x?: number; y?: number; z?: number }) => {
    const { nodes } = get();
    const updatedNodes = nodes.map((n) => {
      if (n.type === 'volumeNode' && n.data?.objectId === id) {
        return {
          ...n,
          data: {
            ...n.data,
            position: { ...(n.data.position as any), ...pos },
          },
        };
      }
      return n;
    });
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === id ? { ...o, position: { ...o.position, ...pos } } : o
      ),
      nodes: updatedNodes,
    }));
  },

  setObjectDimensions: (id: string, dim: { w?: number; h?: number; d?: number }) => {
    const { nodes } = get();
    const updatedNodes = nodes.map((n) => {
      if (n.type === 'volumeNode' && n.data?.objectId === id) {
        return {
          ...n,
          data: {
            ...n.data,
            dimensions: { ...(n.data.dimensions as any), ...dim },
          },
        };
      }
      return n;
    });
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === id ? { ...o, dimensions: { ...o.dimensions, ...dim } } : o
      ),
      nodes: updatedNodes,
    }));
  },

  assignConceptToObject: (conceptId: string, objectId: string) => {
    const { objects, nodeParams } = get();
    const updated = objects.map((obj) => {
      if (obj.id === objectId) {
        if (!obj.assignedConcepts.includes(conceptId)) {
          return {
            ...obj,
            assignedConcepts: [...obj.assignedConcepts, conceptId],
            nodeParams: {
              ...(obj.nodeParams || {}),
              [conceptId]: obj.nodeParams?.[conceptId] || nodeParams[conceptId] || { weight: 0.6, intensity: 0.5 },
            },
          };
        }
      }
      return obj;
    });
    set({ objects: updated });
    get().showToast(`Ficha asignada al objeto`);
  },

  unassignConceptFromObject: (conceptId: string, objectId: string) => {
    const { objects } = get();
    const updated = objects.map((obj) => {
      if (obj.id === objectId) {
        return {
          ...obj,
          assignedConcepts: obj.assignedConcepts.filter((c) => c !== conceptId),
        };
      }
      return obj;
    });
    set({ objects: updated });
  },

  setObjectNodeParam: (objectId: string, conceptId: string, field: 'weight' | 'intensity', value: number) => {
    set((state) => ({
      objects: state.objects.map((obj) => {
        if (obj.id === objectId) {
          const cur = obj.nodeParams?.[conceptId] || { weight: 0.6, intensity: 0.5 };
          return {
            ...obj,
            nodeParams: {
              ...(obj.nodeParams || {}),
              [conceptId]: { ...cur, [field]: value },
            },
          };
        }
        return obj;
      }),
    }));
  },

  setObjectNodeCustomParam: (objectId: string, conceptId: string, key: string, value: any) => {
    set((state) => ({
      objects: state.objects.map((obj) => {
        if (obj.id === objectId) {
          const cur = obj.nodeParams?.[conceptId] || { weight: 0.6, intensity: 0.5 };
          const custom = { ...(cur.custom || {}), [key]: value };
          return {
            ...obj,
            nodeParams: {
              ...(obj.nodeParams || {}),
              [conceptId]: { ...cur, custom },
            },
          };
        }
        return obj;
      }),
    }));
  },

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
      objects: [
        {
          id: 'obj-1',
          name: 'Volumen Principal',
          dimensions: { ...studyCase.baseDimensions },
          position: { x: 0, y: 0, z: 0 },
          rotationY: 0,
          assignedConcepts: [...studyCase.conceptos, ...studyCase.artefactos],
          nodeParams: newParams,
        },
      ],
      selectedObjectId: 'obj-1',
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
