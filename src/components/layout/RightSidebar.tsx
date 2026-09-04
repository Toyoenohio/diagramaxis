import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { CONCEPTS_DATA, ARTIFACTS_DATA } from '../../data/architecturalMenu';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { DiscourseEditor } from '../discourse/DiscourseEditor';
import { ReferencesList } from '../discourse/ReferencesList';
import { CoherenceMeter } from '../evaluation/CoherenceMeter';
import { Sparkles, X, Plus } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'params' | 'relations' | 'discourse' | 'coherence' | 'active'>('params');

  const {
    activeConcepts,
    activeArtifacts,
    selectedNodeId,
    setSelectedNodeId,
    nodeParams,
    setNodeParam,
    relations,
    removeRelation,
    baseDimensions,
    setBaseDimensions,
    northRotation,
    setNorthRotation,
    toggleConcept,
    toggleArtifact,
    setModalOpen,
  } = useProjectStore();

  const allActive = [...activeConcepts, ...activeArtifacts];
  const currentNodeId = selectedNodeId && allActive.includes(selectedNodeId) ? selectedNodeId : allActive[0] || null;

  const currentConcept = currentNodeId ? CONCEPTS_DATA.find((c) => c.id === currentNodeId) : null;
  const currentArtifact = currentNodeId ? ARTIFACTS_DATA.find((a) => a.id === currentNodeId) : null;
  const currentOp = currentNodeId ? getVolumetricOperation(currentNodeId) : null;
  const currentParam = currentNodeId ? nodeParams[currentNodeId] || { weight: 0.6, intensity: 0.5 } : { weight: 0.6, intensity: 0.5 };

  return (
    <aside className="w-[340px] min-w-[340px] h-full bg-[#17181d] border-l border-[#2e323c] flex flex-col z-20 select-none text-[#f8fafc]">
      {/* Pestañas de Navegación Derecha */}
      <div className="flex border-b border-[#2e323c] bg-[#0f1013] overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'params'
              ? 'border-[#e5a93b] text-[#e5a93b] font-bold bg-[#17181d]'
              : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          Parámetros
        </button>
        <button
          onClick={() => setActiveTab('relations')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'relations'
              ? 'border-[#06b6d4] text-[#06b6d4] font-bold bg-[#17181d]'
              : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          Hilos ({relations.length})
        </button>
        <button
          onClick={() => setActiveTab('discourse')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'discourse'
              ? 'border-[#ea580c] text-[#ea580c] font-bold bg-[#17181d]'
              : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          Discurso
        </button>
        <button
          onClick={() => setActiveTab('coherence')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'coherence'
              ? 'border-[#22c55e] text-[#22c55e] font-bold bg-[#17181d]'
              : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          Coherencia
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 min-w-[60px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'active'
              ? 'border-[#e5a93b] text-[#e5a93b] font-bold bg-[#17181d]'
              : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          Fichas ({allActive.length})
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {activeTab === 'params' && (
          <div className="flex flex-col gap-4">
            {allActive.length === 0 ? (
              <div className="p-6 bg-[#1f2128] border border-[#2e323c] rounded-sm text-center font-mono text-[12px] text-[#94a3b8] leading-relaxed">
                Selecciona fichas en la bandeja izquierda para calibrar sus parámetros y dimensiones volumétricas.
              </div>
            ) : (
              <>
                {/* Selector de Concepto Activo */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#e5a93b] font-bold">
                    Ficha Seleccionada en el Tablero
                  </span>
                  <select
                    value={currentNodeId || ''}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    className="w-full p-2.5 bg-[#1f2128] border border-[#2e323c] rounded-sm font-serif italic text-[15px] text-[#f8fafc] outline-none focus:border-[#e5a93b]"
                  >
                    {allActive.map((id) => (
                      <option key={id} value={id}>
                        {id} {activeArtifacts.includes(id) ? '(Artefacto)' : '(Concepto)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ficha del Concepto */}
                {currentNodeId && (
                  <div className="p-3.5 bg-[#1f2128] border border-[#2e323c] rounded-sm flex flex-col gap-3 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif italic font-bold text-[18px] text-[#f8fafc]">
                          {currentNodeId}
                        </h3>
                        <span className="font-mono text-[10.5px] text-[#e5a93b]">
                          {currentConcept?.subcategory || currentArtifact?.category || 'General'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (activeArtifacts.includes(currentNodeId)) toggleArtifact(currentNodeId);
                          else toggleConcept(currentNodeId);
                        }}
                        title="Retirar del tablero"
                        className="text-[#94a3b8] hover:text-[#ef4444] p-1 font-mono text-[11px]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-mono text-[11.5px] text-[#cbd5e1] leading-relaxed">
                      {currentConcept?.description || currentArtifact?.description}
                    </p>

                    {/* Badge de Operación Volumétrica */}
                    {currentOp ? (
                      <div className="p-3 bg-[#24221f] border border-[#e5a93b]/40 rounded-xs flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-mono text-[12px] text-[#e5a93b] font-bold">
                          <Sparkles className="w-4 h-4 text-[#e5a93b]" />
                          <span>Operación 3D: {currentOp.label}</span>
                        </div>
                        {currentOp.pedagogicalTip && (
                          <span className="font-mono text-[10.5px] text-[#94a3b8] leading-normal">
                            {currentOp.pedagogicalTip}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#0f1013] border border-[#2e323c] rounded-xs font-mono text-[10.5px] text-[#64748b]">
                        Sin transformación geométrica directa (modula relaciones de orden).
                      </div>
                    )}

                    {/* Sliders de Peso e Intensidad */}
                    <div className="flex flex-col gap-3.5 pt-3 border-t border-[#2e323c]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-mono text-[11.5px]">
                          <span className="text-[#94a3b8]">Peso Jerárquico:</span>
                          <span className="font-bold text-[#e5a93b]">
                            {(currentParam.weight || 0.6).toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={currentParam.weight || 0.6}
                          onChange={(e) => setNodeParam(currentNodeId, 'weight', parseFloat(e.target.value))}
                          className="w-full h-2 accent-[#e5a93b] cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-mono text-[11.5px]">
                          <span className="text-[#94a3b8]">Intensidad Formal:</span>
                          <span className="font-bold text-[#06b6d4]">
                            {(currentParam.intensity || 0.5).toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={currentParam.intensity || 0.5}
                          onChange={(e) => setNodeParam(currentNodeId, 'intensity', parseFloat(e.target.value))}
                          className="w-full h-2 accent-[#06b6d4] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Control del Volumen Base */}
                <div className="p-3.5 bg-[#1f2128] border border-[#2e323c] rounded-sm flex flex-col gap-3.5 shadow-md">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#e5a93b] font-bold">
                    Geometría Base de la Masa (Metros)
                  </span>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-[#94a3b8]">Ancho (X):</span>
                        <span className="font-bold text-[#f8fafc]">{baseDimensions.w}m</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="40"
                        step="1"
                        value={baseDimensions.w}
                        onChange={(e) => setBaseDimensions({ w: parseFloat(e.target.value) })}
                        className="w-full h-2 accent-[#e5a93b] cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-[#94a3b8]">Profundidad (Z):</span>
                        <span className="font-bold text-[#f8fafc]">{baseDimensions.d}m</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="40"
                        step="1"
                        value={baseDimensions.d}
                        onChange={(e) => setBaseDimensions({ d: parseFloat(e.target.value) })}
                        className="w-full h-2 accent-[#e5a93b] cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-[#94a3b8]">Altura Inicial (Y):</span>
                        <span className="font-bold text-[#f8fafc]">{baseDimensions.h}m</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="30"
                        step="0.5"
                        value={baseDimensions.h}
                        onChange={(e) => setBaseDimensions({ h: parseFloat(e.target.value) })}
                        className="w-full h-2 accent-[#e5a93b] cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1 pt-2.5 border-t border-[#2e323c]">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-[#94a3b8]">Orientación Norte:</span>
                        <span className="font-bold text-[#e5a93b]">{northRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={northRotation}
                        onChange={(e) => setNorthRotation(parseFloat(e.target.value))}
                        className="w-full h-2 accent-[#e5a93b] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'relations' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#e5a93b] font-bold">
                Hilos de Conexión ({relations.length})
              </span>
              <button
                onClick={() => setModalOpen('relation', true)}
                disabled={allActive.length < 2}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#e5a93b] hover:underline disabled:opacity-30 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Hilo</span>
              </button>
            </div>

            {relations.length === 0 ? (
              <div className="p-6 bg-[#1f2128] border border-[#2e323c] rounded-sm text-center font-mono text-[12px] text-[#94a3b8] leading-relaxed">
                No hay hilos tendidos aún. Usa el botón &quot;+ Nuevo Hilo&quot; o conecta los pines de las fichas directamente en el tablero.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {relations.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-[#1f2128] border border-[#2e323c] hover:border-[#e5a93b] rounded-sm flex items-center justify-between gap-2 shadow-xs transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 font-serif italic text-[14px] text-[#f8fafc]">
                        <span className="font-bold text-[#e5a93b] truncate max-w-[95px]">{r.from}</span>
                        <span className="font-mono text-[11px] text-[#64748b]">{r.dir}</span>
                        <span className="font-bold text-[#06b6d4] truncate max-w-[95px]">{r.to}</span>
                      </div>
                      <span className="font-mono text-[10.5px] text-[#94a3b8]">
                        Vínculo: <strong className="text-[#f8fafc]">{r.type}</strong> (Fuerza: {(r.intensity || 0.7).toFixed(1)})
                      </span>
                    </div>

                    <button
                      onClick={() => removeRelation(r.id)}
                      title="Cortar hilo"
                      className="text-[#64748b] hover:text-[#ef4444] p-1.5 font-mono text-[11px]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discourse' && (
          <div className="flex flex-col gap-4">
            <DiscourseEditor />
            <ReferencesList />
          </div>
        )}

        {activeTab === 'coherence' && (
          <div className="flex flex-col gap-3">
            <CoherenceMeter />
          </div>
        )}

        {activeTab === 'active' && (
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#e5a93b] font-bold">
              Secuencia de Fichas en Juego ({allActive.length})
            </span>

            {allActive.length === 0 ? (
              <div className="p-6 bg-[#1f2128] border border-[#2e323c] rounded-sm text-center font-mono text-[12px] text-[#94a3b8]">
                Sin fichas activas en el tablero.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {allActive.map((item, idx) => {
                  const isArt = activeArtifacts.includes(item);
                  const op = getVolumetricOperation(item);
                  return (
                    <div
                      key={item}
                      onClick={() => {
                        setSelectedNodeId(item);
                        setActiveTab('params');
                      }}
                      className="p-3 bg-[#1f2128] border border-[#2e323c] hover:border-[#e5a93b] rounded-xs flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#64748b] w-6 font-bold">{idx + 1}.</span>
                        <span className="font-serif italic text-[15px] text-[#f8fafc] font-semibold">{item}</span>
                        {isArt && (
                          <span className="font-mono text-[9.5px] px-1.5 py-0.2 bg-[#06b6d4]/15 text-[#06b6d4] rounded-xs">
                            Artefacto
                          </span>
                        )}
                      </div>

                      {op && (
                        <span className="font-mono text-[10px] text-[#e5a93b] bg-[#24221f] border border-[#e5a93b]/30 px-2 py-0.5 rounded-xs">
                          {op.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
