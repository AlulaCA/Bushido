import React from 'react';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  FileText,
  FolderGit2,
  Headphones,
  Sliders,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { PROJECT_LIST } from '../data/projects';
import type {
  EngineSettings,
  ProjectId,
  ProjectProfile,
  WorkspaceSection,
} from '../types/studio';

interface GlobalToolsBarProps {
  activeProject: ProjectProfile;
  activeSection: WorkspaceSection;
  engineSettings: EngineSettings;
  activityCount: number;
  onReturnToHub: () => void;
  onSwitchProject: (projectId: ProjectId) => void;
  onSelectSection: (section: WorkspaceSection) => void;
  onOpenEngineModal: () => void;
  onOpenActivityModal: () => void;
}

const WORKSPACE_TABS: Array<{
  id: WorkspaceSection;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = [
  { id: 'create', label: 'Create', icon: Sparkles },
  { id: 'library', label: 'Library', icon: FolderGit2 },
  { id: 'lyrics', label: 'Composition & Lyrics', icon: FileText },
  { id: 'audio', label: 'Audio Studio', icon: Headphones },
  { id: 'qc', label: 'Production QC', icon: CheckCircle2 },
  { id: 'settings', label: 'Project Settings', icon: Sliders },
];

export const GlobalToolsBar: React.FC<GlobalToolsBarProps> = ({
  activeProject,
  activeSection,
  engineSettings,
  activityCount,
  onReturnToHub,
  onSwitchProject,
  onSelectSection,
  onOpenEngineModal,
  onOpenActivityModal,
}) => {
  const anyConnected =
    engineSettings.colabCloud.status === 'connected' ||
    engineSettings.localPc.status === 'connected';

  return (
    <header
      className="w-full border-b border-white/[0.08] px-4 py-2 shrink-0"
      style={{
        backgroundColor: activeProject.theme.panelTintHex,
      }}
    >
      <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Left: Project Hub Return + Active Project Visual Identity + Switcher */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onReturnToHub}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#111115] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-medium text-zinc-200 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Project Hub</span>
          </button>

          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-md border bg-[#0B0B0F] shrink-0 overflow-hidden"
            style={{
              borderColor: `${activeProject.theme.accentHex}66`,
            }}
          >
            <span
              className="w-1 h-4 rounded-sm shrink-0"
              style={{
                background: `linear-gradient(180deg, ${activeProject.theme.accentHex}, ${activeProject.theme.secondaryHex})`,
              }}
              aria-hidden="true"
            />
            <span className="text-xs font-bold tracking-wide text-zinc-50 whitespace-nowrap">
              {activeProject.name}
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline whitespace-nowrap">
              · {activeProject.genre}
            </span>
          </div>

          {/* Quick Project Switcher */}
          <select
            aria-label="Ganti proyek aktif"
            value={activeProject.id}
            onChange={(e) => onSwitchProject(e.target.value as ProjectId)}
            className="px-2 py-1.5 rounded-md bg-[#111115] border border-white/[0.09] text-xs font-mono text-zinc-200 focus:outline-none focus:border-white/30 hidden 2xl:block shrink-0"
          >
            {PROJECT_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.genre})
              </option>
            ))}
          </select>
        </div>

        {/* Center: Project Workspace Navigation */}
        <nav
          aria-label="Navigasi Ruang Proyek"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full"
        >
          {WORKSPACE_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectSection(id)}
                style={
                  isActive
                    ? {
                        borderColor: `${activeProject.theme.accentHex}88`,
                        backgroundColor: activeProject.theme.surfaceTint,
                      }
                    : undefined
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-zinc-50'
                    : 'border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={isActive ? { color: activeProject.theme.accentHex } : undefined}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Separate Global Tools Triggers */}
        <div
          aria-label="Global Tools"
          className="flex items-center gap-1.5 shrink-0 border-l border-white/[0.09] pl-2.5"
        >
          <button
            type="button"
            onClick={onOpenEngineModal}
            title="Engine Management (YuE2 Max & UVR5 GTX 1060)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#111115] hover:bg-white/[0.08] border border-white/[0.09] text-xs font-medium text-zinc-200 transition-colors whitespace-nowrap"
          >
            {anyConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Cpu className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
            <span className="hidden md:inline">Engine Management</span>
          </button>

          <button
            type="button"
            onClick={onOpenActivityModal}
            title="Activity Log"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#111115] hover:bg-white/[0.08] border border-white/[0.09] text-xs font-medium text-zinc-200 transition-colors whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="hidden md:inline">Activity</span>
            {activityCount > 0 && (
              <span className="font-mono tabular-nums text-[10px] text-zinc-400">
                {activityCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
