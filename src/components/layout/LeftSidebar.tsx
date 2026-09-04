import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { CONCEPTS_DATA, ARTIFACTS_DATA } from '../../data/architecturalMenu';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { Search, ChevronDown, ChevronRight, Disc, Layers } from 'lucide-react';

const DECK_INFO = {
  'Temas Arquitectónicos': {
    subtitle: 'Cuestiones clave que abren el proyecto.',
    icon: '⬢',
    color: '#e5a93b',
  },
  'Componentes de la Realidad': {
    subtitle: 'Elementos, actores y condiciones del contexto.',
    icon: '◎',
    color: '#06b6d4',
  },
  'Relaciones Paralógicas': {
    subtitle: 'Conexiones inesperadas que expanden las posibilidades.',
    icon: '⬡',
    color: '#ea580c',
  },
  'Artefactos': {
    subtitle: 'Elementos del lenguaje proyectual.',
    icon: '◼',
    color: '#c8af88',
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
    <aside className="w-[330px] min-w-[330px] h-full bg-[#17181d] border-r border-[#2e323c] flex flex-col z-20 select-none text-[#f8fafc]">
      {/* Selector de los 4 Mazos Circulares de la Caja DIAGRAMAXIS */}
      <div className="p-3 bg-[#0f1013] border-b border-[#2e323c] flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#e5a93b] font-bold">
            Bandeja de Fichas (4 Mazos)
          </span>
          <Layers className="w-3.5 h-3.5 text-[#e5a93b]" />
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
                    ? 'bg-[#1f2128] border-[#e5a93b] shadow-[0_0_12px_rgba(229,169,59,0.25)]'
                    : 'bg-[#17181d] border-[#2e323c] hover:border-[#434855]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider font-bold ${
                      isSelected ? 'text-[#e5a93b]' : 'text-[#94a3b8]'
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
                <span className="font-mono text-[8.5px] text-[#64748b] leading-tight line-clamp-1">
                  {info.subtitle}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e5a93b]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabecera del Mazo Seleccionado */}
      <div className="px-4 py-3 bg-[#1f2128] border-b border-[#2e323c] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic font-bold text-[17px] text-[#f8fafc]">
            {activeDeck}
          </h3>
          <span className="font-mono text-[10.5px] px-2 py-0.5 bg-[#0f1013] text-[#e5a93b] border border-[#e5a93b]/30 rounded-xs font-semibold">
            {activeDeck === 'Artefactos' ? ARTIFACTS_DATA.length : CONCEPTS_DATA.filter(c => c.category === activeDeck).length} fichas
          </span>
        </div>
        <p className="font-mono text-[10px] text-[#94a3b8]">
          {DECK_INFO[activeDeck as keyof typeof DECK_INFO]?.subtitle}
        </p>
      </div>

      {/* Barra de Búsqueda */}
      <div className="p-3 border-b border-[#2e323c] bg-[#17181d]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en ${activeDeck}...`}
            className="w-full pl-9 pr-3 py-2 bg-[#1f2128] border border-[#2e323c] focus:border-[#e5a93b] rounded-xs font-mono text-[13px] text-[#f8fafc] outline-none placeholder:text-[#64748b] transition-colors"
          />
        </div>
      </div>

      {/* Fichas de Madera Grabada con Scroll */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4 custom-scrollbar">
        {activeDeck !== 'Artefactos' ? (
          Object.keys(subcategoryGroups).length === 0 ? (
            <div className="p-6 text-center font-mono text-[12px] text-[#64748b]">
              No se encontraron fichas para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            Object.entries(subcategoryGroups).map(([subcategory, concepts]) => {
              const isCollapsed = collapsedCategories[subcategory];
              return (
                <div key={subcategory} className="flex flex-col gap-2">
                  <div
                    onClick={() => toggleCategoryCollapse(subcategory)}
                    className="flex items-center justify-between py-2 px-2.5 bg-[#1f2128] hover:bg-[#2a2d36] rounded-xs cursor-pointer border border-[#2e323c] transition-colors"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#e5a93b] font-bold">
                      {subcategory} ({concepts.length})
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-[#64748b]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#e5a93b]" />
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
                                ? 'bg-[#c8af88] text-[#2c2419] font-bold border-[#e5a93b] shadow-[0_0_12px_rgba(200,175,136,0.5)] scale-[1.03]'
                                : 'bg-[#1f2128] text-[#cbd5e1] border-[#2e323c] hover:border-[#e5a93b] hover:bg-[#2a2d36] hover:text-[#f8fafc]'
                            }`}
                          >
                            <Disc className={`w-3.5 h-3.5 ${isActive ? 'text-[#2c2419]' : 'text-[#e5a93b]'}`} />
                            <span>{c.name}</span>
                            {op && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? 'bg-[#ea580c]' : 'bg-[#e5a93b]'
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
                      ? 'bg-[#c8af88] text-[#2c2419] font-bold border-[#06b6d4] shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-[1.03]'
                      : 'bg-[#1f2128] text-[#38bdf8] border-[#06b6d4]/30 hover:border-[#06b6d4] hover:bg-[#2a2d36]'
                  }`}
                >
                  <Disc className={`w-3.5 h-3.5 ${isActive ? 'text-[#2c2419]' : 'text-[#06b6d4]'}`} />
                  <span>{art.name}</span>
                  {op && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-[#ea580c]' : 'bg-[#06b6d4]'
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
      <div className="p-3.5 border-t border-[#2e323c] bg-[#0f1013] flex items-center justify-between text-[11px] font-mono text-[#94a3b8]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93b]" />
          <span>Fichas con efecto 3D</span>
        </div>
        <span className="text-[#e5a93b] font-bold text-[12px]">
          {activeConcepts.length + activeArtifacts.length} en el tablero
        </span>
      </div>
    </aside>
  );
};
