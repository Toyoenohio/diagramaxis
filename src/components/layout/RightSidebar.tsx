import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { CONCEPTS_DATA, ARTIFACTS_DATA } from '../../data/architecturalMenu';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { DiscourseEditor } from '../discourse/DiscourseEditor';
import { ReferencesList } from '../discourse/ReferencesList';
import { CoherenceMeter } from '../evaluation/CoherenceMeter';
import { FirmitasSliders, FIRMITAS_LIST } from './FirmitasSliders';
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
    setNodeCustomParam,
    relations,
    updateRelation,
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
    <aside className="w-[340px] min-w-[340px] h-full bg-diagramaxis-surface border-l border-diagramaxis-border flex flex-col z-20 select-none text-diagramaxis-text">
      {/* Pestañas de Navegación Derecha */}
      <div className="flex border-b border-diagramaxis-border bg-diagramaxis-bg overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'params'
              ? 'border-diagramaxis-gold text-diagramaxis-gold font-bold bg-diagramaxis-surface'
              : 'border-transparent text-diagramaxis-textDim hover:text-diagramaxis-textMuted'
          }`}
        >
          Parámetros
        </button>
        <button
          onClick={() => setActiveTab('relations')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'relations'
              ? 'border-diagramaxis-cyan text-diagramaxis-cyan font-bold bg-diagramaxis-surface'
              : 'border-transparent text-diagramaxis-textDim hover:text-diagramaxis-textMuted'
          }`}
        >
          Hilos ({relations.length})
        </button>
        <button
          onClick={() => setActiveTab('discourse')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'discourse'
              ? 'border-diagramaxis-orange text-diagramaxis-orange font-bold bg-diagramaxis-surface'
              : 'border-transparent text-diagramaxis-textDim hover:text-diagramaxis-textMuted'
          }`}
        >
          Discurso
        </button>
        <button
          onClick={() => setActiveTab('coherence')}
          className={`flex-1 min-w-[70px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'coherence'
              ? 'border-diagramaxis-success text-diagramaxis-success font-bold bg-diagramaxis-surface'
              : 'border-transparent text-diagramaxis-textDim hover:text-diagramaxis-textMuted'
          }`}
        >
          Coherencia
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 min-w-[60px] py-3 font-mono text-[11.5px] uppercase tracking-wider text-center border-b-2 transition-all ${
            activeTab === 'active'
              ? 'border-diagramaxis-gold text-diagramaxis-gold font-bold bg-diagramaxis-surface'
              : 'border-transparent text-diagramaxis-textDim hover:text-diagramaxis-textMuted'
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
              <div className="p-6 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm text-center font-mono text-[12px] text-diagramaxis-textMuted leading-relaxed">
                Selecciona fichas en la bandeja izquierda para calibrar sus parámetros y dimensiones volumétricas.
              </div>
            ) : (
              <>
                {/* Selector de Concepto Activo */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
                    Ficha Seleccionada en el Tablero
                  </span>
                  <select
                    value={currentNodeId || ''}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    className="w-full p-2.5 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm font-serif italic text-[15px] text-diagramaxis-text outline-none focus:border-diagramaxis-gold"
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
                  <div className="p-3.5 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm flex flex-col gap-3 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif italic font-bold text-[18px] text-diagramaxis-text">
                          {currentNodeId}
                        </h3>
                        <span className="font-mono text-[10.5px] text-diagramaxis-gold">
                          {currentConcept?.subcategory || currentArtifact?.category || 'General'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (activeArtifacts.includes(currentNodeId)) toggleArtifact(currentNodeId);
                          else toggleConcept(currentNodeId);
                        }}
                        title="Retirar del tablero"
                        className="text-diagramaxis-textMuted hover:text-diagramaxis-danger p-1 font-mono text-[11px]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-mono text-[11.5px] text-diagramaxis-textBright leading-relaxed">
                      {currentConcept?.description || currentArtifact?.description}
                    </p>

                    {/* Badge de Operación Volumétrica */}
                    {currentOp ? (
                      <div className="p-3 bg-diagramaxis-chipBg border border-diagramaxis-gold/40 rounded-xs flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-mono text-[12px] text-diagramaxis-gold font-bold">
                          <Sparkles className="w-4 h-4 text-diagramaxis-gold" />
                          <span>Operación 3D: {currentOp.label}</span>
                        </div>
                        {currentOp.pedagogicalTip && (
                          <span className="font-mono text-[10.5px] text-diagramaxis-textMuted leading-normal">
                            {currentOp.pedagogicalTip}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-diagramaxis-bg border border-diagramaxis-border rounded-xs font-mono text-[10.5px] text-diagramaxis-textDim">
                        Sin transformación geométrica directa (modula relaciones de orden).
                      </div>
                    )}

                    {/* Sliders de Peso e Intensidad */}
                    <div className="flex flex-col gap-3.5 pt-3 border-t border-diagramaxis-border">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-mono text-[11.5px]">
                          <span className="text-diagramaxis-textMuted">Peso Jerárquico:</span>
                          <span className="font-bold text-diagramaxis-gold">
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
                          className="w-full h-2 accent-diagramaxis-gold cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-mono text-[11.5px]">
                          <span className="text-diagramaxis-textMuted">Intensidad Formal:</span>
                          <span className="font-bold text-diagramaxis-cyan">
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
                          className="w-full h-2 accent-diagramaxis-cyan cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Modificadores Operacionales Configurables */}
                    {currentOp && (
                      <div className="flex flex-col gap-3 pt-3 border-t border-diagramaxis-border">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
                          Modificadores Volumétricos 3D
                        </span>

                        {FIRMITAS_LIST.includes(currentNodeId as any) ? (
                          <FirmitasSliders
                            conceptId={currentNodeId}
                            custom={currentParam.custom || {}}
                            onChange={(key, val) => setNodeCustomParam(currentNodeId, key, val)}
                          />
                        ) : (
                          <>
                            {/* Vacíos / Perforaciones / Vanos / Túneles / Carve */}
                            {(currentOp.op === 'perforate' || currentOp.op === 'carve' || currentOp.op === 'open') && (
                          <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
                            <div className="flex flex-col gap-1">
                              <label className="font-mono text-[10px] text-diagramaxis-textMuted uppercase">
                                Eje de Horadado / Vacío:
                              </label>
                              <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                                {(['X', 'Y', 'Z'] as const).map((ax) => (
                                  <button
                                    key={ax}
                                    type="button"
                                    onClick={() => setNodeCustomParam(currentNodeId, 'voidAxis', ax)}
                                    className={`py-1 rounded-xs border transition-colors ${
                                      (currentParam.custom?.voidAxis || currentOp.dir || 'Z') === ax
                                        ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold border-diagramaxis-gold'
                                        : 'bg-diagramaxis-surface border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text'
                                    }`}
                                  >
                                    Eje {ax}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Ancho del Vacío:</span>
                                <span className="font-bold text-diagramaxis-gold">
                                  {Math.round(((currentParam.custom?.voidW as number) ?? (currentOp.size || 0.35)) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="0.85"
                                step="0.05"
                                value={(currentParam.custom?.voidW as number) ?? (currentOp.size || 0.35)}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'voidW', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Alto del Vacío:</span>
                                <span className="font-bold text-diagramaxis-gold">
                                  {Math.round(((currentParam.custom?.voidH as number) ?? (currentOp.size || 0.35)) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="0.85"
                                step="0.05"
                                value={(currentParam.custom?.voidH as number) ?? (currentOp.size || 0.35)}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'voidH', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Desfase Horizontal (X):</span>
                                <span className="font-bold text-diagramaxis-cyan">
                                  {(((currentParam.custom?.voidX as number) ?? 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-0.35"
                                max="0.35"
                                step="0.05"
                                value={(currentParam.custom?.voidX as number) ?? 0}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'voidX', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Desfase Vertical (Y):</span>
                                <span className="font-bold text-diagramaxis-cyan">
                                  {(((currentParam.custom?.voidY as number) ?? 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-0.35"
                                max="0.35"
                                step="0.05"
                                value={(currentParam.custom?.voidY as number) ?? 0}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'voidY', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        {/* Desfragmentación / Fractura */}
                        {(currentOp.op === 'fracture' || currentNodeId === 'Desfragmentación') && (
                          <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
                            <div className="flex flex-col gap-1">
                              <label className="font-mono text-[10px] text-diagramaxis-textMuted uppercase">
                                Cantidad de Bloques / Fragmentos:
                              </label>
                              <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
                                {[2, 3, 4, 5].map((cnt) => (
                                  <button
                                    key={cnt}
                                    type="button"
                                    onClick={() => setNodeCustomParam(currentNodeId, 'fragments', cnt)}
                                    className={`py-1 rounded-xs border transition-colors ${
                                      ((currentParam.custom?.fragments as number) || 2) === cnt
                                        ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold border-diagramaxis-gold'
                                        : 'bg-diagramaxis-surface border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text'
                                    }`}
                                  >
                                    {cnt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Distancia de Fisura (Gap):</span>
                                <span className="font-bold text-diagramaxis-gold">
                                  {(((currentParam.custom?.gap as number) ?? 0.15) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.05"
                                max="0.35"
                                step="0.02"
                                value={(currentParam.custom?.gap as number) ?? 0.15}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'gap', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Dislocación / Desfase:</span>
                                <span className="font-bold text-diagramaxis-cyan">
                                  {(((currentParam.custom?.dislocation as number) ?? 0.12) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.0"
                                max="0.35"
                                step="0.02"
                                value={(currentParam.custom?.dislocation as number) ?? 0.12}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'dislocation', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        {/* Colosal / Monumentalidad */}
                        {(currentNodeId === 'Colosal' || currentOp.op === 'extend') && (
                          <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
                            <div className="flex justify-between font-mono text-[10.5px]">
                              <span className="text-diagramaxis-textMuted">Escala vs Figura Humana:</span>
                              <span className="font-bold text-diagramaxis-gold">
                                {((currentParam.custom?.colossalScale as number) ?? (currentNodeId === 'Colosal' ? 2.5 : 1.0)).toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1.0"
                              max="4.0"
                              step="0.1"
                              value={(currentParam.custom?.colossalScale as number) ?? (currentNodeId === 'Colosal' ? 2.5 : 1.0)}
                              onChange={(e) => setNodeCustomParam(currentNodeId, 'colossalScale', parseFloat(e.target.value))}
                              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
                            />
                            <span className="font-mono text-[9.5px] text-diagramaxis-textMuted">
                              Compara visualmente con la silueta humana dorada de 1.75m.
                            </span>
                          </div>
                        )}

                        {/* Patio / Atrio */}
                        {(currentOp.op === 'courtyard' || currentOp.op === 'atrium') && (
                          <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Ancho de Patio:</span>
                                <span className="font-bold text-diagramaxis-gold">
                                  {Math.round(((currentParam.custom?.courtW as number) ?? 0.45) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.15"
                                max="0.75"
                                step="0.05"
                                value={(currentParam.custom?.courtW as number) ?? 0.45}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'courtW', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Profundidad de Patio:</span>
                                <span className="font-bold text-diagramaxis-gold">
                                  {Math.round(((currentParam.custom?.courtD as number) ?? 0.45) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.15"
                                max="0.75"
                                step="0.05"
                                value={(currentParam.custom?.courtD as number) ?? 0.45}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'courtD', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between font-mono text-[10.5px]">
                                <span className="text-diagramaxis-textMuted">Desfase X:</span>
                                <span className="font-bold text-diagramaxis-cyan">
                                  {(((currentParam.custom?.courtX as number) ?? 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-0.25"
                                max="0.25"
                                step="0.05"
                                value={(currentParam.custom?.courtX as number) ?? 0}
                                onChange={(e) => setNodeCustomParam(currentNodeId, 'courtX', parseFloat(e.target.value))}
                                className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

                {/* Control del Volumen Base */}
                <div className="p-3.5 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm flex flex-col gap-3.5 shadow-md">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
                    Geometría Base de la Masa (Metros)
                  </span>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-diagramaxis-textMuted">Ancho (X):</span>
                        <span className="font-bold text-diagramaxis-text">{baseDimensions.w}m</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="40"
                        step="1"
                        value={baseDimensions.w}
                        onChange={(e) => setBaseDimensions({ w: parseFloat(e.target.value) })}
                        className="w-full h-2 accent-diagramaxis-gold cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-diagramaxis-textMuted">Profundidad (Z):</span>
                        <span className="font-bold text-diagramaxis-text">{baseDimensions.d}m</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="40"
                        step="1"
                        value={baseDimensions.d}
                        onChange={(e) => setBaseDimensions({ d: parseFloat(e.target.value) })}
                        className="w-full h-2 accent-diagramaxis-gold cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-diagramaxis-textMuted">Altura Inicial (Y):</span>
                        <span className="font-bold text-diagramaxis-text">{baseDimensions.h}m</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="30"
                        step="0.5"
                        value={baseDimensions.h}
                        onChange={(e) => setBaseDimensions({ h: parseFloat(e.target.value) })}
                        className="w-full h-2 accent-diagramaxis-gold cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1 pt-2.5 border-t border-diagramaxis-border">
                      <div className="flex justify-between font-mono text-[11.5px]">
                        <span className="text-diagramaxis-textMuted">Orientación Norte:</span>
                        <span className="font-bold text-diagramaxis-gold">{northRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={northRotation}
                        onChange={(e) => setNorthRotation(parseFloat(e.target.value))}
                        className="w-full h-2 accent-diagramaxis-gold cursor-pointer"
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
              <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
                Hilos de Conexión ({relations.length})
              </span>
              <button
                onClick={() => setModalOpen('relation', true)}
                disabled={allActive.length < 2}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-diagramaxis-gold hover:underline disabled:opacity-30 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Hilo</span>
              </button>
            </div>

            {relations.length === 0 ? (
              <div className="p-6 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm text-center font-mono text-[12px] text-diagramaxis-textMuted leading-relaxed">
                No hay hilos tendidos aún. Usa el botón &quot;+ Nuevo Hilo&quot; o conecta los pines de las fichas directamente en el tablero.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {relations.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-diagramaxis-surface2 border border-diagramaxis-border hover:border-diagramaxis-gold rounded-sm flex flex-col gap-2.5 shadow-xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-serif italic text-[14px] text-diagramaxis-text">
                        <span className="font-bold text-diagramaxis-gold truncate max-w-[95px]">{r.from}</span>
                        <span className="font-mono text-[11px] text-diagramaxis-textDim">{r.dir}</span>
                        <span className="font-bold text-diagramaxis-cyan truncate max-w-[95px]">{r.to}</span>
                      </div>
                      <button
                        onClick={() => removeRelation(r.id)}
                        title="Cortar hilo"
                        className="text-diagramaxis-textDim hover:text-diagramaxis-danger p-1 font-mono text-[11px] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selector de Tipo de Relación en Línea */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[10px] uppercase text-diagramaxis-textMuted">
                        <span>Tipo de Vínculo:</span>
                      </div>
                      <select
                        value={r.type}
                        onChange={(e) => updateRelation(r.id, { type: e.target.value })}
                        className="w-full p-1.5 bg-diagramaxis-bg border border-diagramaxis-border focus:border-diagramaxis-gold rounded-xs font-mono text-[11.5px] text-diagramaxis-text outline-none"
                      >
                        <optgroup label="Compositivas">
                          <option value="define">define</option>
                          <option value="amplifica">amplifica (+fuerza)</option>
                          <option value="restringe">restringe (-fuerza)</option>
                          <option value="complementa">complementa</option>
                          <option value="contradice">contradice (tensión)</option>
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
                    </div>

                    {/* Dirección y Fuerza */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-diagramaxis-border/60">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] uppercase text-diagramaxis-textMuted">Dirección:</span>
                        <div className="flex gap-1 font-mono text-[10px]">
                          {(['A→B', 'B→A', 'A↔B'] as const).map((dir) => (
                            <button
                              key={dir}
                              type="button"
                              onClick={() => updateRelation(r.id, { dir })}
                              className={`flex-1 py-1 rounded-xs border text-center transition-colors ${
                                r.dir === dir
                                  ? 'bg-diagramaxis-gold text-diagramaxis-bg font-bold border-diagramaxis-gold'
                                  : 'bg-diagramaxis-bg border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text'
                              }`}
                            >
                              {dir}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-mono text-[9px] uppercase text-diagramaxis-textMuted">
                          <span>Fuerza:</span>
                          <span className="font-bold text-diagramaxis-cyan">{(r.intensity || 0.7).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={r.intensity || 0.7}
                          onChange={(e) => updateRelation(r.id, { intensity: parseFloat(e.target.value) })}
                          className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer mt-1"
                        />
                      </div>
                    </div>
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
            <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
              Secuencia de Fichas en Juego ({allActive.length})
            </span>

            {allActive.length === 0 ? (
              <div className="p-6 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm text-center font-mono text-[12px] text-diagramaxis-textMuted">
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
                      className="p-3 bg-diagramaxis-surface2 border border-diagramaxis-border hover:border-diagramaxis-gold rounded-xs flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-diagramaxis-textDim w-6 font-bold">{idx + 1}.</span>
                        <span className="font-serif italic text-[15px] text-diagramaxis-text font-semibold">{item}</span>
                        {isArt && (
                          <span className="font-mono text-[9.5px] px-1.5 py-0.2 bg-diagramaxis-cyan/15 text-diagramaxis-cyan rounded-xs">
                            Artefacto
                          </span>
                        )}
                      </div>

                      {op && (
                        <span className="font-mono text-[10px] text-diagramaxis-gold bg-diagramaxis-chipBg border border-diagramaxis-gold/30 px-2 py-0.5 rounded-xs">
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
