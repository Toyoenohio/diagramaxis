import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { exportProjectToJSON } from '../../utils/exportUtils';
import {
  Settings,
  Download,
  Plus,
  LayoutGrid,
  BookMarked,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    projectName,
    architectName,
    location,
    activeConcepts,
    activeArtifacts,
    nodeParams,
    relations,
    discourse,
    baseDimensions,
    northRotation,
    setModalOpen,
    autoLayoutNodes,
    showToast,
    getCoherenceReport,
  } = useProjectStore();

  const coherence = getCoherenceReport();

  const handleExportProject = () => {
    exportProjectToJSON({
      sistema: 'DIAGRAMAXIS. · Sistema Proyectual ARPV',
      version: '2.0.0',
      proyecto: projectName,
      arquitecto: architectName,
      ubicacion: location,
      fecha: new Date().toISOString(),
      conceptos_activos: activeConcepts,
      artefactos_activos: activeArtifacts,
      params: nodeParams,
      relaciones: relations,
      discurso: discourse,
      volumen_base: baseDimensions,
      northRot: northRotation,
    });
    showToast('Partida / Proyecto exportado (.JSON)');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[58px] bg-[#17181d] border-b border-[#2e323c] z-40 flex items-center px-4 justify-between shadow-lg select-none text-[#f8fafc]">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setModalOpen('project', true)}
        >
          {/* Logo Diagramaxis Icon */}
          <div className="w-8 h-8 bg-[#0f1013] border border-[#e5a93b]/60 flex items-center justify-center rounded-xs shadow-[0_0_10px_rgba(229,169,59,0.2)] group-hover:border-[#e5a93b] transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e5a93b" strokeWidth="1.8">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-black text-[18px] tracking-wider text-[#f8fafc] uppercase">
                DIAGRAMAXIS<span className="text-[#e5a93b]">.</span>
              </span>
            </div>
            <span className="font-mono text-[8px] tracking-wider text-[#94a3b8]">
              Un juego contra el silencio sistémico · Angel Peña Villegas
            </span>
          </div>
        </div>

        <div className="w-[1px] h-7 bg-[#2e323c] hidden sm:block" />

        <div
          className="hidden sm:flex flex-col cursor-pointer group"
          onClick={() => setModalOpen('project', true)}
        >
          <span className="font-serif italic text-[15px] text-[#e5a93b] group-hover:underline transition-colors truncate max-w-[260px]">
            {projectName || 'Partida sin título'}
          </span>
          <span className="font-mono text-[9px] text-[#64748b]">
            {architectName || 'Jugador / Arquitecto'} {location ? `· ${location}` : ''}
          </span>
        </div>
      </div>

      {/* Indicador de Coherencia Proyectual */}
      <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-[#1f2128] border border-[#2e323c] rounded-sm shadow-inner">
        <ShieldCheck
          className={`w-4 h-4 ${
            coherence.score >= 70 ? 'text-[#e5a93b]' : coherence.score >= 40 ? 'text-[#ea580c]' : 'text-[#ef4444]'
          }`}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-[#94a3b8]">
            Coherencia del Tablero
          </span>
          <span className="font-mono text-[11px] font-bold text-[#f8fafc]">
            {coherence.score}%{' '}
            <span className="text-[#e5a93b] font-normal text-[9.5px]">
              ({coherence.level})
            </span>
          </span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModalOpen('studyCases', true)}
          title="Manual de Reglas y Casos de Estudio"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-[#1f2128] hover:bg-[#2a2d36] text-[#e5a93b] border border-[#e5a93b]/40 hover:border-[#e5a93b] rounded-sm transition-all shadow-xs"
        >
          <BookMarked className="w-3.5 h-3.5 text-[#e5a93b]" />
          <span className="hidden sm:inline font-semibold">Casos / Reglas</span>
        </button>

        <button
          onClick={() => setModalOpen('relation', true)}
          disabled={activeConcepts.length + activeArtifacts.length < 2}
          title="Conectar dos fichas mediante un hilo / vínculo semántico"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-[#e5a93b] hover:bg-[#d49b28] text-[#0f1013] font-bold border border-[#e5a93b] disabled:opacity-30 rounded-sm transition-all shadow-[0_0_12px_rgba(229,169,59,0.3)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Hilo / Vínculo</span>
        </button>

        <button
          onClick={autoLayoutNodes}
          title="Distribuir fichas en el tablero"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-[#1f2128] hover:bg-[#2a2d36] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2e323c] rounded-sm transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Ordenar Tablero</span>
        </button>

        <button
          onClick={handleExportProject}
          title="Exportar Partida en Formato JSON"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-[#1f2128] hover:bg-[#2a2d36] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2e323c] rounded-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">JSON</span>
        </button>

        <button
          onClick={() => setModalOpen('settings', true)}
          title="Ajustes de Inteligencia Artificial (BYOK / Cloudflare)"
          className="p-2 font-mono bg-[#1f2128] hover:bg-[#2a2d36] text-[#94a3b8] hover:text-[#f8fafc] border border-[#2e323c] rounded-sm transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
