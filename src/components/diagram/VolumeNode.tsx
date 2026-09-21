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
      className={`relative min-w-[210px] max-w-[250px] rounded-sm transition-all shadow-2xl select-none cursor-pointer ${
        isSelected
          ? 'ring-2 ring-diagramaxis-gold shadow-[0_0_22px_rgb(var(--da-gold)/0.45)]'
          : 'shadow-lg hover:border-diagramaxis-gold/80'
      }`}
      style={{
        background: 'linear-gradient(135deg, #18191d 0%, #0d0e11 100%)',
        border: isSelected
          ? '1.5px solid rgb(var(--da-gold))'
          : '1px solid rgba(229, 169, 59, 0.45)',
      }}
    >
      {/* 4 Pines de Conexión del Volumen Base */}
      {/* 1. Pin Superior: Entrada Jerárquica / Causa */}
      <Handle
        type="target"
        position={Position.Top}
        id="port-top"
        title="Pin Superior (Dorado): Entrada Jerárquica. Recibe conceptos rectores de orden superior que moldean el volumen."
        className="!w-4 !h-4 !bg-diagramaxis-gold !border-2 !border-diagramaxis-bg !shadow-[0_0_10px_rgb(var(--da-gold)/0.9)] cursor-crosshair hover:scale-125 transition-transform"
      />

      {/* 2. Pin Inferior: Salida Generativa / Efecto */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="port-bottom"
        title="Pin Inferior (Naranja): Salida Generativa. Conecta transformaciones directas (e.g. Volumen Base → Horizontalidad → Desfragmentación)."
        className="!w-4 !h-4 !bg-diagramaxis-orange !border-2 !border-diagramaxis-bg !shadow-[0_0_10px_rgb(var(--da-orange)/0.9)] cursor-crosshair hover:scale-125 transition-transform"
      />

      {/* 3. Pin Izquierdo: Entrada Condicionante / Contexto */}
      <Handle
        type="target"
        position={Position.Left}
        id="port-left"
        title="Pin Izquierdo (Cyan): Entrada Condicionante. Recibe factores ambientales o topográficos que deforman el volumen."
        className="!w-4 !h-4 !bg-diagramaxis-cyan !border-2 !border-diagramaxis-bg !shadow-[0_0_10px_rgb(var(--da-cyan)/0.9)] cursor-crosshair hover:scale-125 transition-transform"
      />

      {/* 4. Pin Derecho: Salida Articuladora / Vínculo */}
      <Handle
        type="source"
        position={Position.Right}
        id="port-right"
        title="Pin Derecho (Verde): Salida Articuladora. Conecta con otros volúmenes o artefactos del tablero."
        className="!w-4 !h-4 !bg-diagramaxis-success !border-2 !border-diagramaxis-bg !shadow-[0_0_10px_rgb(var(--da-success)/0.9)] cursor-crosshair hover:scale-125 transition-transform"
      />

      {/* Cabecera del Volumen Base */}
      <div className="px-3 py-2 border-b border-diagramaxis-gold/30 bg-diagramaxis-gold/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Box className="w-3.5 h-3.5 text-diagramaxis-gold shrink-0" />
          <span className="font-mono font-bold text-[11px] text-diagramaxis-gold uppercase tracking-wider truncate">
            {obj?.name || nodeData.name || 'Volumen Base'}
          </span>
        </div>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-xs bg-diagramaxis-gold/20 text-diagramaxis-gold border border-diagramaxis-gold/40 font-bold uppercase">
          Sólido 3D
        </span>
      </div>

      {/* Cuerpo de Dimensiones y Parámetros */}
      <div className="p-3 flex flex-col gap-2 font-mono">
        <div className="grid grid-cols-3 gap-1.5 text-center bg-diagramaxis-surface2/60 p-2 rounded-xs border border-diagramaxis-border">
          <div>
            <div className="text-[9px] text-diagramaxis-textDim uppercase">Ancho (X)</div>
            <div className="text-[12px] font-bold text-diagramaxis-text">{dims.w}m</div>
          </div>
          <div>
            <div className="text-[9px] text-diagramaxis-textDim uppercase">Alto (Y)</div>
            <div className="text-[12px] font-bold text-diagramaxis-gold">{dims.h}m</div>
          </div>
          <div>
            <div className="text-[9px] text-diagramaxis-textDim uppercase">Prof (Z)</div>
            <div className="text-[12px] font-bold text-diagramaxis-text">{dims.d}m</div>
          </div>
        </div>

        {/* Resumen de conceptos vinculados */}
        <div className="flex items-center justify-between text-[10px] pt-1 text-diagramaxis-textMuted border-t border-diagramaxis-border/60">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-diagramaxis-gold" />
            <span>Fichas asignadas:</span>
          </div>
          <span className="font-bold text-diagramaxis-gold">
            {assignedCount} {assignedCount === 1 ? 'operación' : 'operaciones'}
          </span>
        </div>

        <div className="text-[9px] text-diagramaxis-textDim italic leading-tight pt-0.5">
          Conecta los pines a las fichas temáticas para gobernar morfológicamente este sólido.
        </div>
      </div>
    </div>
  );
});
