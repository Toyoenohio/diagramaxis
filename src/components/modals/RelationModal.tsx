import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { RELATIONS_CATALOG } from '../../data/architecturalMenu';
import { X } from 'lucide-react';

export const RelationModal: React.FC = () => {
  const {
    isRelationModalOpen,
    activeConcepts,
    activeArtifacts,
    addRelation,
    setModalOpen,
  } = useProjectStore();

  const allItems = useMemo(() => [...activeConcepts, ...activeArtifacts], [activeConcepts, activeArtifacts]);

  // B4 auditoría: el modal está montado desde el arranque (cuando aún no hay
  // fichas activas), así que el estado debe re-sembrarse CADA VEZ que se abre.
  const [fromNode, setFromNode] = useState<string>('');
  const [toNode, setToNode] = useState<string>('');
  const [relType, setRelType] = useState<string>('define');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [direction, setDirection] = useState<'A→B' | 'B→A' | 'A↔B'>('A→B');
  const [intensity, setIntensity] = useState<number>(0.8);

  const prevOpenRef = useRef(isRelationModalOpen);
  useEffect(() => {
    if (isRelationModalOpen && !prevOpenRef.current) {
      // Re-sembrar al abrir con las fichas activas ACTUALES y preseleccionar
      // origen/destino DISTINTOS (o el nodo seleccionado + otro distinto).
      const st = useProjectStore.getState();
      const items = [...st.activeConcepts, ...st.activeArtifacts];
      const selected = st.selectedNodeId && items.includes(st.selectedNodeId) ? st.selectedNodeId : null;
      const nextFrom = selected || items[0] || '';
      const nextTo = items.find((item) => item !== nextFrom) || '';
      setFromNode(nextFrom);
      setToNode(nextTo);
      setRelType('define');
      setCustomLabel('');
      setDirection('A→B');
      setIntensity(0.8);
    }
    prevOpenRef.current = isRelationModalOpen;
  }, [isRelationModalOpen]);

  if (!isRelationModalOpen || allItems.length < 2) return null;

  const currentRelDef = RELATIONS_CATALOG.find((r) => r.type === relType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromNode === toNode || !fromNode || !toNode) return;

    const finalType = relType === 'personalizada' ? customLabel.trim() || 'vínculo' : relType;

    addRelation({
      from: fromNode,
      to: toNode,
      type: finalType,
      dir: direction,
      intensity,
    });
  };

  return (
    <div className="fixed inset-0 bg-diagramaxis-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder w-full max-w-[460px] rounded-sm shadow-2xl p-6 flex flex-col gap-4 select-none text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-cyan font-semibold">
              Topología Semántica
            </span>
            <h2 className="font-serif font-bold text-[22px] text-diagramaxis-text">
              Nueva Relación Conceptual
            </h2>
          </div>
          <button
            onClick={() => setModalOpen('relation', false)}
            className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Nodos Origen y Destino */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
                Nodo Origen (A)
              </label>
              <select
                value={fromNode}
                onChange={(e) => setFromNode(e.target.value)}
                className="w-full p-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-serif italic text-[14px] text-diagramaxis-text outline-none"
              >
                {allItems.map((item) => (
                  <option key={item} value={item} disabled={item === toNode}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
                Nodo Destino (B)
              </label>
              <select
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
                className="w-full p-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-serif italic text-[14px] text-diagramaxis-text outline-none"
              >
                {allItems.map((item) => (
                  <option key={item} value={item} disabled={item === fromNode}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Relación */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
              Tipo de Vínculo
            </label>
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="w-full p-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-mono text-[12px] text-diagramaxis-text outline-none"
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
              <option value="personalizada">personalizada...</option>
            </select>
          </div>

          {/* Glosa explicativa */}
          {currentRelDef && (
            <div className="p-2.5 bg-diagramaxis-cyan/10 border-l-2 border-diagramaxis-cyan font-mono text-[10px] text-diagramaxis-cyanBright leading-relaxed">
              {currentRelDef.description}
            </div>
          )}

          {relType === 'personalizada' && (
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
                Etiqueta Personalizada
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Ej. modula, enmarca, intercepta..."
                className="w-full p-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-xs font-mono text-[12px] text-diagramaxis-text outline-none"
              />
            </div>
          )}

          {/* Dirección y Vector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
                Dirección
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full p-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-xs font-mono text-[12px] text-diagramaxis-text outline-none"
              >
                <option value="A→B">A → B (Unidireccional)</option>
                <option value="B→A">B → A (Inversa)</option>
                <option value="A↔B">A ↔ B (Recíproca)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[10px] text-diagramaxis-textMuted">
                <span>Intensidad</span>
                <span className="font-bold text-diagramaxis-success">{intensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-diagramaxis-success cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen('relation', false)}
              className="flex-1 py-2.5 bg-diagramaxis-evalBg hover:bg-diagramaxis-evalHover text-diagramaxis-textBright font-mono text-[11px] uppercase tracking-wider rounded-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={fromNode === toNode || !fromNode || !toNode}
              className="flex-1 py-2.5 bg-diagramaxis-success hover:bg-diagramaxis-successHover text-diagramaxis-successInk font-mono text-[11px] font-bold uppercase tracking-wider disabled:opacity-30 rounded-xs transition-colors shadow-[0_0_10px_rgb(var(--da-success)/0.25)]"
            >
              Agregar Vínculo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
