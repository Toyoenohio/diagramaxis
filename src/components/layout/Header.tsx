import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { exportProjectToJSON } from '../../utils/exportUtils';
import { useTheme, toggleTheme } from '../../theme';
import {
  Settings,
  Download,
  Plus,
  LayoutGrid,
  BookOpen,
  Columns2,
  Square,
  Box,
  Sun,
  Moon,
} from 'lucide-react';

export type ViewMode = 'split' | 'diagram' | '3d';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const IconButton: React.FC<{
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    className="w-8 h-8 flex items-center justify-center rounded-md text-diagramaxis-textMuted hover:text-diagramaxis-text hover:bg-diagramaxis-surface2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
  >
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ viewMode, onViewModeChange }) => {
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
  const coherenceColor =
    coherence.score >= 70 ? 'bg-diagramaxis-success' : coherence.score >= 40 ? 'bg-diagramaxis-warn' : 'bg-diagramaxis-danger';

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
    showToast('Proyecto exportado (.json)');
  };

  const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'diagram', label: 'Tablero', icon: Square },
    { id: 'split', label: 'Dividido', icon: Columns2 },
    { id: '3d', label: '3D', icon: Box },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-diagramaxis-surface border-b border-diagramaxis-border z-40 grid grid-cols-[1fr_auto_1fr] items-center px-3 select-none text-diagramaxis-text">
      {/* Marca + proyecto */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setModalOpen('project', true)}
          className="flex items-center gap-2.5 min-w-0 px-1.5 py-1 rounded-md hover:bg-diagramaxis-surface2 transition-colors"
          title="Datos del proyecto"
        >
          <div className="w-7 h-7 rounded-md bg-diagramaxis-brandChip flex items-center justify-center shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--da-bg))" strokeWidth="2" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold tracking-tight">Diagramaxis</span>
          <span className="text-diagramaxis-textDim">/</span>
          <span className="text-[13.5px] text-diagramaxis-textMuted truncate max-w-[220px]">
            {projectName || 'Proyecto sin título'}
          </span>
        </button>
      </div>

      {/* Selector de vista */}
      <div className="flex items-center p-0.5 rounded-lg bg-diagramaxis-surface2 border border-diagramaxis-border">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewModeChange(id)}
            className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-[12.5px] font-medium transition-all ${
              viewMode === id
                ? 'bg-diagramaxis-surface text-diagramaxis-text shadow-sm'
                : 'text-diagramaxis-textMuted hover:text-diagramaxis-text'
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-1">
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 h-7 mr-1 rounded-full border border-diagramaxis-border text-[12px] text-diagramaxis-textMuted"
          title={`Coherencia del tablero: ${coherence.level}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${coherenceColor}`} />
          <span className="font-medium text-diagramaxis-text tabular-nums">{coherence.score}%</span>
          <span>coherencia</span>
        </div>

        <IconButton onClick={() => setModalOpen('studyCases', true)} title="Casos de estudio y reglas">
          <BookOpen className="w-4 h-4" strokeWidth={1.75} />
        </IconButton>
        <IconButton onClick={autoLayoutNodes} title="Ordenar tablero">
          <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
        </IconButton>
        <IconButton onClick={handleExportProject} title="Exportar proyecto (.json)">
          <Download className="w-4 h-4" strokeWidth={1.75} />
        </IconButton>
        <IconButton onClick={() => toggleTheme()} title={isDark ? 'Modo claro' : 'Modo oscuro'}>
          {isDark ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
        </IconButton>
        <IconButton onClick={() => setModalOpen('settings', true)} title="Ajustes de IA">
          <Settings className="w-4 h-4" strokeWidth={1.75} />
        </IconButton>

        <div className="w-px h-5 bg-diagramaxis-border mx-1.5" />

        <button
          type="button"
          onClick={() => setModalOpen('relation', true)}
          disabled={activeConcepts.length + activeArtifacts.length < 2}
          title="Conectar dos fichas mediante un vínculo"
          className="flex items-center gap-1.5 pl-2.5 pr-3 h-8 rounded-md bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-white text-[12.5px] font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
          <span>Vínculo</span>
        </button>
      </div>
    </header>
  );
};
