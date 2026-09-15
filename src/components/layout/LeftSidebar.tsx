import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { CONCEPTS_DATA } from '../../data/architecturalMenu';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { Search, ChevronDown, ChevronRight, Disc, Layers, Sparkles } from 'lucide-react';

const SUB_PILL_INFO: Record<string, { label: string; desc: string; color: string }> = {
  'Todos': {
    label: 'Todos',
    desc: 'Los 54 conceptos ordenadores del proyecto',
    color: 'rgb(var(--da-gold))',
  },
  'Firmitas': {
    label: 'Firmitas',
    desc: 'Tectónica, gravedad, solidez y estructura',
    color: 'rgb(var(--da-gold))',
  },
  'Venustas': {
    label: 'Venustas',
    desc: 'Forma, estética, proporción, luz y balance',
    color: 'rgb(var(--da-cyan))',
  },
  'Utilitas': {
    label: 'Utilitas',
    desc: 'Función, uso, programa y habitabilidad',
    color: 'rgb(var(--da-orange))',
  },
};

export const LeftSidebar: React.FC = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const { activeConcepts, toggleConcept } = useProjectStore();

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Filtrado exclusivo de Temas Arquitectónicos
  const filteredConcepts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let concepts = CONCEPTS_DATA.filter((c) => c.category === 'Temas Arquitectónicos');

    if (selectedSubcategory !== 'Todos') {
      concepts = concepts.filter((c) => c.subcategory === selectedSubcategory);
    }

    if (!q) return concepts;

    return concepts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subcategory.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [selectedSubcategory, searchQuery]);

  // Agrupado por subcategorías (Firmitas, Venustas, Utilitas)
  const subcategoryGroups = useMemo(() => {
    const map: Record<string, typeof CONCEPTS_DATA> = {};
    filteredConcepts.forEach((c) => {
      if (!map[c.subcategory]) map[c.subcategory] = [];
      map[c.subcategory].push(c);
    });
    return map;
  }, [filteredConcepts]);

  const totalTemas = CONCEPTS_DATA.filter((c) => c.category === 'Temas Arquitectónicos').length;

  return (
    <aside className="w-[340px] min-w-[340px] h-full bg-diagramaxis-surface border-r border-diagramaxis-border flex flex-col z-20 select-none text-diagramaxis-text">
      {/* Cabecera Principal de la Bandeja */}
      <div className="p-3 bg-diagramaxis-bg border-b border-diagramaxis-border flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-diagramaxis-gold" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-diagramaxis-gold font-bold">
              Bandeja de Fichas: Temas
            </span>
          </div>
          <span className="font-mono text-[10.5px] px-2 py-0.5 bg-diagramaxis-surface2 text-diagramaxis-gold border border-diagramaxis-gold/30 rounded-xs font-semibold">
            {totalTemas} fichas
          </span>
        </div>

        <p className="font-mono text-[10px] text-diagramaxis-textMuted px-1 leading-snug">
          Cuestiones clave y operaciones rectoras del proyecto (Tríada Vitruviana).
        </p>

        {/* Pestañas de Filtro Tríada Vitruviana */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {(['Todos', 'Firmitas', 'Venustas', 'Utilitas'] as const).map((tab) => {
            const isSelected = selectedSubcategory === tab;
            const count =
              tab === 'Todos'
                ? totalTemas
                : CONCEPTS_DATA.filter(
                    (c) => c.category === 'Temas Arquitectónicos' && c.subcategory === tab
                  ).length;
            return (
              <button
                key={tab}
                onClick={() => setSelectedSubcategory(tab)}
                title={SUB_PILL_INFO[tab]?.desc}
                className={`py-1.5 px-1 rounded-xs border text-center font-mono text-[10px] uppercase tracking-wider transition-all relative ${
                  isSelected
                    ? 'bg-diagramaxis-surface2 border-diagramaxis-gold text-diagramaxis-gold font-bold shadow-xs'
                    : 'bg-diagramaxis-surface border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text'
                }`}
              >
                <span>{tab}</span>
                <span className="text-[8.5px] opacity-70 ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Resumen pedagógico del filtro activo */}
        <div className="text-[9.5px] font-mono px-1.5 py-1 text-diagramaxis-textMuted bg-diagramaxis-surface2/60 rounded-xs border border-diagramaxis-border/60">
          <span className="font-bold text-diagramaxis-gold">{SUB_PILL_INFO[selectedSubcategory]?.label}: </span>
          <span>{SUB_PILL_INFO[selectedSubcategory]?.desc}</span>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="p-3 border-b border-diagramaxis-border bg-diagramaxis-surface">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-diagramaxis-textDim absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ficha por nombre o concepto..."
            className="w-full pl-9 pr-3 py-2 bg-diagramaxis-surface2 border border-diagramaxis-border focus:border-diagramaxis-gold rounded-xs font-mono text-[12px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
          />
        </div>
      </div>

      {/* Listado de Fichas Arquitectónicas Mejoradas */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 custom-scrollbar">
        {Object.keys(subcategoryGroups).length === 0 ? (
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
                  <div className="flex flex-col gap-2.5 pt-0.5">
                    {concepts.map((c) => {
                      const isActive = activeConcepts.includes(c.id);
                      const op = getVolumetricOperation(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleConcept(c.id)}
                          className={`p-3 rounded-sm border cursor-pointer transition-all flex flex-col gap-1.5 select-none ${
                            isActive
                              ? 'bg-diagramaxis-surface2 border-diagramaxis-gold shadow-[0_0_14px_rgb(var(--da-gold)/0.25)] ring-1 ring-diagramaxis-gold'
                              : 'bg-diagramaxis-surface2/60 border-diagramaxis-border hover:border-diagramaxis-gold/70 hover:bg-diagramaxis-surface3'
                          }`}
                        >
                          {/* Header de la Ficha */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Disc
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-diagramaxis-gold' : 'text-diagramaxis-textDim'
                                }`}
                              />
                              <span className="font-serif italic font-bold text-[15px] text-diagramaxis-text truncate">
                                {c.name}
                              </span>
                            </div>
                            <span
                              className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-xs border font-semibold shrink-0 uppercase ${
                                c.subcategory === 'Firmitas'
                                  ? 'border-diagramaxis-gold/50 text-diagramaxis-gold bg-diagramaxis-gold/10'
                                  : c.subcategory === 'Venustas'
                                  ? 'border-diagramaxis-cyan/50 text-diagramaxis-cyan bg-diagramaxis-cyan/10'
                                  : 'border-diagramaxis-orange/50 text-diagramaxis-orange bg-diagramaxis-orange/10'
                              }`}
                            >
                              {c.subcategory}
                            </span>
                          </div>

                          {/* Badges de Naturalezas */}
                          <div className="flex items-center gap-1">
                            {(c.natures || ['G']).map((nat) => (
                              <span
                                key={nat}
                                className="text-[8px] font-mono px-1 py-0.5 rounded-xs border border-diagramaxis-border bg-diagramaxis-bg text-diagramaxis-textMuted font-bold"
                              >
                                {nat === 'G'
                                  ? 'G · Generador'
                                  : nat === 'R'
                                  ? 'R · Relacional'
                                  : 'Co · Condicionante'}
                              </span>
                            ))}
                          </div>

                          {/* Definición Arquitectónica */}
                          <p className="font-mono text-[11px] text-diagramaxis-textBright leading-snug">
                            {c.description}
                          </p>

                          {/* Operación 3D y Botón de Estado */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-diagramaxis-border/60 text-[10px] font-mono">
                            {op ? (
                              <span className="flex items-center gap-1 text-diagramaxis-gold font-semibold truncate max-w-[190px]">
                                <Sparkles className="w-3 h-3 shrink-0 text-diagramaxis-gold" />
                                <span className="truncate">{op.label}</span>
                              </span>
                            ) : (
                              <span className="text-diagramaxis-textDim text-[9.5px]">
                                Vínculo de orden
                              </span>
                            )}

                            <span
                              className={`px-2 py-0.5 rounded-xs font-bold text-[10px] transition-colors ${
                                isActive
                                  ? 'bg-diagramaxis-gold text-diagramaxis-bg'
                                  : 'text-diagramaxis-textDim hover:text-diagramaxis-gold'
                              }`}
                            >
                              {isActive ? '✓ En Tablero' : '+ Añadir'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Resumen Inferior de Fichas en Juego */}
      <div className="p-3.5 border-t border-diagramaxis-border bg-diagramaxis-bg flex items-center justify-between text-[11px] font-mono text-diagramaxis-textMuted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-diagramaxis-gold" />
          <span>Fichas Temáticas</span>
        </div>
        <span className="text-diagramaxis-gold font-bold text-[12px]">
          {activeConcepts.length} en el tablero
        </span>
      </div>
    </aside>
  );
};
