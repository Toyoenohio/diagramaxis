import React, { memo, useState } from 'react';
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

  const [isEditing, setIsEditing] = useState(false);
  const { removeRelation, updateRelation } = useProjectStore();

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    updateRelation(id, { type: e.target.value });
    setIsEditing(false);
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
          className={`nodrag nopan flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9.5px] font-mono border shadow-lg transition-all ${
            selected
              ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold border-diagramaxis-gold scale-105'
              : 'bg-diagramaxis-surface text-diagramaxis-gold border-diagramaxis-gold/40 hover:border-diagramaxis-gold'
          }`}
        >
          {isEditing ? (
            <select
              autoFocus
              value={relationType}
              onChange={handleTypeChange}
              onBlur={() => setIsEditing(false)}
              className="bg-diagramaxis-bg text-diagramaxis-gold border border-diagramaxis-gold rounded-xs px-1 py-0.5 text-[9.5px] font-mono outline-none"
            >
              <optgroup label="Compositivas">
                <option value="define">define</option>
                <option value="amplifica">amplifica</option>
                <option value="restringe">restringe</option>
                <option value="complementa">complementa</option>
                <option value="contradice">contradice</option>
                <option value="sustituye">sustituye</option>
              </optgroup>
              <optgroup label="Jerárquicas">
                <option value="origina">origina</option>
                <option value="precede">precede</option>
                <option value="subordina">subordina</option>
                <option value="jerarquiza">jerarquiza</option>
              </optgroup>
              <optgroup label="Espaciales">
                <option value="contiene">contiene</option>
                <option value="transita">transita</option>
                <option value="tensiona">tensiona</option>
                <option value="articula">articula</option>
                <option value="separa">separa</option>
              </optgroup>
            </select>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Click para cambiar tipo de relación"
              className="font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{relationType}</span>
              <span className="text-[8px] opacity-70">▾</span>
            </button>
          )}

          <button
            onClick={handleRemove}
            title="Cortar hilo de conexión"
            className="hover:text-diagramaxis-danger text-diagramaxis-textMuted transition-colors ml-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
