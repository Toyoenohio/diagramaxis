import React, { Component, ReactNode, ErrorInfo, useState, useRef, useEffect, useCallback } from 'react';
import { Header, ViewMode } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar, RightPanelTab } from './components/layout/RightSidebar';
import { ToolRail, PanelId } from './components/layout/ToolRail';
import { StatusBar } from './components/layout/StatusBar';
import { DiagramCanvas } from './components/diagram/DiagramCanvas';
import { Viewport3D } from './components/3d/Viewport3D';
import { ProjectModal } from './components/modals/ProjectModal';
import { RelationModal } from './components/modals/RelationModal';
import { StudyCasesModal } from './components/modals/StudyCasesModal';
import { SettingsModal } from './components/modals/SettingsModal';

// ErrorBoundary global (B3/R2 auditoría): un error no capturado de un panel no
// debe dejar la app en blanco. Con fallback opcional para envolturas específicas.
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="w-screen h-screen flex items-center justify-center bg-diagramaxis-bg text-diagramaxis-text p-6">
            <div className="text-center flex flex-col gap-3 max-w-md">
              <span className="text-[12px] font-medium text-diagramaxis-gold">DIAGRAMAXIS</span>
              <h1 className="font-semibold text-[22px]">Ocurrió un error inesperado</h1>
              <p className="text-[13px] text-diagramaxis-textMuted leading-relaxed">
                La aplicación encontró un problema y mostró esta pantalla en lugar de quedar en blanco.
                Puedes reintentar o recargar la página.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="self-center px-4 py-2 bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-white text-[13px] font-medium rounded-md transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

const RIGHT_PANELS: PanelId[] = ['params', 'relations', 'discourse', 'coherence', 'active'];

export const App: React.FC = () => {
  const [splitRatio, setSplitRatio] = useState<number>(0.5);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Paneles flotantes: el lienzo es la base; los paneles se invocan desde la barra de herramientas.
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanelTab | null>(null);

  const togglePanel = (id: PanelId) => {
    if (id === 'library') {
      setLibraryOpen((v) => !v);
      return;
    }
    setRightPanel((cur) => (cur === id ? null : (id as RightPanelTab)));
  };

  const openPanels: PanelId[] = [
    ...(libraryOpen ? (['library'] as PanelId[]) : []),
    ...(rightPanel ? [rightPanel as PanelId] : []),
  ];

  // Esc cierra paneles (sin interferir con campos de texto)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (rightPanel) setRightPanel(null);
      else if (libraryOpen) setLibraryOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rightPanel, libraryOpen]);

  const stopResizing = () => setIsResizing(false);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - rect.left) / rect.width;
      if (newRatio >= 0.2 && newRatio <= 0.8) setSplitRatio(newRatio);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col w-screen h-screen overflow-hidden bg-diagramaxis-bg text-diagramaxis-text">
        <Header viewMode={viewMode} onViewModeChange={setViewMode} />

        <main className="fixed top-12 bottom-0 left-0 right-0 flex overflow-hidden">
          <ToolRail openPanels={openPanels} onToggle={togglePanel} />

          {/* Lienzo: tablero + visor 3D a sangre completa */}
          <div ref={containerRef} className="flex-1 flex overflow-hidden relative select-none">
            <div
              style={{
                width: viewMode === 'split' ? `${splitRatio * 100}%` : viewMode === 'diagram' ? '100%' : '0%',
                display: viewMode === '3d' ? 'none' : 'block',
              }}
              className="h-full relative overflow-hidden bg-diagramaxis-bg"
            >
              <DiagramCanvas />
            </div>

            {viewMode === 'split' && (
              <div
                onMouseDown={() => setIsResizing(true)}
                className="relative w-px bg-diagramaxis-border cursor-col-resize z-20 group"
              >
                <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full bg-diagramaxis-borderLight group-hover:bg-diagramaxis-gold transition-colors" />
              </div>
            )}

            <div
              style={{
                width: viewMode === 'split' ? `${(1 - splitRatio) * 100}%` : viewMode === '3d' ? '100%' : '0%',
                display: viewMode === 'diagram' ? 'none' : 'block',
              }}
              className="h-full relative overflow-hidden bg-diagramaxis-bg"
            >
              <ErrorBoundary
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-diagramaxis-bg p-6">
                    <p className="text-[13px] text-diagramaxis-textMuted text-center leading-relaxed max-w-[300px]">
                      El visor 3D encontró un error y quedó desactivado. El tablero 2D y el resto de la
                      herramienta siguen operativos.
                    </p>
                  </div>
                }
              >
                <Viewport3D />
              </ErrorBoundary>
            </div>

            {/* Panel flotante izquierdo: Biblioteca de fichas */}
            {libraryOpen && (
              <div className="absolute left-3 top-3 bottom-3 w-[320px] z-40 rounded-xl float-surface overflow-hidden animate-panel-left">
                <LeftSidebar onClose={() => setLibraryOpen(false)} />
              </div>
            )}

            {/* Panel flotante derecho: Inspector / Hilos / Discurso / Coherencia / Secuencia */}
            {rightPanel && RIGHT_PANELS.includes(rightPanel) && (
              <div className="absolute right-3 top-3 bottom-3 w-[360px] z-40 rounded-xl float-surface overflow-hidden animate-panel-right">
                <RightSidebar tab={rightPanel} onTabChange={setRightPanel} onClose={() => setRightPanel(null)} />
              </div>
            )}
          </div>
        </main>

        {/* Notificaciones flotantes */}
        <StatusBar />

        <ProjectModal />
        <RelationModal />
        <StudyCasesModal />
        <SettingsModal />
      </div>
    </ErrorBoundary>
  );
};

export default App;
