import React, { useCallback, useMemo, useState } from 'react';
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
import { LayoutGrid, Plus, Compass, HelpCircle, X } from 'lucide-react';

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

  const [showPortGuide, setShowPortGuide] = useState(false);

  return (
    <div className="relative w-full h-full bg-diagramaxis-bg overflow-hidden select-none">
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
        <button
          onClick={() => setShowPortGuide(!showPortGuide)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider border rounded-xs transition-all ${
            showPortGuide
              ? 'bg-diagramaxis-cyan text-diagramaxis-bg font-bold border-diagramaxis-cyan'
              : 'bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-textBright hover:text-diagramaxis-text border border-diagramaxis-border'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Guía de Puertos & Taxonomía</span>
        </button>
      </div>

      {/* Modal / Overlay de Guía de Puertos y Taxonomía ARPV */}
      {showPortGuide && (
        <div className="absolute top-16 left-3.5 z-30 w-full max-w-[440px] bg-diagramaxis-surface border border-diagramaxis-gold shadow-2xl rounded-sm p-4 text-diagramaxis-text select-none">
          <div className="flex items-center justify-between border-b border-diagramaxis-border pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-diagramaxis-gold animate-pulse" />
              <h3 className="font-serif italic font-bold text-[16px] text-diagramaxis-text">
                Guía de Puertos y Taxonomía ARPV
              </h3>
            </div>
            <button
              onClick={() => setShowPortGuide(false)}
              className="text-diagramaxis-textMuted hover:text-diagramaxis-danger p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            <div>
              <span className="font-bold text-diagramaxis-gold block uppercase text-[10px] mb-1">
                1. Función de los 4 Puertos de Conexión (Pines de Color):
              </span>
              <div className="grid grid-cols-1 gap-1.5 pl-1">
                <div className="flex items-start gap-2 bg-diagramaxis-bg p-2 rounded-xs border border-diagramaxis-gold/30">
                  <span className="w-3 h-3 rounded-full bg-diagramaxis-gold shrink-0 mt-0.5 shadow-[0_0_6px_rgb(var(--da-gold))]" />
                  <div>
                    <strong className="text-diagramaxis-gold">Pin Superior (Dorado / Oro):</strong>
                    <p className="text-[10px] text-diagramaxis-textMuted leading-tight mt-0.5">
                      <strong>Entrada Jerárquica / Causa:</strong> Recibe órdenes y condicionantes rectores de escala superior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-diagramaxis-bg p-2 rounded-xs border border-diagramaxis-orange/30">
                  <span className="w-3 h-3 rounded-full bg-diagramaxis-orange shrink-0 mt-0.5 shadow-[0_0_6px_rgb(var(--da-orange))]" />
                  <div>
                    <strong className="text-diagramaxis-orange">Pin Inferior (Naranja / Rojo):</strong>
                    <p className="text-[10px] text-diagramaxis-textMuted leading-tight mt-0.5">
                      <strong>Salida Generativa / Efecto:</strong> Emite operaciones morfológicas, transformaciones y consecuencias espaciales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-diagramaxis-bg p-2 rounded-xs border border-diagramaxis-cyan/30">
                  <span className="w-3 h-3 rounded-full bg-diagramaxis-cyan shrink-0 mt-0.5 shadow-[0_0_6px_rgb(var(--da-cyan))]" />
                  <div>
                    <strong className="text-diagramaxis-cyan">Pin Izquierdo (Cyan / Azul):</strong>
                    <p className="text-[10px] text-diagramaxis-textMuted leading-tight mt-0.5">
                      <strong>Entrada Condicionante / Contexto:</strong> Recibe restricciones ambientales (viento, sol, topografía, preexistencias).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-diagramaxis-bg p-2 rounded-xs border border-diagramaxis-success/30">
                  <span className="w-3 h-3 rounded-full bg-diagramaxis-success shrink-0 mt-0.5 shadow-[0_0_6px_rgb(var(--da-success))]" />
                  <div>
                    <strong className="text-diagramaxis-success">Pin Derecho (Verde):</strong>
                    <p className="text-[10px] text-diagramaxis-textMuted leading-tight mt-0.5">
                      <strong>Salida Articuladora / Vínculo:</strong> Conecta relaciones compositivas, ensambles volumétricos y continuidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-diagramaxis-border">
              <span className="font-bold text-diagramaxis-gold block uppercase text-[10px] mb-1">
                2. Taxonomía de las Fichas (Metadatos):
              </span>
              <ul className="flex flex-col gap-1 text-[10px] text-diagramaxis-textMuted">
                <li>
                  <strong className="text-diagramaxis-text">Categorías (Vitruvio):</strong> <em>Firmitas</em> (Estructura/Tectónica), <em>Venustas</em> (Forma/Estética), <em>Utilitas</em> (Función/Habitabilidad).
                </li>
                <li>
                  <strong className="text-diagramaxis-text">Naturalezas ARPV:</strong> <strong>[G]</strong> Generador primario, <strong>[R]</strong> Relacional articulador, <strong>[Co]</strong> Condicionante restrictivo.
                </li>
                <li>
                  <strong className="text-diagramaxis-text">Operación 3D:</strong> Operador geométrico booleano (CSG) que horada, fractura o extiende la masa en Three.js.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
