import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useProjectStore } from '../../store/useProjectStore';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { X, Sparkles, Disc, HelpCircle } from 'lucide-react';

interface ConceptNodeData {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  natures?: ('G' | 'R' | 'Co')[];
  has3DOperation: boolean;
  isArtifact: boolean;
  weight?: number;
}

export const ConceptNode: React.FC<NodeProps> = memo(({ id, data, selected }) => {
  const nodeData = data as unknown as ConceptNodeData;
  const {
    toggleConcept,
    toggleArtifact,
    setNodeParam,
    nodeParams,
    setSelectedNodeId,
    objects,
    assignConceptToObject,
    unassignConceptFromObject,
  } = useProjectStore();
  const [showTaxonomyHelp, setShowTaxonomyHelp] = useState(false);

  const assignedObjs = objects.filter((o) => o.assignedConcepts.includes(id));

  const param = nodeParams[id] || { weight: 0.6, intensity: 0.5 };
  const op = getVolumetricOperation(id);

  const isArtifact = nodeData.isArtifact;
  const natures = nodeData.natures || ['G', 'R'];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArtifact) {
      toggleArtifact(id);
    } else {
      toggleConcept(id);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setNodeParam(id, 'weight', parseFloat(e.target.value));
  };

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      className={`relative min-w-[190px] max-w-[240px] bg-diagramaxis-bg dark:bg-diagramaxis-surface transition-colors select-none ${
        selected
          ? 'border-2 border-diagramaxis-gold ring-1 ring-diagramaxis-gold'
          : isArtifact
          ? 'border border-diagramaxis-borderLight hover:border-diagramaxis-gold'
          : 'border border-diagramaxis-border hover:border-diagramaxis-borderLight'
      }`}
    >
      {/* Conectores en Serie: 1 Entrada (Izquierda) y 1 Salida (Derecha) */}
      {/* 1. Puerto de Entrada */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        title="Entrada: Recibe la transformación anterior en la cadena en serie."
        className="!w-3 !h-3 !bg-diagramaxis-cyan !border !border-diagramaxis-bg cursor-crosshair hover:scale-110 transition-transform !z-10"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="input-src"
        title="Entrada"
        className="!w-3 !h-3 !opacity-0 cursor-crosshair !z-20"
      />

      {/* 2. Puerto de Salida */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        title="Salida: Conecta al siguiente modificador en serie o al volumen principal."
        className="!w-3 !h-3 !bg-diagramaxis-gold !border !border-diagramaxis-bg cursor-crosshair hover:scale-110 transition-transform !z-10"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="output-tgt"
        title="Salida"
        className="!w-3 !h-3 !opacity-0 cursor-crosshair !z-20"
      />

      {/* Cabecera de la Ficha Grabada */}
      <div
        className={`px-3 py-1.5 border-b flex items-center justify-between text-[9px] uppercase tracking-wider font-mono font-bold ${
          isArtifact
            ? 'bg-diagramaxis-cyan/15 text-diagramaxis-cyanInk border-diagramaxis-cyan/25'
            : 'bg-diagramaxis-nodeHead text-diagramaxis-goldEngraved border-diagramaxis-nodeHeadBorder'
        }`}
      >
        <div className="flex items-center gap-1 truncate max-w-[130px]">
          <Disc className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{nodeData.subcategory || 'Ficha'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTaxonomyHelp(!showTaxonomyHelp);
            }}
            title="Ayuda taxonómica y propósito de las etiquetas"
            className="nodrag nopan text-diagramaxis-woodMuted hover:text-diagramaxis-gold p-0.5 rounded transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Retirar ficha del tablero"
            className="nodrag nopan text-diagramaxis-woodMuted hover:text-diagramaxis-danger p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Popover Explicativo de Taxonomía y Metadatos */}
      {showTaxonomyHelp && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="nodrag nopan absolute top-7 left-0 right-0 z-30 bg-diagramaxis-surface2 border border-diagramaxis-gold shadow-2xl p-2.5 rounded-sm flex flex-col gap-1.5 font-mono text-[10px] text-diagramaxis-text"
        >
          <div className="flex items-center justify-between border-b border-diagramaxis-border pb-1 font-bold text-diagramaxis-gold">
            <span>Taxonomía ARPV</span>
            <button onClick={() => setShowTaxonomyHelp(false)} className="hover:text-diagramaxis-danger">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div>
            <strong className="text-diagramaxis-gold">Categoría:</strong>{' '}
            <span className="text-diagramaxis-textMuted">{nodeData.category} ({nodeData.subcategory})</span>
            <p className="text-[9px] text-diagramaxis-textBright leading-tight mt-0.5">
              {nodeData.subcategory === 'Firmitas' && 'Dimensión constructiva, tectónica y gravitacional (firmeza/estructura).'}
              {nodeData.subcategory === 'Venustas' && 'Dimensión estética, formal, ritmo y proporción (belleza/forma).'}
              {nodeData.subcategory === 'Utilitas' && 'Dimensión programática, funcional y de habitabilidad (uso/espacio).'}
              {!['Firmitas', 'Venustas', 'Utilitas'].includes(nodeData.subcategory) && 'Marco conceptual del sistema proyectual.'}
            </p>
          </div>
          <div>
            <strong className="text-diagramaxis-cyan">Naturalezas:</strong>
            <ul className="text-[9px] text-diagramaxis-textBright list-disc list-inside leading-tight mt-0.5">
              <li><strong>G (Generador):</strong> Engendra la geometría y la forma rectora.</li>
              <li><strong>R (Relacional):</strong> Vincula o tensiona dos o más conceptos.</li>
              <li><strong>Co (Condicionante):</strong> Restringe o deforma según el entorno.</li>
            </ul>
          </div>
          {op && (
            <div>
              <strong className="text-diagramaxis-orange">Operación 3D:</strong>{' '}
              <span className="text-diagramaxis-textBright">{op.label}</span>
              <p className="text-[9px] text-diagramaxis-textMuted leading-tight mt-0.5">
                {op.pedagogicalTip || 'Transformación morfológica aplicada al sólido Three.js.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cuerpo de la Ficha */}
      <div className="p-3 flex flex-col gap-2">
        {/* Título grabado */}
        <div className="font-serif italic text-[16px] leading-tight font-bold text-diagramaxis-text">
          {nodeData.name}
        </div>

        {/* Badges de Naturaleza ARPV */}
        <div className="flex flex-wrap items-center gap-1">
          {natures.map((nat) => (
            <span
              key={nat}
              className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-xs border font-semibold ${
                nat === 'G'
                  ? 'border-diagramaxis-gold/50 text-diagramaxis-goldEngraved bg-diagramaxis-gold/10'
                  : nat === 'R'
                  ? 'border-diagramaxis-cyan/50 text-diagramaxis-cyanInk bg-diagramaxis-cyan/10'
                  : 'border-diagramaxis-orange/50 text-diagramaxis-orangeInk bg-diagramaxis-orange/10'
              }`}
            >
              {nat === 'G' ? 'Generador' : nat === 'R' ? 'Relacional' : 'Condicionante'}
            </span>
          ))}
        </div>

        {/* Indicador de Operación 3D */}
        {op && (
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-diagramaxis-kraftFg bg-diagramaxis-chipBg px-2 py-1 rounded-xs border border-diagramaxis-chipBorder">
            <Sparkles className="w-3 h-3 text-diagramaxis-goldEngraved shrink-0" />
            <span className="truncate">{op.label}</span>
          </div>
        )}

        {/* Slider de Peso Jerárquico */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-diagramaxis-nodeHeadBorder">
          <span className="text-[9px] font-mono text-diagramaxis-woodMuted">Peso:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={param.weight || 0.6}
            onChange={handleWeightChange}
            className="nodrag nopan w-18 h-1 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="text-[10px] font-mono font-bold text-diagramaxis-goldEngraved">
            {(param.weight || 0.6).toFixed(1)}
          </span>
        </div>

        {/* Asignación a Objeto 3D (cuando hay 2 o más objetos) */}
        {objects.length > 1 && (
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-diagramaxis-nodeHeadBorder/60 text-[9px] font-mono">
            <span className="text-diagramaxis-woodMuted">Objeto:</span>
            <select
              value={assignedObjs[0]?.id || ''}
              onChange={(e) => {
                e.stopPropagation();
                const newObjId = e.target.value;
                objects.forEach((o) => {
                  if (o.id !== newObjId && o.assignedConcepts.includes(id)) {
                    unassignConceptFromObject(id, o.id);
                  }
                });
                if (newObjId) {
                  assignConceptToObject(id, newObjId);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="nodrag nopan bg-diagramaxis-chipBg border border-diagramaxis-chipBorder text-diagramaxis-textBright px-1 py-0.5 rounded-xs outline-none cursor-pointer max-w-[125px] truncate font-sans"
            >
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
});
