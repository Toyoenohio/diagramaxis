import React from 'react';

interface FirmitasSlidersProps {
  conceptId: string;
  custom: Record<string, any>;
  onChange: (key: string, value: number | string | boolean) => void;
}

export const FIRMITAS_LIST = [
  'Antropocéntrico',
  'Antropométrico',
  'Recorrido exterior',
  'Transición',
  'Monolítico',
  'Colosal',
  'Orden',
  'Verticalidad',
  'Elevación',
  'Desfragmentación',
  'Iluminación',
  'Recorrido axial',
  'Espacio interior',
  'Espacio exterior',
  'Perforación',
  'Alineación',
  'Hito',
  'Centro',
  'Retícula',
  'Conectividad',
  'Recorrido',
  'Expansión',
] as const;

export const FirmitasSliders: React.FC<FirmitasSlidersProps> = ({ conceptId, custom, onChange }) => {
  switch (conceptId) {
    case 'Antropocéntrico': {
      const val = typeof custom.proximidadConvergencia === 'number' ? custom.proximidadConvergencia : 0.5;
      return (
        <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-diagramaxis-textMuted">Proximidad / Convergencia focal:</span>
            <span className="font-bold text-diagramaxis-gold">{val.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={val}
            onChange={(e) => onChange('proximidadConvergencia', parseFloat(e.target.value))}
            className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Contrae o abre las caras circundantes orientándolas hacia la escala central del usuario.
          </span>
        </div>
      );
    }

    case 'Antropométrico': {
      const val = typeof custom.escalaModulos === 'number' ? custom.escalaModulos : 3;
      return (
        <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-diagramaxis-textMuted">Escala por módulos (1.80m):</span>
            <span className="font-bold text-diagramaxis-gold">{val} mód. ({(val * 1.8).toFixed(1)}m)</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={val}
            onChange={(e) => onChange('escalaModulos', parseInt(e.target.value, 10))}
            className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Cuantifica las dimensiones del cubo por pasos discretos proporcionales al cuerpo humano.
          </span>
        </div>
      );
    }

    case 'Recorrido exterior': {
      const ancho = typeof custom.anchoCircuito === 'number' ? custom.anchoCircuito : 0.35;
      const angulo = typeof custom.anguloAproximacion === 'number' ? custom.anguloAproximacion : 45;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Ancho de circuito perimetral:</span>
              <span className="font-bold text-diagramaxis-gold">{ancho.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ancho}
              onChange={(e) => onChange('anchoCircuito', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Rotación / Ángulo aproximación:</span>
              <span className="font-bold text-diagramaxis-cyan">{angulo}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={angulo}
              onChange={(e) => onChange('anguloAproximacion', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Proyecta foso y pasarela perimetral orbital alrededor del prisma.
          </span>
        </div>
      );
    }

    case 'Transición': {
      const prof = typeof custom.profundidadUmbral === 'number' ? custom.profundidadUmbral : 0.3;
      const perm = typeof custom.permeabilidad === 'number' ? custom.permeabilidad : 50;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Profundidad de umbral:</span>
              <span className="font-bold text-diagramaxis-gold">{prof.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prof}
              onChange={(e) => onChange('profundidadUmbral', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Gradiente de permeabilidad:</span>
              <span className="font-bold text-diagramaxis-cyan">{perm}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={perm}
              onChange={(e) => onChange('permeabilidad', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Genera un umbral o doble piel semitransparente entre el exterior y el núcleo.
          </span>
        </div>
      );
    }

    case 'Monolítico': {
      const comp = typeof custom.compacidad === 'number' ? custom.compacidad : 100;
      const bisel = typeof custom.bisel === 'number' ? custom.bisel : 0.05;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Compacidad / Soldadura de masa:</span>
              <span className="font-bold text-diagramaxis-gold">{comp}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={comp}
              onChange={(e) => onChange('compacidad', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Redondeo / Bisel pétreo:</span>
              <span className="font-bold text-diagramaxis-cyan">{bisel.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={bisel}
              onChange={(e) => onChange('bisel', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Suprime juntas y divisiones internas forzando un bloque continuo con biselado pétreo.
          </span>
        </div>
      );
    }

    case 'Colosal': {
      const esc = typeof custom.escalaMonumental === 'number' ? custom.escalaMonumental : 4.0;
      return (
        <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-diagramaxis-textMuted">Multiplicador escala monumental:</span>
            <span className="font-bold text-diagramaxis-gold">{esc.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={esc}
            onChange={(e) => onChange('escalaMonumental', parseFloat(e.target.value))}
            className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Incrementa el volumen global exponencialmente manteniendo la base fija al suelo.
          </span>
        </div>
      );
    }

    case 'Orden': {
      const ord = typeof custom.fuerzaSimetria === 'number' ? custom.fuerzaSimetria : 80;
      return (
        <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-diagramaxis-textMuted">Fuerza de simetría / regularización:</span>
            <span className="font-bold text-diagramaxis-gold">{ord}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={ord}
            onChange={(e) => onChange('fuerzaSimetria', parseFloat(e.target.value))}
            className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Corrige desviaciones angulares y atrae proporciones a relaciones armónicas ortogonales.
          </span>
        </div>
      );
    }

    case 'Verticalidad': {
      const esb = typeof custom.esbeltez === 'number' ? custom.esbeltez : 2.5;
      const conic = typeof custom.conicidad === 'number' ? custom.conicidad : 15;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Tensión vertical / Esbeltez:</span>
              <span className="font-bold text-diagramaxis-gold">{esb.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.25"
              value={esb}
              onChange={(e) => onChange('esbeltez', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Conicidad superior / Adelgazamiento:</span>
              <span className="font-bold text-diagramaxis-cyan">{conic}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={conic}
              onChange={(e) => onChange('conicidad', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Estira la cota Y del cubo con afinamiento progresivo en la cúspide.
          </span>
        </div>
      );
    }

    case 'Elevación': {
      const alt = typeof custom.alturaDespegue === 'number' ? custom.alturaDespegue : 2.0;
      const dens = typeof custom.densidadPilotis === 'number' ? custom.densidadPilotis : 4;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Altura de despegue:</span>
              <span className="font-bold text-diagramaxis-gold">{alt.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.25"
              value={alt}
              onChange={(e) => onChange('alturaDespegue', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Densidad de apoyos / Pilotis:</span>
              <span className="font-bold text-diagramaxis-cyan">{dens} columnas</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={dens}
              onChange={(e) => onChange('densidadPilotis', parseInt(e.target.value, 10))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Eleva la base del cubo sobre el nivel del suelo mediante soportes estructurales.
          </span>
        </div>
      );
    }

    case 'Desfragmentación': {
      const disp = typeof custom.dispersion === 'number' ? custom.dispersion : 0.18;
      const subd = typeof custom.subdivision === 'number' ? custom.subdivision : 3;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Grado de dispersión / Explosión:</span>
              <span className="font-bold text-diagramaxis-gold">{Math.round(disp * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={disp}
              onChange={(e) => onChange('dispersion', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Subdivisión de masa (cortes regulares):</span>
              <span className="font-bold text-diagramaxis-cyan">{subd}x{subd}x{subd} ({subd * subd * subd} bloques)</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={subd}
              onChange={(e) => onChange('subdivision', parseInt(e.target.value, 10))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Quiebra el cubo sólido en múltiples prismas articulados separados entre sí (conforme a boceto).
          </span>
        </div>
      );
    }

    case 'Iluminación': {
      const fis = typeof custom.aperturaFisura === 'number' ? custom.aperturaFisura : 25;
      const sol = typeof custom.penetracionSolar === 'number' ? custom.penetracionSolar : 1.2;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Apertura de fisura lumínica:</span>
              <span className="font-bold text-diagramaxis-gold">{fis}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={fis}
              onChange={(e) => onChange('aperturaFisura', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Intensidad de penetración solar:</span>
              <span className="font-bold text-diagramaxis-cyan">{sol.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={sol}
              onChange={(e) => onChange('penetracionSolar', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Genera fisuras de luz cenital con iluminación cálida volumétrica interna.
          </span>
        </div>
      );
    }

    case 'Recorrido axial': {
      const ape = typeof custom.aperturaEje === 'number' ? custom.aperturaEje : 0.4;
      const ori = typeof custom.orientacionEje === 'number' ? custom.orientacionEje : 0;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Apertura del eje longitudinal:</span>
              <span className="font-bold text-diagramaxis-gold">{Math.round(ape * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ape}
              onChange={(e) => onChange('aperturaEje', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Orientación del eje rector:</span>
              <span className="font-bold text-diagramaxis-cyan">{ori}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={ori}
              onChange={(e) => onChange('orientacionEje', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Traza un túnel pasante directo excavado con CSG a lo largo del eje rector.
          </span>
        </div>
      );
    }

    case 'Espacio interior': {
      const esp = typeof custom.espesorMuro === 'number' ? custom.espesorMuro : 0.15;
      const cam = typeof custom.camaraAire === 'number' ? custom.camaraAire : 75;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Espesor de muro / Cáscara:</span>
              <span className="font-bold text-diagramaxis-gold">{esp.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={esp}
              onChange={(e) => onChange('espesorMuro', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Cámara de aire interna:</span>
              <span className="font-bold text-diagramaxis-cyan">{cam}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cam}
              onChange={(e) => onChange('camaraAire', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Vaciado interno (hollowing) dejando únicamente la corteza estructural habitable.
          </span>
        </div>
      );
    }

    case 'Espacio exterior': {
      const rad = typeof custom.radioInfluencia === 'number' ? custom.radioInfluencia : 2.2;
      return (
        <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-diagramaxis-textMuted">Radio de influencia exterior:</span>
            <span className="font-bold text-diagramaxis-gold">{rad.toFixed(1)} u</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.2"
            value={rad}
            onChange={(e) => onChange('radioInfluencia', parseFloat(e.target.value))}
            className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Proyecta plataformas horizontales bajas y podio que extienden el cubo hacia su entorno.
          </span>
        </div>
      );
    }

    case 'Perforación': {
      const rad = typeof custom.radioHoradacion === 'number' ? custom.radioHoradacion : 40;
      const prof = typeof custom.profundidadCorte === 'number' ? custom.profundidadCorte : 1.0;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Radio de horadación:</span>
              <span className="font-bold text-diagramaxis-gold">{rad}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={rad}
              onChange={(e) => onChange('radioHoradacion', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Profundidad de corte:</span>
              <span className="font-bold text-diagramaxis-cyan">{prof >= 0.95 ? 'Pasante total (1.0)' : prof.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prof}
              onChange={(e) => onChange('profundidadCorte', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Horadación o vaciado transversal de cara con profundidad de receso a pasante.
          </span>
        </div>
      );
    }

    case 'Alineación': {
      const snap = typeof custom.rigidezCoplanar === 'number' ? custom.rigidezCoplanar : 85;
      return (
        <div className="flex flex-col gap-2 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-diagramaxis-textMuted">Imantación / Rigidez coplanar:</span>
            <span className="font-bold text-diagramaxis-gold">{snap}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={snap}
            onChange={(e) => onChange('rigidezCoplanar', parseFloat(e.target.value))}
            className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
          />
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Atrae aristas y bloques sueltos para alinearse con el plano límite de referencia.
          </span>
        </div>
      );
    }

    case 'Hito': {
      const rem = typeof custom.prominenciaRemate === 'number' ? custom.prominenciaRemate : 1.5;
      const esc = typeof custom.contrasteEscala === 'number' ? custom.contrasteEscala : 2.0;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Prominencia de remate:</span>
              <span className="font-bold text-diagramaxis-gold">{rem.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={rem}
              onChange={(e) => onChange('prominenciaRemate', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Contraste de escala:</span>
              <span className="font-bold text-diagramaxis-cyan">{esc.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="0.2"
              value={esc}
              onChange={(e) => onChange('contrasteEscala', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Destaca una torre o remate singular por encima del conjunto como hito focal.
          </span>
        </div>
      );
    }

    case 'Centro': {
      const cent = typeof custom.atraccionCentripeta === 'number' ? custom.atraccionCentripeta : 0.6;
      const nuc = typeof custom.radioNucleo === 'number' ? custom.radioNucleo : 0.35;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Atracción centrípeta:</span>
              <span className="font-bold text-diagramaxis-gold">{cent.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={cent}
              onChange={(e) => onChange('atraccionCentripeta', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Radio del núcleo / claustro central:</span>
              <span className="font-bold text-diagramaxis-cyan">{nuc.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={nuc}
              onChange={(e) => onChange('radioNucleo', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Organiza la masa atrayéndola centrípetamente hacia un núcleo o patio claustral.
          </span>
        </div>
      );
    }

    case 'Retícula': {
      const sub = typeof custom.densidadSubdivisiones === 'number' ? custom.densidadSubdivisiones : 4;
      const gro = typeof custom.grosorPerfil === 'number' ? custom.grosorPerfil : 0.04;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Densidad de subdivisiones:</span>
              <span className="font-bold text-diagramaxis-gold">{sub}x{sub}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sub}
              onChange={(e) => onChange('densidadSubdivisiones', parseInt(e.target.value, 10))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Grosor del perfil modular:</span>
              <span className="font-bold text-diagramaxis-cyan">{gro.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={gro}
              onChange={(e) => onChange('grosorPerfil', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Proyecta una trama de modulación modular tridimensional sobre las caras del prisma.
          </span>
        </div>
      );
    }

    case 'Conectividad': {
      const con = typeof custom.numeroPuentes === 'number' ? custom.numeroPuentes : 2;
      const gro = typeof custom.grosorConector === 'number' ? custom.grosorConector : 0.25;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Número de enlaces / puentes:</span>
              <span className="font-bold text-diagramaxis-gold">{con} puentes</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={con}
              onChange={(e) => onChange('numeroPuentes', parseInt(e.target.value, 10))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Grosor de sección de conector:</span>
              <span className="font-bold text-diagramaxis-cyan">{gro.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={gro}
              onChange={(e) => onChange('grosorConector', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Genera pasarelas, puentes o ductos de articulación física entre caras y sub-bloques.
          </span>
        </div>
      );
    }

    case 'Recorrido': {
      const vuel = typeof custom.vueltasRampa === 'number' ? custom.vueltasRampa : 1.25;
      const anch = typeof custom.anchoBanda === 'number' ? custom.anchoBanda : 0.3;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Pendiente / Vueltas de la rampa:</span>
              <span className="font-bold text-diagramaxis-gold">{vuel.toFixed(2)} rot.</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={vuel}
              onChange={(e) => onChange('vueltasRampa', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Ancho de la banda de circulación:</span>
              <span className="font-bold text-diagramaxis-cyan">{anch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={anch}
              onChange={(e) => onChange('anchoBanda', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Genera una rampa helicoidal continua que asciende rodeando el volumen hasta la cúspide.
          </span>
        </div>
      );
    }

    case 'Expansión': {
      const lon = typeof custom.longitudProyeccion === 'number' ? custom.longitudProyeccion : 0.6;
      const ang = typeof custom.anguloFlare === 'number' ? custom.anguloFlare : 12;
      return (
        <div className="flex flex-col gap-2.5 bg-diagramaxis-bg p-2.5 rounded-xs border border-diagramaxis-border">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Longitud de proyección horizontal:</span>
              <span className="font-bold text-diagramaxis-gold">{lon.toFixed(1)}x ancho</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={lon}
              onChange={(e) => onChange('longitudProyeccion', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-gold cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10.5px]">
              <span className="text-diagramaxis-textMuted">Ángulo de apertura / flare:</span>
              <span className="font-bold text-diagramaxis-cyan">{ang}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={ang}
              onChange={(e) => onChange('anguloFlare', parseFloat(e.target.value))}
              className="w-full h-1.5 accent-diagramaxis-cyan cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-diagramaxis-textDim">
            Proyección telescópica o terrazas voladizas hacia los laterales abriendo el cubo al entorno.
          </span>
        </div>
      );
    }

    default:
      return null;
  }
};
