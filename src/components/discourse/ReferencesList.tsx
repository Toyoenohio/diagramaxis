import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { ArchitecturalReference } from '../../types';

export const ReferencesList: React.FC = () => {
  const {
    references,
    setReferences,
    activeConcepts,
    activeArtifacts,
    discourse,
    isGeneratingReferences,
    setIsGeneratingReferences,
    aiSettings,
    showToast,
  } = useProjectStore();

  const handleGenerateReferences = async () => {
    const allItems = [...activeConcepts, ...activeArtifacts];
    if (allItems.length === 0) {
      showToast('Activa conceptos en el diagrama para buscar referentes');
      return;
    }

    setIsGeneratingReferences(true);
    showToast('Consultando precedentes arquitectónicos...');

    try {
      const response = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptos: allItems,
          discurso: discourse.slice(0, 300),
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.references)) {
        setReferences(data.references);
        showToast('Referencias arquitectónicas cargadas');
      } else {
        throw new Error('Formato inválido');
      }
    } catch (err) {
      console.warn('Fallback a base de datos de referencias local:', err);
      // Fallback local pedagógico
      const fallbackRefs: ArchitecturalReference[] = [
        {
          obra: 'Convento de La Tourette',
          arquitecto: 'Le Corbusier',
          año: '1960',
          ubicacion: 'Éveux, Francia',
          explicacion: 'Masa monolítica de hormigón que se implanta en ladera articulando recorridos procesionales, conductos de luz cenital y brise-soleil rítmicos.',
          conceptosClave: ['Monolítico', 'Elevación', 'Luz', 'Ritmo Regular'],
        },
        {
          obra: 'Casa Farnsworth',
          arquitecto: 'Mies van der Rohe',
          año: '1951',
          ubicacion: 'Plano, Illinois, EE. UU.',
          explicacion: 'Elevación de dos planos horizontales de acero blanco flotando sobre la pradera con cerramiento de vidrio continuo y disolución de límites.',
          conceptosClave: ['Elevación', 'Horizontalidad', 'Plano', 'Abierto'],
        },
        {
          obra: 'Museo Guggenheim Bilbao',
          arquitecto: 'Frank Gehry',
          año: '1997',
          ubicacion: 'Bilbao, España',
          explicacion: 'Composición desfragmentada no euclidiana con titanio y piedra caliza que genera un hito urbano colosal y dinámico en la ría.',
          conceptosClave: ['Irregular', 'Desfragmentación', 'Colosal', 'Hito'],
        },
      ];
      setReferences(fallbackRefs);
      showToast('Referencias cargadas desde el archivo histórico');
    } finally {
      setIsGeneratingReferences(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 pt-3.5 border-t border-diagramaxis-evalBorder text-diagramaxis-text">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-cyan font-semibold">
          Precedentes & Referentes
        </span>
        <button
          onClick={handleGenerateReferences}
          disabled={isGeneratingReferences || (activeConcepts.length === 0 && activeArtifacts.length === 0)}
          className="flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wider text-diagramaxis-cyanBright hover:underline disabled:opacity-30"
        >
          {isGeneratingReferences ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-diagramaxis-success" />
          )}
          <span>{references.length ? 'Actualizar' : 'Buscar Referentes'}</span>
        </button>
      </div>

      {references.length === 0 ? (
        <div className="p-4 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-sm text-center">
          <BookOpen className="w-6 h-6 text-diagramaxis-textDim mx-auto mb-2 opacity-70" />
          <p className="font-mono text-[11px] text-diagramaxis-textMuted leading-relaxed">
            Presiona &quot;Buscar Referentes&quot; para encontrar obras maestras de la historia de la arquitectura que compartan tus conceptos activos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {references.map((ref, idx) => (
            <div
              key={idx}
              className="p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-sm flex flex-col gap-1.5 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif italic font-bold text-[15px] text-diagramaxis-text">
                    {ref.obra}
                  </h4>
                  <span className="font-mono text-[10.5px] text-diagramaxis-cyanBright">
                    {ref.arquitecto} · {ref.año} {ref.ubicacion ? `(${ref.ubicacion})` : ''}
                  </span>
                </div>
              </div>

              <p className="font-mono text-[11px] text-diagramaxis-textBright leading-relaxed">
                {ref.explicacion}
              </p>

              {ref.conceptosClave && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {ref.conceptosClave.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[9.5px] px-2 py-0.5 bg-diagramaxis-evalDeep text-diagramaxis-success border border-diagramaxis-success/30 rounded-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
