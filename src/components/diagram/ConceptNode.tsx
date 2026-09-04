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
          ? 'ring-2 ring-[#e5a93b] shadow-[0_0_18px_rgba(229,169,59,0.4)]'
          : 'shadow-md'
      }`}
      style={{
        background: isArtifact
          ? 'linear-gradient(135deg, #1c2636 0%, #151e2b 100%)'
          : 'linear-gradient(135deg, #24221f 0%, #1a1815 100%)',
        border: selected
          ? '1px solid #e5a93b'
          : isArtifact
          ? '1px solid rgba(6, 182, 212, 0.4)'
          : '1px solid rgba(229, 169, 59, 0.3)',
      }}
    >
      {/* Conectores con estilo Pin de Tablero / Chincheta */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#e5a93b] !border-2 !border-[#0f1013] !shadow-[0_0_6px_rgba(229,169,59,0.8)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#ea580c] !border-2 !border-[#0f1013] !shadow-[0_0_6px_rgba(234,88,12,0.8)]"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#06b6d4] !border-2 !border-[#0f1013] !shadow-[0_0_6px_rgba(6,182,212,0.8)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#22c55e] !border-2 !border-[#0f1013] !shadow-[0_0_6px_rgba(34,197,94,0.8)]"
      />

      {/* Cabecera de la Ficha Grabada */}
      <div
        className={`px-3 py-1.5 border-b flex items-center justify-between text-[9px] uppercase tracking-wider font-mono font-bold ${
          isArtifact
            ? 'bg-[#06b6d4]/15 text-[#38bdf8] border-[#06b6d4]/25'
            : 'bg-[#2a2824] text-[#e5a93b] border-[#3d3830]'
        }`}
      >
        <div className="flex items-center gap-1 truncate max-w-[140px]">
          <Disc className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{nodeData.subcategory || 'Ficha'}</span>
        </div>
        <button
          onClick={handleDelete}
          title="Retirar ficha del tablero"
          className="nodrag nopan text-[#94a3b8] hover:text-[#ef4444] p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cuerpo de la Ficha */}
      <div className="p-3 flex flex-col gap-2">
        {/* Título grabado */}
        <div className="font-serif italic text-[16px] leading-tight font-bold text-[#f8fafc]">
          {nodeData.name}
        </div>

        {/* Badges de Naturaleza ARPV */}
        <div className="flex flex-wrap items-center gap-1">
          {natures.map((nat) => (
            <span
              key={nat}
              className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-xs border font-semibold ${
                nat === 'G'
                  ? 'border-[#e5a93b]/50 text-[#e5a93b] bg-[#e5a93b]/10'
                  : nat === 'R'
                  ? 'border-[#06b6d4]/50 text-[#06b6d4] bg-[#06b6d4]/10'
                  : 'border-[#ea580c]/50 text-[#ea580c] bg-[#ea580c]/10'
              }`}
            >
              {nat === 'G' ? 'Generador' : nat === 'R' ? 'Relacional' : 'Condicionante'}
            </span>
          ))}
        </div>

        {/* Indicador de Operación 3D */}
        {op && (
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[#c8af88] bg-[#2a251d] px-2 py-1 rounded-xs border border-[#4d4233]">
            <Sparkles className="w-3 h-3 text-[#e5a93b] shrink-0" />
            <span className="truncate">{op.label}</span>
          </div>
        )}

        {/* Slider de Peso Jerárquico */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#3d3830]">
          <span className="text-[9px] font-mono text-[#94a3b8]">Peso:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={param.weight || 0.6}
            onChange={handleWeightChange}
            className="nodrag nopan w-18 h-1 accent-[#e5a93b] cursor-pointer"
          />
          <span className="text-[10px] font-mono font-bold text-[#e5a93b]">
            {(param.weight || 0.6).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
});
