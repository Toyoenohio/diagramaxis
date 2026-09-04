import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ShieldCheck, MapPin, Box } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    activeConcepts,
    activeArtifacts,
    relations,
    location,
    baseDimensions,
    toastMessage,
    getCoherenceReport,
  } = useProjectStore();

  const coherence = getCoherenceReport();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[38px] bg-diagramaxis-surface border-t border-diagramaxis-border z-30 flex items-center px-4 justify-between font-mono text-[12px] select-none text-diagramaxis-textMuted">
      {/* Indicadores Izquierdos */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="text-diagramaxis-textDim uppercase text-[10px] font-bold">Fichas Activas:</span>
          <strong className="text-diagramaxis-gold text-[13px]">{activeConcepts.length}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-diagramaxis-textDim uppercase text-[10px] font-bold">Artefactos:</span>
          <strong className="text-diagramaxis-cyan text-[13px]">{activeArtifacts.length}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-diagramaxis-textDim uppercase text-[10px] font-bold">Hilos:</span>
          <strong className="text-diagramaxis-orange text-[13px]">{relations.length}</strong>
        </div>

        {location && (
          <div className="hidden sm:flex items-center gap-1.5 text-diagramaxis-textBright text-[11.5px]">
            <MapPin className="w-3.5 h-3.5 text-diagramaxis-gold" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Toast Notificación Central */}
      {toastMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 bg-diagramaxis-gold text-diagramaxis-bg font-bold px-4 py-1 rounded-sm font-mono text-[12px] shadow-[0_0_16px_rgb(var(--da-gold)/0.5)] animate-fade-in flex items-center gap-1.5">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Indicadores Derechos */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck
            className={`w-4 h-4 ${
              coherence.score >= 70 ? 'text-diagramaxis-gold' : coherence.score >= 40 ? 'text-diagramaxis-orange' : 'text-diagramaxis-danger'
            }`}
          />
          <span className="text-diagramaxis-textDim uppercase text-[10px] font-bold">Coherencia:</span>
          <strong className="text-diagramaxis-text text-[13px]">{coherence.score}%</strong>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-diagramaxis-textBright text-[11.5px]">
          <Box className="w-3.5 h-3.5 text-diagramaxis-gold" />
          <span>
            {baseDimensions.w} × {baseDimensions.d} × {baseDimensions.h} m
          </span>
        </div>
      </div>
    </footer>
  );
};
