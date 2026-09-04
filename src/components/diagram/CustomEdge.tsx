import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { useProjectStore } from '../../store/useProjectStore';
import { X } from 'lucide-react';

export const CustomEdge: React.FC<EdgeProps> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { removeRelation } = useProjectStore();

  const edgeData = data as {
    relationType?: string;
    direction?: string;
    intensity?: number;
  };

  const relationType = edgeData?.relationType || 'vínculo';
  const intensity = edgeData?.intensity ?? 0.7;
  const strokeWidth = 1.8 + intensity * 2.5;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeRelation(id);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected
            ? 'rgb(var(--da-text))'
            : relationType === 'contradice'
            ? 'rgb(var(--da-orange))'
            : 'rgb(var(--da-gold))',
          strokeWidth,
          strokeDasharray: relationType === 'contradice' ? '6 4' : undefined,
          opacity: 0.6 + intensity * 0.4,
          filter: selected
            ? 'drop-shadow(0 0 6px rgb(var(--da-gold)))'
            : 'drop-shadow(0 0 3px rgb(var(--da-gold)/0.4))',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`nodrag nopan flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9.5px] font-mono border shadow-lg transition-all ${
            selected
              ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold border-diagramaxis-gold scale-105'
              : 'bg-diagramaxis-surface text-diagramaxis-gold border-diagramaxis-gold/40 hover:border-diagramaxis-gold'
          }`}
        >
          <span className="font-semibold">{relationType}</span>
          <button
            onClick={handleRemove}
            title="Cortar hilo de conexión"
            className="hover:text-diagramaxis-danger text-diagramaxis-textMuted transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
