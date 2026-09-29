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
      <div className="bg-diagramaxis-surface border border-diagramaxis-border w-full max-w-[480px] p-7 flex flex-col gap-5 select-none text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-wider text-diagramaxis-gold font-semibold">
              Simulador Proyectual Arquitectónico
            </span>
            <h2 className="font-serif font-bold text-[24px] text-diagramaxis-text leading-tight mt-0.5">
              {isInitialized ? 'Propiedades del Proyecto' : 'Iniciar Nuevo Proyecto'}
            </h2>
            <span className="font-sans text-[12px] text-diagramaxis-textMuted">
              Sistema Proyectual ARPV · Angel Ramón Peña Villegas
            </span>
          </div>

          {isInitialized && (
            <button
              onClick={() => setModalOpen('project', false)}
              className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[13px] font-semibold text-diagramaxis-textSecondary">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              required
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="Ej. Centro Cultural del Lago"
              className="w-full p-3 bg-diagramaxis-bg border border-diagramaxis-border focus:border-diagramaxis-gold font-serif italic text-[16px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[13px] font-semibold text-diagramaxis-textSecondary">
              Nombre del Arquitecto / Estudiante
            </label>
            <input
              type="text"
              required
              value={aName}
              onChange={(e) => setAName(e.target.value)}
              placeholder="Ej. Juan David Giraldo"
              className="w-full p-3 bg-diagramaxis-bg border border-diagramaxis-border focus:border-diagramaxis-gold font-sans text-[14px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[13px] font-semibold text-diagramaxis-textSecondary">
              Ubicación & Orientación Solar (Ciudad, País)
            </label>
            <input
              type="text"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="Ej. Bogotá, Colombia (Lat: 4°N)"
              className="w-full p-3 bg-diagramaxis-bg border border-diagramaxis-border focus:border-diagramaxis-gold font-sans text-[14px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
            />
          </div>

          <div className="p-3 bg-diagramaxis-surface2 border border-diagramaxis-border flex flex-col gap-1">
            <span className="font-sans text-[11px] uppercase tracking-wider text-diagramaxis-textSecondary font-semibold">
              Declaración Metodológica y Derechos:
            </span>
            <p className="font-sans text-[12px] text-diagramaxis-textSecondary leading-relaxed">
              El Sistema Proyectual ARPV es propiedad intelectual de Angel Ramón Peña Villegas. El usuario es el único autor intelectual de las composiciones generadas.
            </p>
          </div>

          <label className="flex items-center gap-2.5 font-sans text-[13px] text-diagramaxis-textSecondary cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 accent-diagramaxis-gold cursor-pointer"
            />
            <span>Acepto las condiciones metodológicas de la herramienta</span>
          </label>

          <button
            type="submit"
            disabled={!termsAccepted || !pName.trim() || !aName.trim()}
            className="w-full py-3 bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-diagramaxis-bg font-sans text-[14px] font-semibold uppercase tracking-wider disabled:opacity-40 transition-colors mt-2"
          >
            {isInitialized ? 'Guardar Cambios' : 'Comenzar Proceso Proyectual'}
          </button>
        </form>
      </div>
    </div>
  );
};
