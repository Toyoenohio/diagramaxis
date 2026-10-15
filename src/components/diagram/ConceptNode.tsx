import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useProjectStore } from '../../store/useProjectStore';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { X, Sparkles, HelpCircle } from 'lucide-react';

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

const subDotColor = (sub: string): string => {
  if (sub === 'Venustas' || sub === 'Topológicas' || sub === 'Euclidianas/No euclidianas') return 'rgb(var(--da-cyan))';
  if (sub === 'Utilitas' || sub === 'Cronológicas') return 'rgb(var(--da-orange))';
  return 'rgb(var(--da-gold))';
};

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
      className={`relative min-w-[200px] max-w-[240px] rounded-xl bg-diagramaxis-surface transition-all select-none shadow-sm hover:shadow-md ${
        selected
          ? 'border-2 border-diagramaxis-gold shadow-md'
          : 'border border-diagramaxis-border hover:border-diagramaxis-borderLight'
      }`}
    >
      {/* Conectores en Serie: 1 Entrada (Izquierda) y 1 Salida (Derecha) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        title="Entrada: recibe la transformación anterior"
        className="!w-3 !h-3 !rounded-full !bg-diagramaxis-cyan !border-2 !border-diagramaxis-surface cursor-crosshair hover:scale-125 transition-transform !z-10"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="input-src"
        title="Entrada"
        className="!w-3 !h-3 !opacity-0 cursor-crosshair !z-20"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        title="Salida: conecta al siguiente modificador o al volumen"
        className="!w-3 !h-3 !rounded-full !bg-diagramaxis-gold !border-2 !border-diagramaxis-surface cursor-crosshair hover:scale-125 transition-transform !z-10"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="output-tgt"
        title="Salida"
        className="!w-3 !h-3 !opacity-0 cursor-crosshair !z-20"
      />

      {/* Cabecera limpia */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-[11px] text-diagramaxis-textMuted">
        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: subDotColor(nodeData.subcategory) }}
          />
          <span className="font-medium truncate">{nodeData.subcategory || 'Ficha'}</span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTaxonomyHelp(!showTaxonomyHelp);
            }}
            title="Ayuda taxonómica"
            className="nodrag nopan text-diagramaxis-textDim hover:text-diagramaxis-text p-1 rounded-md transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Retirar ficha"
            className="nodrag nopan text-diagramaxis-textDim hover:text-diagramaxis-danger p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Popover Explicativo */}
      {showTaxonomyHelp && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="nodrag nopan absolute top-9 left-0 right-0 z-30 bg-diagramaxis-surface border border-diagramaxis-border shadow-xl p-3 rounded-xl flex flex-col gap-2 text-[11.5px] text-diagramaxis-text"
        >
          <div className="flex items-center justify-between border-b border-diagramaxis-border pb-1.5 font-semibold">
            <span>Taxonomía ARPV</span>
            <button onClick={() => setShowTaxonomyHelp(false)} className="hover:text-diagramaxis-danger">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <strong className="text-diagramaxis-gold">{nodeData.category} ({nodeData.subcategory}):</strong>
            <p className="text-[11px] text-diagramaxis-textMuted leading-snug mt-0.5">
              {nodeData.subcategory === 'Firmitas' && 'Tectónica, gravedad y estructura.'}
              {nodeData.subcategory === 'Venustas' && 'Forma, ritmo, luz y proporción.'}
              {nodeData.subcategory === 'Utilitas' && 'Función, uso y habitabilidad.'}
              {!['Firmitas', 'Venustas', 'Utilitas'].includes(nodeData.subcategory) && 'Marco conceptual del sistema proyectual.'}
            </p>
          </div>
        </div>
      )}

      {/* Cuerpo */}
      <div className="px-3 pb-3 pt-1 flex flex-col gap-2">
        <div className="text-[14px] font-semibold text-diagramaxis-text leading-snug">
          {nodeData.name}
        </div>

        {/* Badges de Naturaleza */}
        <div className="flex flex-wrap items-center gap-1">
          {natures.map((nat) => (
            <span
              key={nat}
              className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-full border border-diagramaxis-border bg-diagramaxis-surface2 text-diagramaxis-textMuted"
            >
              {nat === 'G' ? 'Generador' : nat === 'R' ? 'Relacional' : 'Condicionante'}
            </span>
          ))}
        </div>

        {/* Operación 3D */}
        {op && (
          <div className="flex items-center gap-1.5 text-[11px] text-diagramaxis-textMuted bg-diagramaxis-surface2 px-2 py-1 rounded-md border border-diagramaxis-border">
            <Sparkles className="w-3 h-3 text-diagramaxis-gold shrink-0" />
            <span className="truncate">{op.label}</span>
          </div>
        )}

        {/* Slider de Peso */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-diagramaxis-border text-[11px]">
          <span className="text-diagramaxis-textDim">Peso:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={param.weight || 0.6}
            onChange={handleWeightChange}
            className="nodrag nopan flex-1 h-1 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-semibold text-diagramaxis-text tabular-nums w-6 text-right">
            {(param.weight || 0.6).toFixed(1)}
          </span>
        </div>

        {/* Asignación a Objeto */}
        {objects.length > 1 && (
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-diagramaxis-border text-[11px]">
            <span className="text-diagramaxis-textDim">Aplica a:</span>
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
              className="nodrag nopan bg-diagramaxis-surface2 border border-diagramaxis-border text-diagramaxis-text px-1.5 py-0.5 rounded-md outline-none cursor-pointer max-w-[130px] truncate text-[11px]"
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
