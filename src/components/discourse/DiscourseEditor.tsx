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
    <div className="flex flex-col gap-3.5 text-diagramaxis-text">
      <div className="flex items-center justify-between pb-1.5 border-b border-diagramaxis-evalBorder">
        <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-cyan font-semibold">
          Discurso Proyectual (Lingüístico)
        </span>
        <span className="font-mono text-[10.5px] text-diagramaxis-textMuted">
          {wordCount} palabras · {totalDetected} detectados
        </span>
      </div>

      <textarea
        value={discourse}
        onChange={(e) => setDiscourse(e.target.value)}
        placeholder="Escribe aquí el discurso narrativo de tu propuesta arquitectónica... El sistema analiza en tiempo real los conceptos y artefactos de la metodología ARPV."
        rows={6}
        className="w-full p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-sm font-serif italic text-[15px] text-diagramaxis-text leading-relaxed resize-none outline-none transition-colors placeholder:text-diagramaxis-textDim"
      />

      {/* Botones de Acción */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={syncDiscourseToDiagram}
          disabled={!discourse.trim()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10.5px] uppercase tracking-wider bg-diagramaxis-evalBg hover:bg-diagramaxis-evalHover text-diagramaxis-cyanBright border border-diagramaxis-cyan/40 disabled:opacity-30 rounded-sm transition-all"
        >
          <ArrowRight className="w-3.5 h-3.5 text-diagramaxis-cyan" />
          <span>Discurso → Grafo</span>
        </button>

        <button
          onClick={handleGenerateAI}
          disabled={isGeneratingDiscourse || (activeConcepts.length === 0 && activeArtifacts.length === 0)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10.5px] uppercase tracking-wider bg-diagramaxis-success hover:bg-diagramaxis-successHover text-diagramaxis-successInk font-bold disabled:opacity-30 rounded-sm transition-all shadow-[0_0_8px_rgb(var(--da-success)/0.3)]"
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
        <div className="flex flex-col gap-2 pt-2.5 border-t border-diagramaxis-evalBorder">
          <span className="font-mono text-[9px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
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
                      ? 'border-diagramaxis-success bg-diagramaxis-success/20 text-diagramaxis-success font-semibold shadow-[0_0_6px_rgb(var(--da-success)/0.2)]'
                      : 'border-diagramaxis-evalBorder bg-diagramaxis-evalBg text-diagramaxis-textMuted hover:border-diagramaxis-success hover:text-diagramaxis-text'
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
                      ? 'border-diagramaxis-cyan bg-diagramaxis-cyan/20 text-diagramaxis-cyanBright font-semibold shadow-[0_0_6px_rgb(var(--da-cyan)/0.2)]'
                      : 'border-diagramaxis-evalBorder bg-diagramaxis-evalBg text-diagramaxis-textMuted hover:border-diagramaxis-cyan hover:text-diagramaxis-text'
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
