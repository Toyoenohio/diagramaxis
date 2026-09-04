import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { X } from 'lucide-react';

export const ProjectModal: React.FC = () => {
  const {
    isProjectModalOpen,
    projectName,
    architectName,
    location,
    isInitialized,
    initProject,
    setProjectMetadata,
    setModalOpen,
  } = useProjectStore();

  const [pName, setPName] = useState(projectName);
  const [aName, setAName] = useState(architectName);
  const [loc, setLoc] = useState(location);
  const [termsAccepted, setTermsAccepted] = useState(isInitialized);

  if (!isProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;

    if (!isInitialized) {
      initProject(pName, aName, loc);
    } else {
      setProjectMetadata({
        projectName: pName,
        architectName: aName,
        location: loc,
      });
      setModalOpen('project', false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090d14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1724] border border-[#24354d] w-full max-w-[480px] rounded-sm shadow-2xl p-7 flex flex-col gap-5 select-none text-[#f8fafc]">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#22c55e] font-semibold">
              Simulador Proyectual Arquitectónico
            </span>
            <h2 className="font-serif font-bold text-[24px] text-[#f8fafc] leading-tight">
              {isInitialized ? 'Propiedades del Proyecto' : 'Iniciar Nuevo Proyecto'}
            </h2>
            <span className="font-mono text-[10.5px] text-[#94a3b8]">
              Sistema Proyectual ARPV · Angel Ramón Peña Villegas
            </span>
          </div>

          {isInitialized && (
            <button
              onClick={() => setModalOpen('project', false)}
              className="text-[#94a3b8] hover:text-[#f8fafc] p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#94a3b8] font-semibold">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              required
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="Ej. Centro Cultural del Lago"
              className="w-full p-3 bg-[#162234] border border-[#24354d] focus:border-[#22c55e] rounded-xs font-serif italic text-[16px] text-[#f8fafc] outline-none placeholder:text-[#64748b]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#94a3b8] font-semibold">
              Nombre del Arquitecto / Estudiante
            </label>
            <input
              type="text"
              required
              value={aName}
              onChange={(e) => setAName(e.target.value)}
              placeholder="Ej. Juan David Giraldo"
              className="w-full p-3 bg-[#162234] border border-[#24354d] focus:border-[#22c55e] rounded-xs font-mono text-[12px] text-[#f8fafc] outline-none placeholder:text-[#64748b]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#94a3b8] font-semibold">
              Ubicación & Orientación Solar (Ciudad, País)
            </label>
            <input
              type="text"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="Ej. Bogotá, Colombia (Lat: 4°N)"
              className="w-full p-3 bg-[#162234] border border-[#24354d] focus:border-[#22c55e] rounded-xs font-mono text-[12px] text-[#f8fafc] outline-none placeholder:text-[#64748b]"
            />
          </div>

          <div className="p-3 bg-[#162234] border border-[#24354d] rounded-xs flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#06b6d4] font-semibold">
              Declaración Metodológica y Derechos:
            </span>
            <p className="font-mono text-[9.5px] text-[#cbd5e1] leading-relaxed">
              El Sistema Proyectual ARPV es propiedad intelectual de Angel Ramón Peña Villegas. El usuario es el único autor intelectual de las composiciones generadas.
            </p>
          </div>

          <label className="flex items-center gap-2.5 font-mono text-[10.5px] text-[#cbd5e1] cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 accent-[#22c55e] rounded-xs cursor-pointer"
            />
            <span>Acepto las condiciones metodológicas de la herramienta</span>
          </label>

          <button
            type="submit"
            disabled={!termsAccepted || !pName.trim() || !aName.trim()}
            className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-[#090d14] font-mono text-[11px] font-bold uppercase tracking-widest disabled:opacity-30 rounded-xs transition-all mt-2 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
          >
            {isInitialized ? 'Guardar Cambios' : 'Comenzar Proceso Proyectual'}
          </button>
        </form>
      </div>
    </div>
  );
};
