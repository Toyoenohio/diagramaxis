import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { CONCEPTS_DATA } from '../../data/architecturalMenu';
import { getVolumetricOperation } from '../../data/volumetricOperations';
import { Search, X, Check, Plus, GripVertical } from 'lucide-react';

type Category = 'Temas Arquitectónicos' | 'Relaciones Paralógicas';

const SUB_DESC: Record<string, string> = {
  Todos: 'Todos los conceptos de esta categoría',
  Firmitas: 'Tectónica, gravedad, solidez y estructura',
  Venustas: 'Forma, estética, proporción, luz y balance',
  Utilitas: 'Función, uso, programa y habitabilidad',
  'Topológicas': 'Proximidad, inclusión, contigüidad y vecindad',
  'Cronológicas': 'Secuencias temporales, ritmos y permanencia',
  Proyectivas: 'Perspectivas, líneas de fuga y orientaciones',
  'Euclidianas/No euclidianas': 'Geometrías ortogonales, curvas y deformaciones',
};

/** Color de acento por subcategoría (token CSS) */
const subColor = (sub: string): string => {
  if (sub === 'Venustas' || sub === 'Topológicas' || sub === 'Euclidianas/No euclidianas') return 'var(--da-cyan)';
  if (sub === 'Utilitas' || sub === 'Cronológicas') return 'var(--da-orange)';
  return 'var(--da-gold)';
};

interface LeftSidebarProps {
  onClose?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('Temas Arquitectónicos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const { activeConcepts, toggleConcept } = useProjectStore();

  const availableSubcategories = useMemo(
    () =>
      activeCategory === 'Temas Arquitectónicos'
        ? ['Todos', 'Firmitas', 'Venustas', 'Utilitas']
        : ['Todos', 'Topológicas', 'Cronológicas', 'Proyectivas', 'Euclidianas/No euclidianas'],
    [activeCategory]
  );

  const handleSelectCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedSubcategory('Todos');
  };

  const filteredConcepts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let concepts = CONCEPTS_DATA.filter((c) => c.category === activeCategory);
    if (selectedSubcategory !== 'Todos') concepts = concepts.filter((c) => c.subcategory === selectedSubcategory);
    if (!q) return concepts;
    return concepts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subcategory.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [activeCategory, selectedSubcategory, searchQuery]);

  const groups = useMemo(() => {
    const map: Record<string, typeof CONCEPTS_DATA> = {};
    filteredConcepts.forEach((c) => {
      if (!map[c.subcategory]) map[c.subcategory] = [];
      map[c.subcategory].push(c);
    });
    return map;
  }, [filteredConcepts]);

  return (
    <aside className="w-full h-full flex flex-col select-none text-diagramaxis-text">
      {/* Cabecera */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3 border-b border-diagramaxis-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold">Biblioteca</h2>
            <p className="text-[12px] text-diagramaxis-textDim">Arrastra una ficha sobre un volumen 3D</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Cerrar"
              className="w-7 h-7 flex items-center justify-center rounded-md text-diagramaxis-textDim hover:text-diagramaxis-text hover:bg-diagramaxis-surface2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categoría */}
        <div className="grid grid-cols-2 p-0.5 rounded-lg bg-diagramaxis-surface2">
          {(['Temas Arquitectónicos', 'Relaciones Paralógicas'] as Category[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className={`h-7 rounded-md text-[12.5px] font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-diagramaxis-surface text-diagramaxis-text shadow-sm'
                  : 'text-diagramaxis-textMuted hover:text-diagramaxis-text'
              }`}
            >
              {cat === 'Temas Arquitectónicos' ? 'Temas' : 'Paralógicas'}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-diagramaxis-textDim absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar fichas…"
            className="w-full h-8 pl-8 pr-3 bg-diagramaxis-surface border border-diagramaxis-border focus:border-diagramaxis-gold rounded-md text-[13px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
          />
        </div>

        {/* Subcategorías */}
        <div className="flex flex-wrap gap-1.5">
          {availableSubcategories.map((tab) => {
            const isSelected = selectedSubcategory === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedSubcategory(tab)}
                title={SUB_DESC[tab]}
                className={`flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11.5px] font-medium border transition-colors ${
                  isSelected
                    ? 'border-diagramaxis-text bg-diagramaxis-text text-diagramaxis-bg'
                    : 'border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text hover:border-diagramaxis-borderLight'
                }`}
              >
                {tab !== 'Todos' && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${subColor(tab)})` }} />
                )}
                {tab === 'Euclidianas/No euclidianas' ? 'Euclidianas' : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4 custom-scrollbar">
        {Object.keys(groups).length === 0 ? (
          <div className="p-6 text-center text-[13px] text-diagramaxis-textDim">
            Sin resultados para “{searchQuery}”.
          </div>
        ) : (
          Object.entries(groups).map(([subcategory, concepts]) => (
            <section key={subcategory} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-1.5 pb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${subColor(subcategory)})` }} />
                <span className="text-[11.5px] font-semibold text-diagramaxis-textMuted">{subcategory}</span>
                <span className="text-[11px] text-diagramaxis-textDim">{concepts.length}</span>
              </div>

              {concepts.map((c) => {
                const isActive = activeConcepts.includes(c.id);
                const op = getVolumetricOperation(c.id);
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'concept', id: c.id, name: c.name }));
                      e.dataTransfer.setData('text/plain', c.id);
                      e.dataTransfer.effectAllowed = 'copyMove';
                    }}
                    onClick={() => toggleConcept(c.id)}
                    title="Clic para añadir al tablero · arrastra sobre un volumen 3D para aplicarlo"
                    className={`group relative flex gap-2 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                      isActive
                        ? 'border-diagramaxis-gold/40 bg-diagramaxis-gold/[0.05]'
                        : 'border-transparent hover:border-diagramaxis-border hover:bg-diagramaxis-surface2'
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 mt-0.5 shrink-0 text-diagramaxis-textDim opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13.5px] font-medium text-diagramaxis-text truncate">{c.name}</span>
                        <span
                          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-colors ${
                            isActive
                              ? 'bg-diagramaxis-gold text-white'
                              : 'text-diagramaxis-textDim opacity-0 group-hover:opacity-100 bg-diagramaxis-surface border border-diagramaxis-border'
                          }`}
                        >
                          {isActive ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <Plus className="w-3 h-3" strokeWidth={2.5} />}
                        </span>
                      </div>
                      <p className="text-[12px] text-diagramaxis-textMuted leading-snug line-clamp-2">{c.description}</p>
                      {op && <span className="text-[11px] text-diagramaxis-textDim pt-0.5 truncate">↳ {op.label}</span>}
                    </div>
                  </div>
                );
              })}
            </section>
          ))
        )}
      </div>

      {/* Pie */}
      <div className="px-4 py-2.5 border-t border-diagramaxis-border flex items-center justify-between text-[12px] text-diagramaxis-textMuted">
        <span>{filteredConcepts.length} fichas</span>
        <span>
          <span className="font-semibold text-diagramaxis-text tabular-nums">{activeConcepts.length}</span> en el tablero
        </span>
      </div>
    </aside>
  );
};
