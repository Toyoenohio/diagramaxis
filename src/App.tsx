import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0f1013] text-[#f8fafc]">
      {/* Barra de Navegación Superior */}
      <Header />

      {/* Área de Trabajo Principal */}
      <main className="fixed top-[58px] bottom-[38px] left-0 right-0 flex overflow-hidden">
        {/* Barra Lateral Izquierda: Menú y Mazos de Fichas */}
        <LeftSidebar />

        {/* Zona Central Dividida: Tablero + Visor 3D */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative select-none">
          {/* Selector Flotante de Modo de Visualización */}
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center bg-[#17181d]/95 backdrop-blur-md border border-[#2e323c] rounded-sm p-1 gap-1 shadow-xl">
            <button
              onClick={() => setViewMode('split')}
              title="Vista Dividida (Tablero + 3D)"
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'split' ? 'bg-[#e5a93b] text-[#0f1013]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <Columns2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              title="Solo Tablero de Fichas (100%)"
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'diagram' ? 'bg-[#e5a93b] text-[#0f1013]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('3d')}
              title="Solo Visor 3D Modular (100%)"
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === '3d' ? 'bg-[#e5a93b] text-[#0f1013]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
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
            className="h-full border-r border-[#2e323c] relative overflow-hidden bg-[#0f1013]"
          >
            <DiagramCanvas />
          </div>

          {/* Divisor arrastrable (Splitter) */}
          {viewMode === 'split' && (
            <div
              onMouseDown={startResizing}
              className="w-1.5 hover:w-2 bg-[#2e323c] hover:bg-[#e5a93b] cursor-col-resize z-20 transition-all flex items-center justify-center group"
            >
              <div className="w-0.5 h-8 bg-[#64748b] group-hover:bg-[#0f1013] rounded-full" />
            </div>
          )}

          {/* Panel Derecho: Visor 3D Three.js */}
          <div
            style={{
              width: viewMode === 'split' ? `${(1 - splitRatio) * 100}%` : viewMode === '3d' ? '100%' : '0%',
              display: viewMode === 'diagram' ? 'none' : 'block',
            }}
            className="h-full relative overflow-hidden bg-[#0f1013]"
          >
            <Viewport3D />
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
  );
};

export default App;
