import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

export const DiscourseEditor: React.FC = () => {
  const {
    discourse,
    setDiscourse,
    syncDiscourseToDiagram,
    detectedConcepts,
    detectedArtifacts,
    activeConcepts,
    activeArtifacts,
    relations,
    isGeneratingDiscourse,
    setIsGeneratingDiscourse,
    aiSettings,
    showToast,
    toggleConcept,
    toggleArtifact,
  } = useProjectStore();

  const handleGenerateAI = async () => {
    if (activeConcepts.length === 0 && activeArtifacts.length === 0) {
      showToast('Activa conceptos o artefactos en el diagrama primero');
      return;
    }

    setIsGeneratingDiscourse(true);
    showToast('Sintetizando discurso arquitectónico...');

    try {
      const response = await fetch('/api/discourse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptos: activeConcepts,
          artefactos: activeArtifacts,
          relaciones: relations.map((r) => `${r.from} ${r.dir} ${r.to} [${r.type}]`),
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      if (data.discourse) {
        setDiscourse(data.discourse);
        showToast('Discurso generado con éxito');
      } else {
        throw new Error('Respuesta inválida');
      }
    } catch (err) {
      console.warn('Fallback a generador heurístico local:', err);
      // Generador Heurístico Local Pedagógico ARPV
      const activeAll = [...activeConcepts, ...activeArtifacts];
      const relsSummary = relations
        .map((r) => `articulando ${r.from} con ${r.to} mediante una relación que ${r.type}`)
        .join(', ');

      const fallbackText = `La propuesta proyectual se estructura a partir de la dialéctica formal de ${activeAll.slice(0, 3).join(', ')}. ${
        activeAll.length > 3 ? `Se incorporan además condiciones de ${activeAll.slice(3).join(' y ')}, ` : ''
      }${relsSummary ? `${relsSummary}. ` : ''}El espacio resultante cualifica la experiencia arquitectónica respondiendo a la escala humana y al diálogo entre la materia, la luz y el recorrido continuo.`;

      setDiscourse(fallbackText);
      showToast('Discurso sintetizado mediante motor local ARPV');
    } finally {
      setIsGeneratingDiscourse(false);
    }
  };

  const wordCount = discourse.trim() ? discourse.trim().split(/\s+/).length : 0;
  const totalDetected = detectedConcepts.length + detectedArtifacts.length;

  return (
    <div className="flex flex-col gap-3.5 text-[#f8fafc]">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#24354d]">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#06b6d4] font-semibold">
          Discurso Proyectual (Lingüístico)
        </span>
        <span className="font-mono text-[10.5px] text-[#94a3b8]">
          {wordCount} palabras · {totalDetected} detectados
        </span>
      </div>

      <textarea
        value={discourse}
        onChange={(e) => setDiscourse(e.target.value)}
        placeholder="Escribe aquí el discurso narrativo de tu propuesta arquitectónica... El sistema analiza en tiempo real los conceptos y artefactos de la metodología ARPV."
        rows={6}
        className="w-full p-3 bg-[#162234] border border-[#24354d] focus:border-[#22c55e] rounded-sm font-serif italic text-[15px] text-[#f8fafc] leading-relaxed resize-none outline-none transition-colors placeholder:text-[#64748b]"
      />

      {/* Botones de Acción */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={syncDiscourseToDiagram}
          disabled={!discourse.trim()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10.5px] uppercase tracking-wider bg-[#162234] hover:bg-[#1e2f46] text-[#38bdf8] border border-[#06b6d4]/40 disabled:opacity-30 rounded-sm transition-all"
        >
          <ArrowRight className="w-3.5 h-3.5 text-[#06b6d4]" />
          <span>Discurso → Grafo</span>
        </button>

        <button
          onClick={handleGenerateAI}
          disabled={isGeneratingDiscourse || (activeConcepts.length === 0 && activeArtifacts.length === 0)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10.5px] uppercase tracking-wider bg-[#22c55e] hover:bg-[#16a34a] text-[#090d14] font-bold disabled:opacity-30 rounded-sm transition-all shadow-[0_0_8px_rgba(34,197,94,0.3)]"
        >
          {isGeneratingDiscourse ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Grafo → Discurso</span>
        </button>
      </div>

      {/* Conceptos Detectados */}
      {totalDetected > 0 && (
        <div className="flex flex-col gap-2 pt-2.5 border-t border-[#24354d]">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#94a3b8] font-semibold">
            Términos Identificados en el Texto:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {detectedConcepts.map((c) => {
              const isActive = activeConcepts.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleConcept(c)}
                  className={`font-mono text-[10.5px] px-2.5 py-1 rounded-sm border transition-all ${
                    isActive
                      ? 'border-[#22c55e] bg-[#22c55e]/20 text-[#22c55e] font-semibold shadow-[0_0_6px_rgba(34,197,94,0.2)]'
                      : 'border-[#24354d] bg-[#162234] text-[#94a3b8] hover:border-[#22c55e] hover:text-[#f8fafc]'
                  }`}
                  title={isActive ? 'Activo en diagrama (clic para retirar)' : 'Inactivo (clic para activar en diagrama)'}
                >
                  {c} {isActive ? '✓' : '+'}
                </button>
              );
            })}
            {detectedArtifacts.map((a) => {
              const isActive = activeArtifacts.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleArtifact(a)}
                  className={`font-mono text-[10.5px] px-2.5 py-1 rounded-sm border transition-all ${
                    isActive
                      ? 'border-[#06b6d4] bg-[#06b6d4]/20 text-[#38bdf8] font-semibold shadow-[0_0_6px_rgba(6,182,212,0.2)]'
                      : 'border-[#24354d] bg-[#162234] text-[#94a3b8] hover:border-[#06b6d4] hover:text-[#f8fafc]'
                  }`}
                  title={isActive ? 'Activo en diagrama (clic para retirar)' : 'Inactivo (clic para activar en diagrama)'}
                >
                  {a} {isActive ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
