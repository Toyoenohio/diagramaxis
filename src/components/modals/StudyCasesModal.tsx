import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { STUDY_CASES } from '../../data/studyCases';
import { X, ArrowRight, MapPin, Calendar, User } from 'lucide-react';

export const StudyCasesModal: React.FC = () => {
  const { isStudyCasesModalOpen, setModalOpen, loadStudyCase } = useProjectStore();

  if (!isStudyCasesModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-diagramaxis-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-diagramaxis-surface border border-diagramaxis-border w-full max-w-[680px] max-h-[85vh] p-7 flex flex-col gap-4 select-none overflow-hidden text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-3 border-b border-diagramaxis-border">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-wider text-diagramaxis-gold font-semibold">
              Pedagogía & Deconstrucción
            </span>
            <h2 className="font-serif font-bold text-[24px] text-diagramaxis-text mt-0.5">
              Casos de Estudio Arquitectónicos
            </h2>
            <p className="font-sans text-[13px] text-diagramaxis-textMuted mt-1">
              Explora y deconstruye obras maestras universales analizadas bajo la metodología del Sistema Proyectual ARPV.
            </p>
          </div>
          <button
            onClick={() => setModalOpen('studyCases', false)}
            className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Casos */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 pr-1.5 custom-scrollbar">
          {STUDY_CASES.map((sc) => (
            <div
              key={sc.id}
              className="p-4 bg-diagramaxis-bg border border-diagramaxis-border hover:border-diagramaxis-gold flex flex-col gap-2.5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif italic font-bold text-[18px] text-diagramaxis-text">
                    {sc.title}
                  </h3>
                  <div className="flex items-center gap-4 font-sans text-[12px] text-diagramaxis-textMuted mt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-diagramaxis-gold" />
                      {sc.architect}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-diagramaxis-textDim" />
                      {sc.year}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-diagramaxis-gold" />
                      {sc.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => loadStudyCase(sc.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-diagramaxis-bg font-sans text-[12px] font-semibold uppercase tracking-wider shrink-0 transition-colors"
                >
                  <span>Cargar Caso</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="font-sans text-[13px] text-diagramaxis-textSecondary leading-relaxed">
                {sc.description}
              </p>

              {/* Badges de Conceptos y Artefactos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-diagramaxis-border">
                <span className="font-sans text-[11px] text-diagramaxis-textDim uppercase mr-1">
                  Estructura Conceptual:
                </span>
                {sc.conceptos.map((c) => (
                  <span
                    key={c}
                    className="font-sans text-[11px] px-2 py-0.5 bg-diagramaxis-surface2 text-diagramaxis-textSecondary border border-diagramaxis-border"
                  >
                    {c}
                  </span>
                ))}
                {sc.artefactos.map((a) => (
                  <span
                    key={a}
                    className="font-sans text-[11px] px-2 py-0.5 bg-diagramaxis-surface2 text-diagramaxis-textSecondary border border-diagramaxis-border"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
