import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useProjectStore } from '../../store/useProjectStore';
import { ConceptNode } from './ConceptNode';
import { CustomEdge } from './CustomEdge';
import { LayoutGrid, Plus, Compass } from 'lucide-react';

const DiagramCanvasInner: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addRelation,
    autoLayoutNodes,
    setModalOpen,
    setSelectedNodeId,
    activeConcepts,
    activeArtifacts,
  } = useProjectStore();

  const nodeTypes = useMemo(() => ({ conceptNode: ConceptNode }), []);
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && params.source !== params.target) {
        addRelation({
          from: params.source,
          to: params.target,
          type: 'define',
          dir: 'A→B',
          intensity: 0.8,
        });
      }
    },
    [addRelation]
  );

  const totalElements = activeConcepts.length + activeArtifacts.length;

  return (
    <div className="relative w-full h-full bg-diagramaxis-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.5}
        className="bg-diagramaxis-bg"
      >
        <Background gap={26} size={1.2} />
        {/* B11 auditoría (limitación aceptada): MiniMap (inferior-derecha) y Controls
            (inferior-izquierda) flotan sobre el tablero en sus posiciones por defecto
            de React Flow; un nodo paneado hasta esas esquinas queda cubierto y no se
            puede arrastrar desde la zona solapada. Moverlos crearía solapes con la
            barra de herramientas y los indicadores propios del panel, por lo que se
            documenta como limitación conocida en lugar de re-posicionarlos. */}
        <Controls
          showInteractive={false}
          className="!bg-diagramaxis-surface !border !border-diagramaxis-border !rounded-sm !shadow-xl [&>button]:!bg-diagramaxis-surface2 [&>button]:!border-diagramaxis-border [&>button]:!text-diagramaxis-gold"
        />
        <MiniMap
          nodeColor={(node) => {
            return node.data?.isArtifact ? 'rgb(var(--da-cyan))' : 'rgb(var(--da-gold))';
          }}
          className="!bg-diagramaxis-surface !border !border-diagramaxis-gold/40 !rounded-sm !shadow-xl !w-28 !h-24"
        />
      </ReactFlow>

      {/* Barra de Herramientas Superior del Tablero */}
      <div className="absolute top-3.5 left-3.5 flex items-center bg-diagramaxis-surface/95 backdrop-blur-md border border-diagramaxis-border shadow-xl rounded-sm p-1.5 gap-1.5 z-10">
        <button
          onClick={() => setModalOpen('relation', true)}
          disabled={totalElements < 2}
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-diagramaxis-bg font-bold disabled:opacity-30 rounded-xs transition-all shadow-[0_0_10px_rgb(var(--da-gold)/0.3)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Hilo / Vínculo</span>
        </button>
        <button
          onClick={autoLayoutNodes}
          disabled={totalElements === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-textBright hover:text-diagramaxis-text border border-diagramaxis-border disabled:opacity-30 rounded-xs transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Ordenar Fichas</span>
        </button>
      </div>

      {/* Indicador de Ayuda Inferior */}
      {totalElements === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <div className="w-16 h-16 rounded-full border border-dashed border-diagramaxis-gold/50 flex items-center justify-center mb-3 bg-diagramaxis-surface/80 shadow-[0_0_15px_rgb(var(--da-gold)/0.15)]">
            <Compass className="w-8 h-8 text-diagramaxis-gold" />
          </div>
          <h3 className="font-serif italic text-[20px] text-diagramaxis-text mb-1">
            Tablero Proyectual DIAGRAMAXIS Vacío
          </h3>
          <p className="font-mono text-[11px] text-diagramaxis-textMuted max-w-[340px] leading-relaxed">
            Selecciona fichas grabadas de los 4 mazos en la bandeja izquierda para disponerlas sobre el tablero y tejer las relaciones con hilos.
          </p>
        </div>
      ) : (
        <div className="absolute bottom-3.5 left-3.5 pointer-events-none bg-diagramaxis-surface/90 backdrop-blur-md border border-diagramaxis-border px-3 py-1.5 rounded-sm shadow-md">
          <span className="font-mono text-[10.5px] text-diagramaxis-textMuted">
            Conecta los pines de las fichas para tejer la red diagramática.
          </span>
        </div>
      )}
    </div>
  );
};

export const DiagramCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner />
    </ReactFlowProvider>
  );
};
