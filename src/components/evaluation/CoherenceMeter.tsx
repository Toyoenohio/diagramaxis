import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ShieldCheck, Lightbulb } from 'lucide-react';

export const CoherenceMeter: React.FC = () => {
  const { getCoherenceReport } = useProjectStore();
  const report = getCoherenceReport();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-diagramaxis-success border-diagramaxis-success bg-diagramaxis-success/20';
    if (score >= 60) return 'text-diagramaxis-cyan border-diagramaxis-cyan bg-diagramaxis-cyan/20';
    if (score >= 40) return 'text-diagramaxis-warn border-diagramaxis-warn bg-diagramaxis-warn/20';
    return 'text-diagramaxis-danger border-diagramaxis-danger bg-diagramaxis-danger/20';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-diagramaxis-success shadow-[0_0_8px_rgb(var(--da-success)/0.4)]';
    if (score >= 60) return 'bg-diagramaxis-cyan shadow-[0_0_8px_rgb(var(--da-cyan)/0.4)]';
    if (score >= 40) return 'bg-diagramaxis-warn shadow-[0_0_8px_rgb(var(--da-warn)/0.4)]';
    return 'bg-diagramaxis-danger shadow-[0_0_8px_rgb(var(--da-danger)/0.4)]';
  };

  return (
    <div className="flex flex-col gap-3.5 text-diagramaxis-text">
      {/* Título de Evaluación */}
      <div className="flex items-center justify-between pb-1.5 border-b border-diagramaxis-evalBorder">
        <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-cyan font-semibold">
          Evaluador de Coherencia Proyectual
        </span>
        <span className="font-mono text-[10px] text-diagramaxis-textDim">Sistema ARPV</span>
      </div>

      {/* Indicador Principal */}
      <div className="p-3.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-sm flex items-center justify-between gap-3 shadow-md">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-wider text-diagramaxis-textMuted">
            Índice de Coherencia Tripartita
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif italic font-bold text-[34px] text-diagramaxis-text leading-none">
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

        <div className="w-14 h-14 rounded-full border-2 border-diagramaxis-evalBorder flex items-center justify-center bg-diagramaxis-evalDeep">
          <ShieldCheck
            className={`w-7 h-7 ${
              report.score >= 70 ? 'text-diagramaxis-success' : report.score >= 40 ? 'text-diagramaxis-warn' : 'text-diagramaxis-danger'
            }`}
          />
        </div>
      </div>

      {/* Barras de Desglose Triádico */}
      <div className="flex flex-col gap-3 p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-sm">
        {/* Cobertura Discursiva */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px] text-diagramaxis-textBright">
            <span>1. Fundamentación Discursiva (Lingüístico)</span>
            <span className="font-bold text-diagramaxis-text">{report.discourseCoverage}%</span>
          </div>
          <div className="w-full h-2 bg-diagramaxis-evalDeep rounded-full overflow-hidden border border-diagramaxis-evalBorder">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(report.discourseCoverage)}`}
              style={{ width: `${report.discourseCoverage}%` }}
            />
          </div>
        </div>

        {/* Conectividad Espacial */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px] text-diagramaxis-textBright">
            <span>2. Conectividad y Grafo (Gráfico)</span>
            <span className="font-bold text-diagramaxis-text">{report.spatialExpressiveness}%</span>
          </div>
          <div className="w-full h-2 bg-diagramaxis-evalDeep rounded-full overflow-hidden border border-diagramaxis-evalBorder">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(report.spatialExpressiveness)}`}
              style={{ width: `${report.spatialExpressiveness}%` }}
            />
          </div>
        </div>

        {/* Total Conceptos Activos vs Relaciones */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-diagramaxis-evalBorder font-mono text-center">
          <div className="p-2 bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder rounded-xs">
            <span className="text-[8.5px] text-diagramaxis-textDim block uppercase">Nodos</span>
            <span className="text-[13px] font-bold text-diagramaxis-text">
              {report.activeConceptsCount + report.activeArtifactsCount}
            </span>
          </div>
          <div className="p-2 bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder rounded-xs">
            <span className="text-[8.5px] text-diagramaxis-textDim block uppercase">Relaciones</span>
            <span className="text-[13px] font-bold text-diagramaxis-cyan">{report.relationsCount}</span>
          </div>
          <div className="p-2 bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder rounded-xs">
            <span className="text-[8.5px] text-diagramaxis-textDim block uppercase">Huérfanos</span>
            <span
              className={`text-[13px] font-bold ${
                report.orphanedNodes.length > 0 ? 'text-diagramaxis-danger' : 'text-diagramaxis-success'
              }`}
            >
              {report.orphanedNodes.length}
            </span>
          </div>
        </div>
      </div>

      {/* Sugerencias Pedagógicas Docentes */}
      <div className="flex flex-col gap-2 p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-sm">
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-diagramaxis-warn font-semibold">
          <Lightbulb className="w-4 h-4 text-diagramaxis-warn" />
          <span>Diagnóstico & Sugerencias Pedagógicas</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {report.suggestions.map((sug, idx) => (
            <li key={idx} className="font-mono text-[11px] text-diagramaxis-textBright flex items-start gap-1.5 leading-relaxed">
              <span className="text-diagramaxis-success font-bold">•</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
