import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { AISettings } from '../../types';
import { X, Key, ShieldCheck } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setModalOpen, aiSettings, setAiSettings } = useProjectStore();

  const [provider, setProvider] = useState<AISettings['provider']>(aiSettings.provider || 'cloudflare');
  const [apiKey, setApiKey] = useState<string>(aiSettings.apiKey || '');

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
    <div className="fixed inset-0 bg-[#090d14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1724] border border-[#24354d] w-full max-w-[460px] rounded-sm shadow-2xl p-6 flex flex-col gap-4 select-none text-[#f8fafc]">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b] font-semibold">
              Configuración del Sistema
            </span>
            <h2 className="font-serif font-bold text-[22px] text-[#f8fafc]">
              Ajustes de Inteligencia Artificial (BYOK)
            </h2>
          </div>
          <button
            onClick={() => setModalOpen('settings', false)}
            className="text-[#94a3b8] hover:text-[#f8fafc] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          {/* Proveedor de IA */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">
              Proveedor de IA para Discurso y Referencias
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full p-2.5 bg-[#162234] border border-[#24354d] focus:border-[#22c55e] rounded-xs font-mono text-[11px] text-[#f8fafc] outline-none"
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
              <label className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">
                Clave de API Personal (BYOK)
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-[#64748b] absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Ingresa tu ${provider.toUpperCase()} API Key...`}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#162234] border border-[#24354d] focus:border-[#22c55e] rounded-xs font-mono text-[11px] text-[#f8fafc] outline-none placeholder:text-[#64748b]"
                />
              </div>
              <span className="font-mono text-[9px] text-[#64748b]">
                Tu clave se guarda exclusivamente en tu navegador (LocalStorage) y nunca se almacena en bases de datos.
              </span>
            </div>
          )}

          <div className="p-3 bg-[#162234] border border-[#24354d] rounded-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="font-mono text-[9.5px] text-[#cbd5e1] leading-relaxed">
              En despliegues de Cloudflare Pages, si no configuras una clave personal, las funciones serverless pueden emplear las variables de entorno configuradas por tu institución o el motor heurístico local.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen('settings', false)}
              className="flex-1 py-2.5 bg-[#162234] hover:bg-[#1e2f46] text-[#cbd5e1] font-mono text-[11px] uppercase tracking-wider rounded-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-[#090d14] font-mono text-[11px] font-bold uppercase tracking-wider rounded-xs transition-colors shadow-[0_0_10px_rgba(34,197,94,0.25)]"
            >
              Guardar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
