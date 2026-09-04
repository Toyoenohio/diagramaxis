import React, { useState, useEffect, useRef } from 'react';
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

  // B9 auditoría: re-sembrar el estado cada vez que se abre el modal para no
  // mostrar (ni sobrescribir) valores obsoletos del arranque de la app.
  const [pName, setPName] = useState(projectName);
  const [aName, setAName] = useState(architectName);
  const [loc, setLoc] = useState(location);
  const [termsAccepted, setTermsAccepted] = useState(isInitialized);

  const prevOpenRef = useRef(isProjectModalOpen);
  useEffect(() => {
    if (isProjectModalOpen && !prevOpenRef.current) {
      const st = useProjectStore.getState();
      setPName(st.projectName);
      setAName(st.architectName);
      setLoc(st.location);
      setTermsAccepted(st.isInitialized);
    }
    prevOpenRef.current = isProjectModalOpen;
  }, [isProjectModalOpen]);

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
    <div className="fixed inset-0 bg-diagramaxis-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder w-full max-w-[480px] rounded-sm shadow-2xl p-7 flex flex-col gap-5 select-none text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-success font-semibold">
              Simulador Proyectual Arquitectónico
            </span>
            <h2 className="font-serif font-bold text-[24px] text-diagramaxis-text leading-tight">
              {isInitialized ? 'Propiedades del Proyecto' : 'Iniciar Nuevo Proyecto'}
            </h2>
            <span className="font-mono text-[10.5px] text-diagramaxis-textMuted">
              Sistema Proyectual ARPV · Angel Ramón Peña Villegas
            </span>
          </div>

          {isInitialized && (
            <button
              onClick={() => setModalOpen('project', false)}
              className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              required
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="Ej. Centro Cultural del Lago"
              className="w-full p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-serif italic text-[16px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
              Nombre del Arquitecto / Estudiante
            </label>
            <input
              type="text"
              required
              value={aName}
              onChange={(e) => setAName(e.target.value)}
              placeholder="Ej. Juan David Giraldo"
              className="w-full p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-mono text-[12px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
              Ubicación & Orientación Solar (Ciudad, País)
            </label>
            <input
              type="text"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="Ej. Bogotá, Colombia (Lat: 4°N)"
              className="w-full p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-mono text-[12px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim"
            />
          </div>

          <div className="p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-xs flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-diagramaxis-cyan font-semibold">
              Declaración Metodológica y Derechos:
            </span>
            <p className="font-mono text-[9.5px] text-diagramaxis-textBright leading-relaxed">
              El Sistema Proyectual ARPV es propiedad intelectual de Angel Ramón Peña Villegas. El usuario es el único autor intelectual de las composiciones generadas.
            </p>
          </div>

          <label className="flex items-center gap-2.5 font-mono text-[10.5px] text-diagramaxis-textBright cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 accent-diagramaxis-success rounded-xs cursor-pointer"
            />
            <span>Acepto las condiciones metodológicas de la herramienta</span>
          </label>

          <button
            type="submit"
            disabled={!termsAccepted || !pName.trim() || !aName.trim()}
            className="w-full py-3 bg-diagramaxis-success hover:bg-diagramaxis-successHover text-diagramaxis-successInk font-mono text-[11px] font-bold uppercase tracking-widest disabled:opacity-30 rounded-xs transition-all mt-2 shadow-[0_0_12px_rgb(var(--da-success)/0.3)]"
          >
            {isInitialized ? 'Guardar Cambios' : 'Comenzar Proceso Proyectual'}
          </button>
        </form>
      </div>
    </div>
  );
};
