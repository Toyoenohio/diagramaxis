import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { AISettings } from '../../types';
import { X, Key, ShieldCheck } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setModalOpen, aiSettings, setAiSettings } = useProjectStore();

  // B9 auditoría: re-sembrar al abrir con la configuración ACTUAL del store
  // (incluida la restaurada desde LocalStorage al arrancar).
  const [provider, setProvider] = useState<AISettings['provider']>(aiSettings.provider || 'cloudflare');
  const [apiKey, setApiKey] = useState<string>(aiSettings.apiKey || '');

  const prevOpenRef = useRef(isSettingsModalOpen);
  useEffect(() => {
    if (isSettingsModalOpen && !prevOpenRef.current) {
      const st = useProjectStore.getState();
      setProvider(st.aiSettings.provider || 'cloudflare');
      setApiKey(st.aiSettings.apiKey || '');
    }
    prevOpenRef.current = isSettingsModalOpen;
  }, [isSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAiSettings({
      provider,
      apiKey: apiKey.trim(),
    });
    setModalOpen('settings', false);
  };

  return (
    <div className="fixed inset-0 bg-diagramaxis-overlay/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-diagramaxis-evalDeep border border-diagramaxis-evalBorder w-full max-w-[460px] rounded-sm shadow-2xl p-6 flex flex-col gap-4 select-none text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-diagramaxis-warn font-semibold">
              Configuración del Sistema
            </span>
            <h2 className="font-serif font-bold text-[22px] text-diagramaxis-text">
              Ajustes de Inteligencia Artificial (BYOK)
            </h2>
          </div>
          <button
            onClick={() => setModalOpen('settings', false)}
            className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          {/* Proveedor de IA */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
              Proveedor de IA para Discurso y Referencias
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full p-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-mono text-[11px] text-diagramaxis-text outline-none"
            >
              <option value="cloudflare">Cloudflare Workers AI / Pages Functions (Servidor)</option>
              <option value="gemini">Google Gemini (API Key Directa)</option>
              <option value="anthropic">Anthropic Claude (API Key Directa)</option>
              <option value="openai">OpenAI GPT-4o (API Key Directa)</option>
              <option value="local">Motor Heurístico Local Offline (Sin API Key)</option>
            </select>
          </div>

          {/* Input API Key */}
          {provider !== 'local' && provider !== 'cloudflare' && (
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-diagramaxis-textMuted font-semibold">
                Clave de API Personal (BYOK)
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-diagramaxis-textDim absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Ingresa tu ${provider.toUpperCase()} API Key...`}
                  className="w-full pl-9 pr-3 py-2.5 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder focus:border-diagramaxis-success rounded-xs font-mono text-[11px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim"
                />
              </div>
              <span className="font-mono text-[9px] text-diagramaxis-textDim">
                Tu clave se guarda exclusivamente en tu navegador (LocalStorage) y nunca se almacena en bases de datos.
              </span>
            </div>
          )}

          <div className="p-3 bg-diagramaxis-evalBg border border-diagramaxis-evalBorder rounded-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-diagramaxis-success shrink-0 mt-0.5" />
            <p className="font-mono text-[9.5px] text-diagramaxis-textBright leading-relaxed">
              En despliegues de Cloudflare Pages, si no configuras una clave personal, las funciones serverless pueden emplear las variables de entorno configuradas por tu institución o el motor heurístico local.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen('settings', false)}
              className="flex-1 py-2.5 bg-diagramaxis-evalBg hover:bg-diagramaxis-evalHover text-diagramaxis-textBright font-mono text-[11px] uppercase tracking-wider rounded-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-diagramaxis-success hover:bg-diagramaxis-successHover text-diagramaxis-successInk font-mono text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors shadow-[0_0_10px_rgb(var(--da-success)/0.25)]"
            >
              Guardar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
