import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { CONCEPTS_DATA, ARTIFACTS_DATA } from '../../data/architecturalMenu';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { Search, ChevronDown, ChevronRight, Disc, Layers } from 'lucide-react';

const DECK_INFO = {
  'Temas Arquitectónicos': {
    subtitle: 'Cuestiones clave que abren el proyecto.',
    icon: '⬢',
    color: 'rgb(var(--da-gold))',
  },
  'Componentes de la Realidad': {
    subtitle: 'Elementos, actores y condiciones del contexto.',
    icon: '◎',
    color: 'rgb(var(--da-cyan))',
  },
  'Relaciones Paralógicas': {
    subtitle: 'Conexiones inesperadas que expanden las posibilidades.',
    icon: '⬡',
    color: 'rgb(var(--da-orange))',
  },
  'Artefactos': {
    subtitle: 'Elementos del lenguaje proyectual.',
    icon: '◼',
    color: 'rgb(var(--da-kraft-fg))',
  },
};

export const LeftSidebar: React.FC = () => {
  const [activeDeck, setActiveDeck] = useState<string>('Temas Arquitectónicos');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const { activeConcepts, activeArtifacts, toggleConcept, toggleArtifact } = useProjectStore();

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Filtrado por mazo activo
  const filteredConcepts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (activeDeck === 'Artefactos') return [];

    const deckConcepts = CONCEPTS_DATA.filter((c) => c.category === activeDeck);
    if (!q) return deckConcepts;

    return deckConcepts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subcategory.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [activeDeck, searchQuery]);

  // Agrupado por subcategorías
  const subcategoryGroups = useMemo(() => {
    const map: Record<string, typeof CONCEPTS_DATA> = {};
    filteredConcepts.forEach((c) => {
      if (!map[c.subcategory]) map[c.subcategory] = [];
      map[c.subcategory].push(c);
    });
    return map;
  }, [filteredConcepts]);

  // Artefactos filtrados
  const filteredArtifacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (activeDeck !== 'Artefactos') return [];
    if (!q) return ARTIFACTS_DATA;
    return ARTIFACTS_DATA.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [activeDeck, searchQuery]);

  return (
    <aside className="w-[330px] min-w-[330px] h-full bg-diagramaxis-surface border-r border-diagramaxis-border flex flex-col z-20 select-none text-diagramaxis-text">
      {/* Selector de los 4 Mazos Circulares de la Caja DIAGRAMAXIS */}
      <div className="p-3 bg-diagramaxis-bg border-b border-diagramaxis-border flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-diagramaxis-gold font-bold">
            Bandeja de Fichas (4 Mazos)
          </span>
          <Layers className="w-3.5 h-3.5 text-diagramaxis-gold" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(DECK_INFO).map(([deckName, info]) => {
            const isSelected = activeDeck === deckName;
            return (
              <button
                key={deckName}
                onClick={() => setActiveDeck(deckName)}
                className={`p-2.5 rounded-sm border text-left flex flex-col gap-1 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-diagramaxis-surface2 border-diagramaxis-gold shadow-[0_0_12px_rgb(var(--da-gold)/0.25)]'
                    : 'bg-diagramaxis-surface border-diagramaxis-border hover:border-diagramaxis-borderLight'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider font-bold ${
                      isSelected ? 'text-diagramaxis-gold' : 'text-diagramaxis-textMuted'
                    }`}
                  >
                    {deckName === 'Temas Arquitectónicos' && '1. Temas'}
                    {deckName === 'Componentes de la Realidad' && '2. Realidad'}
                    {deckName === 'Relaciones Paralógicas' && '3. Paralógicas'}
                    {deckName === 'Artefactos' && '4. Artefactos'}
                  </span>
                  <span className="text-[12px]" style={{ color: info.color }}>
                    {info.icon}
                  </span>
                </div>
                <span className="font-mono text-[8.5px] text-diagramaxis-textDim leading-tight line-clamp-1">
                  {info.subtitle}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-diagramaxis-gold" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabecera del Mazo Seleccionado */}
      <div className="px-4 py-3 bg-diagramaxis-surface2 border-b border-diagramaxis-border flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic font-bold text-[17px] text-diagramaxis-text">
            {activeDeck}
          </h3>
          <span className="font-mono text-[10.5px] px-2 py-0.5 bg-diagramaxis-bg text-diagramaxis-gold border border-diagramaxis-gold/30 rounded-xs font-semibold">
            {activeDeck === 'Artefactos' ? ARTIFACTS_DATA.length : CONCEPTS_DATA.filter(c => c.category === activeDeck).length} fichas
          </span>
        </div>
        <p className="font-mono text-[10px] text-diagramaxis-textMuted">
          {DECK_INFO[activeDeck as keyof typeof DECK_INFO]?.subtitle}
        </p>
      </div>

      {/* Barra de Búsqueda */}
      <div className="p-3 border-b border-diagramaxis-border bg-diagramaxis-surface">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-diagramaxis-textDim absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en ${activeDeck}...`}
            className="w-full pl-9 pr-3 py-2 bg-diagramaxis-surface2 border border-diagramaxis-border focus:border-diagramaxis-gold rounded-xs font-mono text-[13px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
          />
        </div>
      </div>

      {/* Fichas de Madera Grabada con Scroll */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4 custom-scrollbar">
        {activeDeck !== 'Artefactos' ? (
          Object.keys(subcategoryGroups).length === 0 ? (
            <div className="p-6 text-center font-mono text-[12px] text-diagramaxis-textDim">
              No se encontraron fichas para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            Object.entries(subcategoryGroups).map(([subcategory, concepts]) => {
              const isCollapsed = collapsedCategories[subcategory];
              return (
                <div key={subcategory} className="flex flex-col gap-2">
                  <div
                    onClick={() => toggleCategoryCollapse(subcategory)}
                    className="flex items-center justify-between py-2 px-2.5 bg-diagramaxis-surface2 hover:bg-diagramaxis-surface3 rounded-xs cursor-pointer border border-diagramaxis-border transition-colors"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-widest text-diagramaxis-gold font-bold">
                      {subcategory} ({concepts.length})
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-diagramaxis-textDim" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-diagramaxis-gold" />
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex flex-wrap gap-2 pl-1 pt-1">
                      {concepts.map((c) => {
                        const isActive = activeConcepts.includes(c.id);
                        const op = getVolumetricOperation(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleConcept(c.id)}
                            title={`${c.name}: ${c.description}${op ? ` [Efecto 3D: ${op.label}]` : ''}`}
                            className={`flex items-center gap-2 font-mono text-[12.5px] px-3 py-2 rounded-sm border cursor-pointer transition-all ${
                              isActive
                                ? 'bg-diagramaxis-kraft text-diagramaxis-kraftDark font-bold border-diagramaxis-gold shadow-[0_0_12px_rgb(var(--da-kraft)/0.5)] scale-[1.03]'
                                : 'bg-diagramaxis-surface2 text-diagramaxis-textBright border-diagramaxis-border hover:border-diagramaxis-gold hover:bg-diagramaxis-surface3 hover:text-diagramaxis-text'
                            }`}
                          >
                            <Disc className={`w-3.5 h-3.5 ${isActive ? 'text-diagramaxis-kraftDark' : 'text-diagramaxis-gold'}`} />
                            <span>{c.name}</span>
                            {op && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? 'bg-diagramaxis-orange' : 'bg-diagramaxis-gold'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Pestaña de Artefactos */
          <div className="flex flex-wrap gap-2">
            {filteredArtifacts.map((art) => {
              const isActive = activeArtifacts.includes(art.id);
              const op = getVolumetricOperation(art.id);
              return (
                <button
                  key={art.id}
                  onClick={() => toggleArtifact(art.id)}
                  title={`${art.name}: ${art.description}${op ? ` [Efecto 3D: ${op.label}]` : ''}`}
                  className={`flex items-center gap-2 font-mono text-[12.5px] px-3 py-2 rounded-sm border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-diagramaxis-kraft text-diagramaxis-kraftDark font-bold border-diagramaxis-cyan shadow-[0_0_12px_rgb(var(--da-cyan)/0.4)] scale-[1.03]'
                      : 'bg-diagramaxis-surface2 text-diagramaxis-cyanBright border-diagramaxis-cyan/30 hover:border-diagramaxis-cyan hover:bg-diagramaxis-surface3'
                  }`}
                >
                  <Disc className={`w-3.5 h-3.5 ${isActive ? 'text-diagramaxis-kraftDark' : 'text-diagramaxis-cyan'}`} />
                  <span>{art.name}</span>
                  {op && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-diagramaxis-orange' : 'bg-diagramaxis-cyan'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen Inferior de Fichas en Juego */}
      <div className="p-3.5 border-t border-diagramaxis-border bg-diagramaxis-bg flex items-center justify-between text-[11px] font-mono text-diagramaxis-textMuted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-diagramaxis-gold" />
          <span>Fichas con efecto 3D</span>
        </div>
        <span className="text-diagramaxis-gold font-bold text-[12px]">
          {activeConcepts.length + activeArtifacts.length} en el tablero
        </span>
      </div>
    </aside>
  );
};
