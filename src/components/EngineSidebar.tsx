import React from 'react';
import {
  Activity,
  Cloud,
  Cpu,
  Flame,
  Library,
  Settings2,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { EngineSettings, ProjectProfile, WorkspaceSection } from '../types/studio';

interface EngineSidebarProps {
  activeProject: ProjectProfile;
  activeSection: WorkspaceSection;
  settings: EngineSettings;
  isProcessingAudio: boolean;
  isSplittingStems: boolean;
  trackCount: number;
  activityCount: number;
  onSelectSection: (section: WorkspaceSection) => void;
  onOpenEngineModal: () => void;
  onOpenActivityModal: () => void;
}

export const EngineSidebar: React.FC<EngineSidebarProps> = ({
  activeProject,
  activeSection,
  settings,
  isProcessingAudio,
  isSplittingStems,
  trackCount,
  activityCount,
  onSelectSection,
  onOpenEngineModal,
  onOpenActivityModal,
}) => {
  const gpuLoadPct = isSplittingStems ? 91 : isProcessingAudio ? 76 : 14;
  const vramUsedGb = isSplittingStems ? 5.3 : isProcessingAudio ? 4.1 : 2.2;
  const vramPct = Math.round((vramUsedGb / 6.0) * 100);
  const ramUsedGb = isSplittingStems ? 18.6 : isProcessingAudio ? 15.4 : 11.2;
  const ramPct = Math.round((ramUsedGb / 32.0) * 100);

  return (
    <aside
      aria-label="Navigasi Studio dan Telemetri Engine"
      className="w-full xl:w-[244px] shrink-0 bg-[#0B0B0E] border-b xl:border-b-0 xl:border-r border-white/[0.07] flex flex-col justify-between"
    >
      <div>
        {/* Brand Header reflecting Bushido Art Studio + Active Project Accent */}
        <div
          className="px-4 py-3.5 border-b border-white/[0.07] flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${activeProject.theme.panelTintHex}, #0B0B0E)`,
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 border border-white/15"
            style={{
              background: `linear-gradient(135deg, ${activeProject.theme.accentHex}, ${activeProject.theme.secondaryHex})`,
            }}
          >
            <Flame className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-zinc-50 truncate">
              Bushido Art Studio
            </h1>
            <p className="text-[11px] font-mono text-zinc-400 truncate">
              Hybrid DAW Workstation
            </p>
          </div>
        </div>

        {/* Vertical Navigation Menu */}
        <nav aria-label="Menu Studio" className="p-3 space-y-1">
          <button
            type="button"
            onClick={() => onSelectSection('create')}
            style={
              activeSection === 'create'
                ? {
                    backgroundColor: activeProject.theme.surfaceTint,
                    borderColor: `${activeProject.theme.accentHex}55`,
                  }
                : undefined
            }
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              activeSection === 'create'
                ? 'text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Sparkles
                className="w-4 h-4 shrink-0"
                style={{
                  color: activeSection === 'create' ? activeProject.theme.accentHex : undefined,
                }}
              />
              <span className="truncate">Create</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('library')}
            style={
              activeSection === 'library'
                ? {
                    backgroundColor: activeProject.theme.surfaceTint,
                    borderColor: `${activeProject.theme.accentHex}55`,
                  }
                : undefined
            }
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              activeSection === 'library'
                ? 'text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Library
                className="w-4 h-4 shrink-0"
                style={{
                  color: activeSection === 'library' ? activeProject.theme.accentHex : undefined,
                }}
              />
              <span className="truncate">Library</span>
            </span>
            <span className="text-[10px] font-mono tabular-nums text-zinc-400">
              {trackCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenEngineModal}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent transition-colors"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Settings2 className="w-4 h-4 shrink-0 text-zinc-500" />
              <span className="truncate">Studio Tools / Engine Config</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenActivityModal}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent transition-colors"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Activity className="w-4 h-4 shrink-0 text-zinc-500" />
              <span className="truncate">Activity</span>
            </span>
            {activityCount > 0 && (
              <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                {activityCount}
              </span>
            )}
          </button>
        </nav>

        {/* System & Engine Telemetry Widget */}
        <div className="px-3 py-3 border-t border-white/[0.07] space-y-3.5">
          <div className="text-[11px] font-semibold text-zinc-400 px-1">
            System &amp; Engine Telemetry
          </div>

          <div className="p-3 rounded-lg bg-[#111115] border border-white/[0.07] space-y-2.5">
            {/* GPU Load */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">GPU Load</span>
                <span className="font-mono tabular-nums text-zinc-200">{gpuLoadPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <div
                  className="h-full transition-[width] duration-300"
                  style={{
                    width: `${gpuLoadPct}%`,
                    background: `linear-gradient(90deg, ${activeProject.theme.accentHex}, ${activeProject.theme.secondaryHex})`,
                  }}
                />
              </div>
            </div>

            {/* VRAM 6.0 GB GTX 1060 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 truncate pr-1">VRAM GTX 1060</span>
                <span className="font-mono tabular-nums text-zinc-200 whitespace-nowrap">
                  {vramUsedGb.toFixed(1)} / 6.0 GB
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <div
                  className="h-full transition-[width] duration-300"
                  style={{
                    width: `${vramPct}%`,
                    backgroundColor: activeProject.theme.secondaryHex,
                  }}
                />
              </div>
            </div>

            {/* RAM */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">RAM</span>
                <span className="font-mono tabular-nums text-zinc-200 whitespace-nowrap">
                  {ramUsedGb.toFixed(1)} / 32.0 GB
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-[width] duration-300"
                  style={{ width: `${ramPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clickable Engine Status Triggers */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onOpenEngineModal}
              className="w-full p-2.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.07] hover:border-white/[0.2] text-left transition-colors group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 truncate">
                  <Cloud
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: activeProject.theme.accentHex }}
                  />
                  <span className="truncate">YuE2 Max Cloud Engine</span>
                </span>
                {settings.colabCloud.status === 'connected' ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span
                  className={
                    settings.colabCloud.status === 'connected'
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                  }
                >
                  {settings.colabCloud.status === 'connected'
                    ? settings.colabCloud.simulated
                      ? 'Connected (Simulasi)'
                      : 'Connected'
                    : 'Disconnected'}
                </span>
                <span className="text-zinc-500 group-hover:text-zinc-300">Atur URL</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenEngineModal}
              className="w-full p-2.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.07] hover:border-white/[0.2] text-left transition-colors group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 truncate">
                  <Cpu
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: activeProject.theme.secondaryHex }}
                  />
                  <span className="truncate">UVR5 GTX 1060 Local</span>
                </span>
                {settings.localPc.status === 'connected' ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span
                  className={
                    settings.localPc.status === 'connected'
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                  }
                >
                  {settings.localPc.status === 'connected'
                    ? settings.localPc.simulated
                      ? 'Connected (Simulasi)'
                      : 'Connected'
                    : 'Disconnected'}
                </span>
                <span className="text-zinc-500 group-hover:text-zinc-300">Atur URL</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
