import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ShieldCheck, Lightbulb } from 'lucide-react';

export const CoherenceMeter: React.FC = () => {
  const { getCoherenceReport } = useProjectStore();
  const report = getCoherenceReport();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#22c55e] border-[#22c55e] bg-[#22c55e]/20';
    if (score >= 60) return 'text-[#06b6d4] border-[#06b6d4] bg-[#06b6d4]/20';
    if (score >= 40) return 'text-[#f59e0b] border-[#f59e0b] bg-[#f59e0b]/20';
    return 'text-[#ef4444] border-[#ef4444] bg-[#ef4444]/20';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.4)]';
    if (score >= 60) return 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.4)]';
    if (score >= 40) return 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    return 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]';
  };

  return (
    <div className="flex flex-col gap-3.5 text-[#f8fafc]">
      {/* Título de Evaluación */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#24354d]">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#06b6d4] font-semibold">
          Evaluador de Coherencia Proyectual
        </span>
        <span className="font-mono text-[10px] text-[#64748b]">Sistema ARPV</span>
      </div>

      {/* Indicador Principal */}
      <div className="p-3.5 bg-[#162234] border border-[#24354d] rounded-sm flex items-center justify-between gap-3 shadow-md">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#94a3b8]">
            Índice de Coherencia Tripartita
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif italic font-bold text-[34px] text-[#f8fafc] leading-none">
              {report.score}%
            </span>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded-xs border uppercase font-bold ${getScoreColor(
                report.score
              )}`}
            >
              Nivel {report.level}
            </span>
          </div>
        </div>

        <div className="w-14 h-14 rounded-full border-2 border-[#24354d] flex items-center justify-center bg-[#0f1724]">
          <ShieldCheck
            className={`w-7 h-7 ${
              report.score >= 70 ? 'text-[#22c55e]' : report.score >= 40 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
            }`}
          />
        </div>
      </div>

      {/* Barras de Desglose Triádico */}
      <div className="flex flex-col gap-3 p-3 bg-[#162234] border border-[#24354d] rounded-sm">
        {/* Cobertura Discursiva */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px] text-[#cbd5e1]">
            <span>1. Fundamentación Discursiva (Lingüístico)</span>
            <span className="font-bold text-[#f8fafc]">{report.discourseCoverage}%</span>
          </div>
          <div className="w-full h-2 bg-[#090d14] rounded-full overflow-hidden border border-[#24354d]">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(report.discourseCoverage)}`}
              style={{ width: `${report.discourseCoverage}%` }}
            />
          </div>
        </div>

        {/* Conectividad Espacial */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px] text-[#cbd5e1]">
            <span>2. Conectividad y Grafo (Gráfico)</span>
            <span className="font-bold text-[#f8fafc]">{report.spatialExpressiveness}%</span>
          </div>
          <div className="w-full h-2 bg-[#090d14] rounded-full overflow-hidden border border-[#24354d]">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(report.spatialExpressiveness)}`}
              style={{ width: `${report.spatialExpressiveness}%` }}
            />
          </div>
        </div>

        {/* Total Conceptos Activos vs Relaciones */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#24354d] font-mono text-center">
          <div className="p-2 bg-[#0f1724] border border-[#24354d] rounded-xs">
            <span className="text-[8.5px] text-[#64748b] block uppercase">Nodos</span>
            <span className="text-[13px] font-bold text-[#f8fafc]">
              {report.activeConceptsCount + report.activeArtifactsCount}
            </span>
          </div>
          <div className="p-2 bg-[#0f1724] border border-[#24354d] rounded-xs">
            <span className="text-[8.5px] text-[#64748b] block uppercase">Relaciones</span>
            <span className="text-[13px] font-bold text-[#06b6d4]">{report.relationsCount}</span>
          </div>
          <div className="p-2 bg-[#0f1724] border border-[#24354d] rounded-xs">
            <span className="text-[8.5px] text-[#64748b] block uppercase">Huérfanos</span>
            <span
              className={`text-[13px] font-bold ${
                report.orphanedNodes.length > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'
              }`}
            >
              {report.orphanedNodes.length}
            </span>
          </div>
        </div>
      </div>

      {/* Sugerencias Pedagógicas Docentes */}
      <div className="flex flex-col gap-2 p-3 bg-[#162234] border border-[#24354d] rounded-sm">
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#f59e0b] font-semibold">
          <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
          <span>Diagnóstico & Sugerencias Pedagógicas</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {report.suggestions.map((sug, idx) => (
            <li key={idx} className="font-mono text-[11px] text-[#cbd5e1] flex items-start gap-1.5 leading-relaxed">
              <span className="text-[#22c55e] font-bold">•</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
