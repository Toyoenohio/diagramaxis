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
      <div className="bg-diagramaxis-surface border border-diagramaxis-border w-full max-w-[460px] p-6 flex flex-col gap-4 select-none text-diagramaxis-text">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-wider text-diagramaxis-gold font-semibold">
              Configuración del Sistema
            </span>
            <h2 className="font-serif font-bold text-[22px] text-diagramaxis-text mt-0.5">
              Ajustes de Inteligencia Artificial (BYOK)
            </h2>
          </div>
          <button
            onClick={() => setModalOpen('settings', false)}
            className="text-diagramaxis-textMuted hover:text-diagramaxis-text p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          {/* Proveedor de IA */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[13px] font-semibold text-diagramaxis-textSecondary">
              Proveedor de IA para Discurso y Referencias
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full p-2.5 bg-diagramaxis-bg border border-diagramaxis-border focus:border-diagramaxis-gold font-sans text-[13px] text-diagramaxis-text outline-none transition-colors"
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
              <label className="font-sans text-[13px] font-semibold text-diagramaxis-textSecondary">
                Clave de API Personal (BYOK)
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-diagramaxis-textDim absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Ingresa tu ${provider.toUpperCase()} API Key...`}
                  className="w-full pl-9 pr-3 py-2.5 bg-diagramaxis-bg border border-diagramaxis-border focus:border-diagramaxis-gold font-mono text-[12px] text-diagramaxis-text outline-none placeholder:text-diagramaxis-textDim transition-colors"
                />
              </div>
              <span className="font-sans text-[12px] text-diagramaxis-textDim">
                Tu clave se guarda exclusivamente en tu navegador (LocalStorage) y nunca se almacena en bases de datos.
              </span>
            </div>
          )}

          <div className="p-3 bg-diagramaxis-surface2 border border-diagramaxis-border flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-diagramaxis-gold shrink-0 mt-0.5" />
            <p className="font-sans text-[12px] text-diagramaxis-textSecondary leading-relaxed">
              En despliegues de Cloudflare Pages, si no configuras una clave personal, las funciones serverless pueden emplear las variables de entorno configuradas por tu institución o el motor heurístico local.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen('settings', false)}
              className="flex-1 py-2.5 bg-transparent text-diagramaxis-gold border border-diagramaxis-border hover:bg-diagramaxis-surface2 font-sans text-[13px] font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-diagramaxis-gold hover:bg-diagramaxis-goldHover text-diagramaxis-bg border border-diagramaxis-gold font-sans text-[13px] font-semibold uppercase tracking-wider transition-colors"
            >
              Guardar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
