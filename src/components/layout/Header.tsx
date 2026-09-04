import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { exportProjectToJSON } from '../../utils/exportUtils';
import { useTheme, toggleTheme } from '../../theme';
import {
  Settings,
  Download,
  Plus,
  LayoutGrid,
  BookMarked,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const theme = useTheme();
  const isDark = theme === 'dark';
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
    <header className="fixed top-0 left-0 right-0 h-[58px] bg-diagramaxis-surface border-b border-diagramaxis-border z-40 flex items-center px-4 justify-between shadow-lg select-none text-diagramaxis-text">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setModalOpen('project', true)}
        >
          {/* Logo Diagramaxis Icon */}
          <div className="w-8 h-8 bg-diagramaxis-brandChip border border-diagramaxis-gold/60 flex items-center justify-center rounded-xs shadow-[0_0_10px_rgb(var(--da-gold)/0.2)] group-hover:border-diagramaxis-gold transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'rgb(var(--da-gold))' }} strokeWidth="1.8">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-black text-[18px] tracking-wider text-diagramaxis-text uppercase">
                DIAGRAMAXIS<span className="text-diagramaxis-gold">.</span>
              </span>
            </div>
            <span className="font-mono text-[8px] tracking-wider text-diagramaxis-textMuted">
              Un juego contra el silencio sistémico · Angel Peña Villegas
            </span>
          </div>
        </div>

        <div className="w-[1px] h-7 bg-diagramaxis-border hidden sm:block" />

        <div
          className="hidden sm:flex flex-col cursor-pointer group"
          onClick={() => setModalOpen('project', true)}
        >
          <span className="font-serif italic text-[15px] text-diagramaxis-gold group-hover:underline transition-colors truncate max-w-[260px]">
            {projectName || 'Partida sin título'}
          </span>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            {architectName || 'Jugador / Arquitecto'} {location ? `· ${location}` : ''}
          </span>
        </div>
      </div>

      {/* Indicador de Coherencia Proyectual */}
      <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-diagramaxis-surface2 border border-diagramaxis-border rounded-sm shadow-inner">
        <ShieldCheck
          className={`w-4 h-4 ${
            coherence.score >= 70 ? 'text-diagramaxis-gold' : coherence.score >= 40 ? 'text-diagramaxis-orange' : 'text-diagramaxis-danger'
          }`}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[7.5px] uppercase tracking-wider text-diagramaxis-textMuted">
            Coherencia del Tablero
          </span>
          <span className="font-mono text-[11px] font-bold text-diagramaxis-text">
            {coherence.score}%{' '}
            <span className="text-diagramaxis-gold font-normal text-[9.5px]">
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
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-gold border border-diagramaxis-gold/40 hover:border-diagramaxis-gold rounded-sm transition-all shadow-xs"
        >
          <BookMarked className="w-3.5 h-3.5 text-diagramaxis-gold" />
          <span className="hidden sm:inline font-semibold">Casos / Reglas</span>
        </button>

        <button
          onClick={() => setModalOpen('relation', true)}
          disabled={activeConcepts.length + activeArtifacts.length < 2}
          title="Conectar dos fichas mediante un hilo / vínculo semántico"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-diagramaxis-bg font-bold border border-diagramaxis-gold disabled:opacity-30 rounded-sm transition-all shadow-[0_0_12px_rgb(var(--da-gold)/0.3)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Hilo / Vínculo</span>
        </button>

        <button
          onClick={autoLayoutNodes}
          title="Distribuir fichas en el tablero"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-textMuted hover:text-diagramaxis-text border border-diagramaxis-border rounded-sm transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Ordenar Tablero</span>
        </button>

        <button
          onClick={handleExportProject}
          title="Exportar Partida en Formato JSON"
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-textMuted hover:text-diagramaxis-text border border-diagramaxis-border rounded-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">JSON</span>
        </button>

        {/* Alternar Modo Día / Noche */}
        <button
          onClick={() => toggleTheme()}
          title={isDark ? 'Modo diurno (claro)' : 'Modo nocturno (oscuro)'}
          aria-label={isDark ? 'Cambiar a modo diurno' : 'Cambiar a modo nocturno'}
          className="p-2 font-mono bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-textDim hover:text-diagramaxis-gold border border-diagramaxis-border rounded-sm transition-all"
        >
          {isDark ? (
            /* Sol — modo claro */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
            </svg>
          ) : (
            /* Luna — modo nocturno */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setModalOpen('settings', true)}
          title="Ajustes de Inteligencia Artificial (BYOK / Cloudflare)"
          className="p-2 font-mono bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 text-diagramaxis-textMuted hover:text-diagramaxis-text border border-diagramaxis-border rounded-sm transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
