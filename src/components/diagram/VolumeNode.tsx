import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useProjectStore } from '../../store/useProjectStore';
import { Box, Layers } from 'lucide-react';

interface VolumeNodeData {
  id: string;
  objectId: string;
  name: string;
  dimensions: { w: number; h: number; d: number };
  position: { x: number; y: number; z: number };
}

export const VolumeNode: React.FC<NodeProps> = memo(({ id, data, selected }) => {
  const nodeData = data as unknown as VolumeNodeData;
  const { objects, selectedObjectId, selectObject, setSelectedNodeId } = useProjectStore();

  const obj = objects.find((o) => o.id === (nodeData.objectId || 'obj-1')) || objects[0];
  const isSelected = selected || (obj && obj.id === selectedObjectId);

  const dims = obj?.dimensions || nodeData.dimensions || { w: 16, h: 8, d: 14 };
  const assignedCount = obj?.assignedConcepts?.length || 0;

  const handleClick = () => {
    setSelectedNodeId(id);
    if (obj) {
      selectObject(obj.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative min-w-[210px] max-w-[260px] rounded-xl bg-diagramaxis-surface transition-all select-none cursor-pointer shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-2 border-diagramaxis-gold shadow-md'
          : 'border border-diagramaxis-border hover:border-diagramaxis-borderLight'
      }`}
    >
      {/* Puertos de Entrada/Salida Izquierdos */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        title="Entrada: conecta modificadores aquí"
        className="!w-3.5 !h-3.5 !rounded-full !bg-diagramaxis-gold !border-2 !border-diagramaxis-surface cursor-crosshair hover:scale-125 transition-transform !z-20"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="input-src"
        title="Conexión"
        className="!w-3.5 !h-3.5 !opacity-0 cursor-crosshair !z-10"
      />

      {/* Puertos de Entrada/Salida Derechos */}
      <Handle
        type="target"
        position={Position.Right}
        id="input-right"
        title="Entrada: conecta modificadores aquí"
        className="!w-3.5 !h-3.5 !rounded-full !bg-diagramaxis-gold !border-2 !border-diagramaxis-surface cursor-crosshair hover:scale-125 transition-transform !z-20"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-right"
        title="Conexión"
        className="!w-3.5 !h-3.5 !opacity-0 cursor-crosshair !z-10"
      />

      {/* Cabecera */}
      <div className="px-3 py-2.5 border-b border-diagramaxis-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-diagramaxis-gold/10 text-diagramaxis-gold flex items-center justify-center shrink-0">
            <Box className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[13.5px] text-diagramaxis-text truncate">
            {obj?.name || nodeData.name || 'Volumen'}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-diagramaxis-surface2 text-diagramaxis-textMuted font-medium border border-diagramaxis-border">
          Sólido 3D
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-3 flex flex-col gap-2.5">
        <div className="grid grid-cols-3 gap-1.5 text-center bg-diagramaxis-surface2 p-2 rounded-lg border border-diagramaxis-border">
          <div>
            <div className="text-[10px] text-diagramaxis-textDim">Ancho (X)</div>
            <div className="text-[13px] font-semibold text-diagramaxis-text tabular-nums">{dims.w}m</div>
          </div>
          <div>
            <div className="text-[10px] text-diagramaxis-textDim">Alto (Y)</div>
            <div className="text-[13px] font-semibold text-diagramaxis-gold tabular-nums">{dims.h}m</div>
          </div>
          <div>
            <div className="text-[10px] text-diagramaxis-textDim">Prof (Z)</div>
            <div className="text-[13px] font-semibold text-diagramaxis-text tabular-nums">{dims.d}m</div>
          </div>
        </div>

        {/* Resumen */}
        <div className="flex items-center justify-between text-[11.5px] text-diagramaxis-textMuted pt-0.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-diagramaxis-textDim" />
            <span>Modificadores:</span>
          </div>
          <span className="font-medium text-diagramaxis-text tabular-nums">
            {assignedCount} {assignedCount === 1 ? 'en serie' : 'en serie'}
          </span>
        </div>

        {/* Lista visual de secuencia en serie activa */}
        {assignedCount > 0 && obj?.assignedConcepts && obj.assignedConcepts.length > 0 && (
          <div className="flex flex-col gap-1 pt-1.5 border-t border-diagramaxis-border text-[11px]">
            <span className="text-[10px] font-semibold text-diagramaxis-gold uppercase tracking-wider">
              Secuencia fusionada:
            </span>
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
              {obj.assignedConcepts.map((cId, idx) => (
                <div
                  key={cId}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-diagramaxis-surface2 border border-diagramaxis-border text-diagramaxis-text truncate"
                >
                  <span className="w-4 h-4 rounded-full bg-diagramaxis-gold/15 text-diagramaxis-gold font-bold text-[9.5px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium">{cId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
