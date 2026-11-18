import React, { useEffect } from 'react';
import { Cloud, Cpu, PlugZap, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import type { ConnectionState, EngineSettings } from '../types/studio';

interface EngineConfigModalProps {
  isOpen: boolean;
  settings: EngineSettings;
  onClose: () => void;
  onUpdateUrl: (target: 'colabCloud' | 'localPc', url: string) => void;
  onPingEngine: (target: 'colabCloud' | 'localPc') => void;
  onToggleSimulation: (target: 'colabCloud' | 'localPc') => void;
}

function StatusLabel({ status, simulated }: { status: ConnectionState; simulated: boolean }) {
  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 whitespace-nowrap">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Memeriksa...</span>
      </span>
    );
  }
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <Wifi className="w-3.5 h-3.5" />
        <span>Connected{simulated ? ' (Simulasi)' : ''}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 whitespace-nowrap">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Disconnected</span>
    </span>
  );
}

export const EngineConfigModal: React.FC<EngineConfigModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateUrl,
  onPingEngine,
  onToggleSimulation,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="engine-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-[#111115] border border-white/[0.1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 id="engine-modal-title" className="text-sm font-bold text-zinc-100">
              Studio Tools &amp; Engine Config
            </h2>
            <p className="text-xs text-zinc-400">
              Atur URL endpoint YuE2 Max Cloud &amp; UVR5 GTX 1060 Local
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan engine"
            className="w-8 h-8 rounded-md inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Colab Cloud API - YuE2 Max */}
          <div className="p-4 rounded-lg bg-[#08080A] border border-white/[0.08] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Cloud className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    YuE2 Max Cloud Engine
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Colab Cloud API (bf16 Full Precision)
                  </div>
                </div>
              </div>
              <StatusLabel
                status={settings.colabCloud.status}
                simulated={settings.colabCloud.simulated}
              />
            </div>

            <div>
              <label
                htmlFor="modal-colab-url"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Colab Cloud API URL
              </label>
              <input
                id="modal-colab-url"
                type="url"
                value={settings.colabCloud.url}
                onChange={(e) => onUpdateUrl('colabCloud', e.target.value)}
                placeholder="https://xxxx.ngrok-free.app"
                className="w-full px-3 py-2 rounded-md bg-[#111115] border border-white/[0.1] text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPingEngine('colabCloud')}
                disabled={settings.colabCloud.status === 'connecting'}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white/[0.06] hover:bg-white/[0.11] text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <PlugZap className="w-3.5 h-3.5" />
                <span>Cek Koneksi</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSimulation('colabCloud')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                  settings.colabCloud.simulated && settings.colabCloud.status === 'connected'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-transparent border-white/[0.1] text-zinc-300 hover:border-violet-500/50'
                }`}
              >
                {settings.colabCloud.simulated && settings.colabCloud.status === 'connected'
                  ? 'Putus Simulasi'
                  : 'Aktifkan Simulasi'}
              </button>
            </div>

            {settings.colabCloud.lastMessage && (
              <p className="text-[11px] text-zinc-400">{settings.colabCloud.lastMessage}</p>
            )}
          </div>

          {/* Local PC API - UVR5 GTX 1060 */}
          <div className="p-4 rounded-lg bg-[#08080A] border border-white/[0.08] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    UVR5 GTX 1060 Local
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Local PC Stem Separator (6.0 GB VRAM)
                  </div>
                </div>
              </div>
              <StatusLabel
                status={settings.localPc.status}
                simulated={settings.localPc.simulated}
              />
            </div>

            <div>
              <label
                htmlFor="modal-local-url"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Local PC API URL
              </label>
              <input
                id="modal-local-url"
                type="url"
                value={settings.localPc.url}
                onChange={(e) => onUpdateUrl('localPc', e.target.value)}
                placeholder="http://127.0.0.1:7865"
                className="w-full px-3 py-2 rounded-md bg-[#111115] border border-white/[0.1] text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPingEngine('localPc')}
                disabled={settings.localPc.status === 'connecting'}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white/[0.06] hover:bg-white/[0.11] text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <PlugZap className="w-3.5 h-3.5" />
                <span>Cek Koneksi</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSimulation('localPc')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                  settings.localPc.simulated && settings.localPc.status === 'connected'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-transparent border-white/[0.1] text-zinc-300 hover:border-violet-500/50'
                }`}
              >
                {settings.localPc.simulated && settings.localPc.status === 'connected'
                  ? 'Putus Simulasi'
                  : 'Aktifkan Simulasi'}
              </button>
            </div>

            {settings.localPc.lastMessage && (
              <p className="text-[11px] text-zinc-400">{settings.localPc.lastMessage}</p>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-[#0B0B0E] border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
