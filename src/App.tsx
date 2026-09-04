import React, { Component, ReactNode, ErrorInfo, useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { StatusBar } from './components/layout/StatusBar';
import { DiagramCanvas } from './components/diagram/DiagramCanvas';
import { Viewport3D } from './components/3d/Viewport3D';
import { ProjectModal } from './components/modals/ProjectModal';
import { RelationModal } from './components/modals/RelationModal';
import { StudyCasesModal } from './components/modals/StudyCasesModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { Columns2, Square, Box } from 'lucide-react';

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
              <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
                DIAGRAMAXIS · Error
              </span>
              <h1 className="font-serif font-bold text-[22px]">Ocurrió un error inesperado</h1>
              <p className="font-mono text-[11px] text-diagramaxis-textMuted leading-relaxed">
                La aplicación encontró un problema y mostró esta pantalla en lugar de quedar en blanco.
                Puedes reintentar o recargar la página; tu trabajo puede exportarse como JSON desde el
                encabezado.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="self-center px-5 py-2.5 bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-diagramaxis-bg font-mono text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors"
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

export const App: React.FC = () => {
  const [splitRatio, setSplitRatio] = useState<number>(0.5); // 50% diagrama / 50% 3D
  const [viewMode, setViewMode] = useState<'split' | 'diagram' | '3d'>('split');
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - rect.left) / rect.width;
      if (newRatio >= 0.2 && newRatio <= 0.8) {
        setSplitRatio(newRatio);
      }
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
      {/* Barra de Navegación Superior */}
      <Header />

      {/* Área de Trabajo Principal */}
      <main className="fixed top-[58px] bottom-[38px] left-0 right-0 flex overflow-hidden">
        {/* Barra Lateral Izquierda: Menú y Mazos de Fichas */}
        <LeftSidebar />

        {/* Zona Central Dividida: Tablero + Visor 3D */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative select-none">
          {/* Selector Flotante de Modo de Visualización */}
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center bg-diagramaxis-surface/95 backdrop-blur-md border border-diagramaxis-border rounded-sm p-1 gap-1 shadow-xl">
            <button
              onClick={() => setViewMode('split')}
              title="Vista Dividida (Tablero + 3D)"
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'split' ? 'bg-diagramaxis-gold text-diagramaxis-bg' : 'text-diagramaxis-textMuted hover:text-diagramaxis-text'
              }`}
            >
              <Columns2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              title="Solo Tablero de Fichas (100%)"
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'diagram' ? 'bg-diagramaxis-gold text-diagramaxis-bg' : 'text-diagramaxis-textMuted hover:text-diagramaxis-text'
              }`}
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('3d')}
              title="Solo Visor 3D Modular (100%)"
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === '3d' ? 'bg-diagramaxis-gold text-diagramaxis-bg' : 'text-diagramaxis-textMuted hover:text-diagramaxis-text'
              }`}
            >
              <Box className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Izquierdo: Tablero React Flow */}
          <div
            style={{
              width: viewMode === 'split' ? `${splitRatio * 100}%` : viewMode === 'diagram' ? '100%' : '0%',
              display: viewMode === '3d' ? 'none' : 'block',
            }}
            className="h-full border-r border-diagramaxis-border relative overflow-hidden bg-diagramaxis-bg"
          >
            <DiagramCanvas />
          </div>

          {/* Divisor arrastrable (Splitter) */}
          {viewMode === 'split' && (
            <div
              onMouseDown={startResizing}
              className="w-1.5 hover:w-2 bg-diagramaxis-border hover:bg-diagramaxis-gold cursor-col-resize z-20 transition-all flex items-center justify-center group"
            >
              <div className="w-0.5 h-8 bg-diagramaxis-textDim group-hover:bg-diagramaxis-bg rounded-full" />
            </div>
          )}

          {/* Panel Derecho: Visor 3D Three.js */}
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
                  <p className="font-mono text-[11px] text-diagramaxis-textMuted text-center leading-relaxed max-w-[300px]">
                    El visor 3D encontró un error y quedó desactivado. El tablero 2D y el resto de la
                    herramienta siguen operativos.
                  </p>
                </div>
              }
            >
              <Viewport3D />
            </ErrorBoundary>
          </div>
        </div>

        {/* Barra Lateral Derecha: Parámetros, Relaciones, Discurso y Coherencia */}
        <RightSidebar />
      </main>

      {/* Barra de Estado Inferior */}
      <StatusBar />

      {/* Modales del Sistema */}
      <ProjectModal />
      <RelationModal />
      <StudyCasesModal />
      <SettingsModal />
      </div>
    </ErrorBoundary>
  );
};

export default App;
