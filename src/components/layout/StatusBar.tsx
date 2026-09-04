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
    <footer className="fixed bottom-0 left-0 right-0 h-[38px] bg-[#17181d] border-t border-[#2e323c] z-30 flex items-center px-4 justify-between font-mono text-[12px] select-none text-[#94a3b8]">
      {/* Indicadores Izquierdos */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[#64748b] uppercase text-[10px] font-bold">Fichas Activas:</span>
          <strong className="text-[#e5a93b] text-[13px]">{activeConcepts.length}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#64748b] uppercase text-[10px] font-bold">Artefactos:</span>
          <strong className="text-[#06b6d4] text-[13px]">{activeArtifacts.length}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#64748b] uppercase text-[10px] font-bold">Hilos:</span>
          <strong className="text-[#ea580c] text-[13px]">{relations.length}</strong>
        </div>

        {location && (
          <div className="hidden sm:flex items-center gap-1.5 text-[#cbd5e1] text-[11.5px]">
            <MapPin className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Toast Notificación Central */}
      {toastMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#e5a93b] text-[#0f1013] font-bold px-4 py-1 rounded-sm font-mono text-[12px] shadow-[0_0_16px_rgba(229,169,59,0.5)] animate-fade-in flex items-center gap-1.5">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Indicadores Derechos */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck
            className={`w-4 h-4 ${
              coherence.score >= 70 ? 'text-[#e5a93b]' : coherence.score >= 40 ? 'text-[#ea580c]' : 'text-[#ef4444]'
            }`}
          />
          <span className="text-[#64748b] uppercase text-[10px] font-bold">Coherencia:</span>
          <strong className="text-[#f8fafc] text-[13px]">{coherence.score}%</strong>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[#cbd5e1] text-[11.5px]">
          <Box className="w-3.5 h-3.5 text-[#e5a93b]" />
          <span>
            {baseDimensions.w} × {baseDimensions.d} × {baseDimensions.h} m
          </span>
        </div>
      </div>
    </footer>
  );
};
