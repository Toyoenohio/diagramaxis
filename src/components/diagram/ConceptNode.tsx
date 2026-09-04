import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useProjectStore } from '../../store/useProjectStore';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { X, Sparkles, Disc } from 'lucide-react';

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
  const { toggleConcept, toggleArtifact, setNodeParam, nodeParams, setSelectedNodeId } = useProjectStore();

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
      className={`relative min-w-[180px] max-w-[230px] rounded-sm transition-all shadow-xl select-none ${
        selected
          ? 'ring-2 ring-diagramaxis-gold shadow-[0_0_18px_rgb(var(--da-gold)/0.4)]'
          : 'shadow-md'
      }`}
      style={{
        background: isArtifact
          ? 'linear-gradient(135deg, rgb(var(--da-wood-a-art)) 0%, rgb(var(--da-wood-b-art)) 100%)'
          : 'linear-gradient(135deg, rgb(var(--da-wood-a)) 0%, rgb(var(--da-wood-b)) 100%)',
        border: selected
          ? '1px solid rgb(var(--da-gold))'
          : isArtifact
          ? '1px solid rgb(var(--da-cyan)/0.45)'
          : '1px solid rgb(var(--da-gold)/0.32)',
      }}
    >
      {/* Conectores con estilo Pin de Tablero / Chincheta */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-diagramaxis-gold !border-2 !border-diagramaxis-bg !shadow-[0_0_6px_rgb(var(--da-gold)/0.8)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-diagramaxis-orange !border-2 !border-diagramaxis-bg !shadow-[0_0_6px_rgb(var(--da-orange)/0.8)]"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-diagramaxis-cyan !border-2 !border-diagramaxis-bg !shadow-[0_0_6px_rgb(var(--da-cyan)/0.8)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-diagramaxis-success !border-2 !border-diagramaxis-bg !shadow-[0_0_6px_rgb(var(--da-success)/0.8)]"
      />

      {/* Cabecera de la Ficha Grabada */}
      <div
        className={`px-3 py-1.5 border-b flex items-center justify-between text-[9px] uppercase tracking-wider font-mono font-bold ${
          isArtifact
            ? 'bg-diagramaxis-cyan/15 text-diagramaxis-cyanInk border-diagramaxis-cyan/25'
            : 'bg-diagramaxis-nodeHead text-diagramaxis-goldEngraved border-diagramaxis-nodeHeadBorder'
        }`}
      >
        <div className="flex items-center gap-1 truncate max-w-[140px]">
          <Disc className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{nodeData.subcategory || 'Ficha'}</span>
        </div>
        <button
          onClick={handleDelete}
          title="Retirar ficha del tablero"
          className="nodrag nopan text-diagramaxis-woodMuted hover:text-diagramaxis-danger p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

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
      </div>
    </div>
  );
});
