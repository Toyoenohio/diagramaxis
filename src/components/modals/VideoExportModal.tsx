import React, { useState, useMemo } from 'react';
import { X, Video, Clock } from 'lucide-react';
import {
  VideoExportConfig,
  DEFAULT_VIDEO_CONFIG,
  estimateDuration,
  checkBrowserSupport,
} from '../../utils/videoExporter';

interface VideoExportModalProps {
  isOpen: boolean;
  conceptCount: number;
  onClose: () => void;
  onExport: (config: VideoExportConfig) => void;
}

const RESOLUTION_OPTIONS = [
  { label: '720p (1280×720)', width: 1280, height: 720 },
  { label: '1080p (1920×1080)', width: 1920, height: 1080 },
  { label: '1440p (2560×1440)', width: 2560, height: 1440 },
];

const FPS_OPTIONS = [24, 30, 60];

const DURATION_OPTIONS = [
  { label: '1s', frames30: 30 },
  { label: '1.5s', frames30: 45 },
  { label: '2s', frames30: 60 },
  { label: '3s', frames30: 90 },
];

const CAMERA_OPTIONS: { label: string; value: 'ext' | 'iso' | 'alz' }[] = [
  { label: 'Perspectiva', value: 'ext' },
  { label: 'Axonometría', value: 'iso' },
  { label: 'Alzado', value: 'alz' },
];

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  conceptCount,
  onClose,
  onExport,
}) => {
  const [resIndex, setResIndex] = useState(1); // 1080p default
  const [fps, setFps] = useState(30);
  const [durationIndex, setDurationIndex] = useState(1); // 1.5s default
  const [cameraMode, setCameraMode] = useState<'ext' | 'iso' | 'alz'>('ext');
  const [includeOutro, setIncludeOutro] = useState(true);

  const browserSupport = useMemo(() => checkBrowserSupport(), []);

  const config: VideoExportConfig = useMemo(() => {
    const res = RESOLUTION_OPTIONS[resIndex];
    const baseFPC = DURATION_OPTIONS[durationIndex].frames30;
    // Escalar framesPerConcept proporcionalmente al FPS
    const framesPerConcept = Math.round(baseFPC * (fps / 30));
    return {
      ...DEFAULT_VIDEO_CONFIG,
      fps,
      framesPerConcept,
      framesIntro: Math.round(30 * (fps / 30)),
      framesOutro: Math.round(60 * (fps / 30)),
      resolution: { width: res.width, height: res.height },
      cameraMode,
      includeOutroTurntable: includeOutro,
    };
  }, [resIndex, fps, durationIndex, cameraMode, includeOutro]);

  const duration = useMemo(
    () => estimateDuration(config, conceptCount),
    [config, conceptCount]
  );

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(config);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-diagramaxis-surface border border-diagramaxis-border rounded-sm shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-diagramaxis-border">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-diagramaxis-gold" />
            <h2 className="font-mono text-sm font-bold text-diagramaxis-text uppercase tracking-wider">
              Exportar Video de Transición
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-diagramaxis-textMuted hover:text-diagramaxis-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {!browserSupport.supported && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xs px-3 py-2">
              <p className="font-mono text-[11px] text-red-400">
                ⚠ {browserSupport.reason}
              </p>
            </div>
          )}

          {/* Resolución */}
          <div>
            <label className="block font-mono text-[10px] text-diagramaxis-textMuted uppercase tracking-widest mb-1.5">
              Resolución
            </label>
            <div className="flex gap-1.5">
              {RESOLUTION_OPTIONS.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setResIndex(idx)}
                  className={`flex-1 px-2 py-1.5 font-mono text-[10.5px] rounded-xs border transition-all ${
                    resIndex === idx
                      ? 'bg-diagramaxis-gold text-diagramaxis-bg border-diagramaxis-gold font-bold'
                      : 'border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text hover:border-diagramaxis-text/30'
                  }`}
                >
                  {opt.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* FPS */}
          <div>
            <label className="block font-mono text-[10px] text-diagramaxis-textMuted uppercase tracking-widest mb-1.5">
              Frames por segundo (FPS)
            </label>
            <div className="flex gap-1.5">
              {FPS_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  className={`flex-1 px-2 py-1.5 font-mono text-[10.5px] rounded-xs border transition-all ${
                    fps === f
                      ? 'bg-diagramaxis-gold text-diagramaxis-bg border-diagramaxis-gold font-bold'
                      : 'border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text hover:border-diagramaxis-text/30'
                  }`}
                >
                  {f} fps
                </button>
              ))}
            </div>
          </div>

          {/* Duración por concepto */}
          <div>
            <label className="block font-mono text-[10px] text-diagramaxis-textMuted uppercase tracking-widest mb-1.5">
              Duración por concepto
            </label>
            <div className="flex gap-1.5">
              {DURATION_OPTIONS.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setDurationIndex(idx)}
                  className={`flex-1 px-2 py-1.5 font-mono text-[10.5px] rounded-xs border transition-all ${
                    durationIndex === idx
                      ? 'bg-diagramaxis-gold text-diagramaxis-bg border-diagramaxis-gold font-bold'
                      : 'border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text hover:border-diagramaxis-text/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cámara */}
          <div>
            <label className="block font-mono text-[10px] text-diagramaxis-textMuted uppercase tracking-widest mb-1.5">
              Vista de cámara
            </label>
            <div className="flex gap-1.5">
              {CAMERA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCameraMode(opt.value)}
                  className={`flex-1 px-2 py-1.5 font-mono text-[10.5px] rounded-xs border transition-all ${
                    cameraMode === opt.value
                      ? 'bg-diagramaxis-gold text-diagramaxis-bg border-diagramaxis-gold font-bold'
                      : 'border-diagramaxis-border text-diagramaxis-textMuted hover:text-diagramaxis-text hover:border-diagramaxis-text/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Turntable outro */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeOutro}
              onChange={(e) => setIncludeOutro(e.target.checked)}
              className="w-3.5 h-3.5 accent-[rgb(var(--da-gold))]"
            />
            <span className="font-mono text-[11px] text-diagramaxis-text">
              Incluir turntable final (360° del resultado)
            </span>
          </label>

          {/* Duración estimada */}
          <div className="flex items-center gap-2 bg-diagramaxis-bg/60 border border-diagramaxis-border rounded-xs px-3 py-2.5">
            <Clock className="w-4 h-4 text-diagramaxis-gold flex-shrink-0" />
            <div className="font-mono text-[11px]">
              <span className="text-diagramaxis-textMuted">Duración estimada: </span>
              <span className="text-diagramaxis-gold font-bold">{duration.toFixed(1)}s</span>
              <span className="text-diagramaxis-textMuted">
                {' '}({conceptCount} concepto{conceptCount !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-diagramaxis-border">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-[11px] text-diagramaxis-textMuted hover:text-diagramaxis-text border border-diagramaxis-border rounded-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={!browserSupport.supported || conceptCount === 0}
            className="px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider bg-diagramaxis-gold text-diagramaxis-bg rounded-xs hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgb(var(--da-gold)/0.25)]"
          >
            🎬 Exportar Video
          </button>
        </div>
      </div>
    </div>
  );
};
