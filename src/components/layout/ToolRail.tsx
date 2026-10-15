import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Library, SlidersHorizontal, Spline, FileText, ShieldCheck, ListOrdered } from 'lucide-react';

export type PanelId = 'library' | 'params' | 'relations' | 'discourse' | 'coherence' | 'active';

interface ToolRailProps {
  openPanels: PanelId[];
  onToggle: (id: PanelId) => void;
}

/**
 * Barra de herramientas vertical mínima. Cada botón invoca un panel flotante
 * sobre el lienzo; un segundo clic lo cierra.
 */
export const ToolRail: React.FC<ToolRailProps> = ({ openPanels, onToggle }) => {
  const { activeConcepts, activeArtifacts, relations, getCoherenceReport } = useProjectStore();
  const coherence = getCoherenceReport();
  const activeCount = activeConcepts.length + activeArtifacts.length;

  const groups: { id: PanelId; label: string; icon: React.ElementType; badge?: number | string }[][] = [
    [{ id: 'library', label: 'Biblioteca de fichas', icon: Library }],
    [
      { id: 'params', label: 'Inspector · volúmenes y parámetros', icon: SlidersHorizontal },
      { id: 'relations', label: 'Hilos / vínculos', icon: Spline, badge: relations.length || undefined },
      { id: 'active', label: 'Secuencia de fichas activas', icon: ListOrdered, badge: activeCount || undefined },
    ],
    [
      { id: 'discourse', label: 'Discurso proyectual', icon: FileText },
      { id: 'coherence', label: `Coherencia · ${coherence.score}%`, icon: ShieldCheck },
    ],
  ];

  return (
    <nav className="w-14 shrink-0 h-full bg-diagramaxis-surface border-r border-diagramaxis-border flex flex-col items-center py-3 gap-1 z-30">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div className="w-6 h-px bg-diagramaxis-border my-2" />}
          {group.map(({ id, label, icon: Icon, badge }) => {
            const isOpen = openPanels.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                title={label}
                aria-label={label}
                aria-pressed={isOpen}
                className={`group relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  isOpen
                    ? 'bg-diagramaxis-gold/10 text-diagramaxis-gold'
                    : 'text-diagramaxis-textMuted hover:bg-diagramaxis-surface2 hover:text-diagramaxis-text'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {badge !== undefined && (
                  <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-diagramaxis-gold text-white text-[9px] font-semibold leading-[15px] text-center">
                    {badge}
                  </span>
                )}
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-2.5 px-2 py-1 rounded-md bg-diagramaxis-brandChip text-diagramaxis-bg text-[11.5px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {label}
                </span>
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </nav>
  );
};
