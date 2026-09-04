import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { STUDY_CASES } from '../../data/studyCases';
import { X, ArrowRight, MapPin, Calendar, User } from 'lucide-react';

export const StudyCasesModal: React.FC = () => {
  const { isStudyCasesModalOpen, setModalOpen, loadStudyCase } = useProjectStore();

  if (!isStudyCasesModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-diagramaxis-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder w-full max-w-[680px] max-h-[85vh] rounded-sm shadow-2xl p-7 flex flex-col gap-4 select-none overflow-hidden text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-3 border-b border-diagramaxis-evalBorder">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-success font-semibold">
              Pedagogía & Deconstrucción
            </span>
            <h2 className="font-serif font-bold text-[24px] text-diagramaxis-text">
              Casos de Estudio Arquitectónicos
            </h2>
            <p className="font-mono text-[11px] text-diagramaxis-textMuted mt-1">
              Explora y deconstruye obras maestras universales analizadas bajo la metodología del Sistema Proyectual ARPV.
            </p>
          </div>
          <button
            onClick={() => setModalOpen('studyCases', false)}
            className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Casos */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 pr-1.5 custom-scrollbar">
          {STUDY_CASES.map((sc) => (
            <div
              key={sc.id}
              className="p-4 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder hover:border-diagramaxis-success rounded-sm flex flex-col gap-2.5 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif italic font-bold text-[18px] text-diagramaxis-text">
                    {sc.title}
                  </h3>
                  <div className="flex items-center gap-4 font-mono text-[10.5px] text-diagramaxis-textMuted mt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-diagramaxis-cyanBright" />
                      {sc.architect}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-diagramaxis-warn" />
                      {sc.year}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-diagramaxis-success" />
                      {sc.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => loadStudyCase(sc.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-diagramaxis-success hover:bg-diagramaxis-successHover text-diagramaxis-successInk font-mono text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors shrink-0 shadow-[0_0_8px_rgb(var(--da-success)/0.3)]"
                >
                  <span>Cargar Caso</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="font-mono text-[11px] text-diagramaxis-textBright leading-relaxed">
                {sc.description}
              </p>

              {/* Badges de Conceptos y Artefactos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-diagramaxis-evalBorder">
                <span className="font-mono text-[9px] text-diagramaxis-textDim uppercase mr-1">
                  Estructura Conceptual:
                </span>
                {sc.conceptos.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[9.5px] px-2 py-0.5 bg-diagramaxis-evalDeep text-diagramaxis-success border border-diagramaxis-success/30 rounded-xs"
                  >
                    {c}
                  </span>
                ))}
                {sc.artefactos.map((a) => (
                  <span
                    key={a}
                    className="font-mono text-[9.5px] px-2 py-0.5 bg-diagramaxis-evalDeep text-diagramaxis-cyanBright border border-diagramaxis-cyan/30 rounded-xs"
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
