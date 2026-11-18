import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Headphones,
  Layers,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { PROJECT_LIST } from '../data/projects';
import type {
  EngineSettings,
  ProjectId,
  ProjectWorkspaceState,
  WorkspaceSection,
} from '../types/studio';

interface ProjectHubProps {
  workspaces: Record<ProjectId, ProjectWorkspaceState>;
  lastActiveProjectId: ProjectId;
  engineSettings: EngineSettings;
  activityCount: number;
  onEnterProject: (projectId: ProjectId, initialSection?: WorkspaceSection) => void;
  onOpenEngineModal: () => void;
  onOpenActivityModal: () => void;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({
  workspaces,
  lastActiveProjectId,
  engineSettings,
  activityCount,
  onEnterProject,
  onOpenEngineModal,
  onOpenActivityModal,
}) => {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const anyEngineConnected =
    engineSettings.colabCloud.status === 'connected' ||
    engineSettings.localPc.status === 'connected';

  const lastActiveProject =
    PROJECT_LIST.find((p) => p.id === lastActiveProjectId) ?? PROJECT_LIST[0];

  const markBroken = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen w-full bg-[#08080A] text-zinc-100 flex flex-col">
      {/* Top Workstation Header */}
      <header className="w-full bg-[#0C0C10] border-b border-white/[0.08] px-6 py-3.5 shrink-0">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-red-600 to-violet-700 flex items-center justify-center text-white border border-white/15 shrink-0">
              <Flame className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-[0.06em] text-zinc-50 whitespace-nowrap">
                BUSHIDO ART STUDIO
              </h1>
              <p className="text-[11px] font-mono tracking-[0.12em] text-zinc-400 whitespace-nowrap">
                HYBRID DAW WORKSTATION
              </p>
            </div>
          </div>

          {/* Right Workstation Quick Status / Resume */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenEngineModal}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111115] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors whitespace-nowrap"
            >
              {anyEngineConnected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
              <span>
                {anyEngineConnected ? 'Engine Online' : 'Engine Config'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onEnterProject(lastActiveProject.id, 'create')}
              style={{ backgroundColor: lastActiveProject.theme.accentHex }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5 whitespace-nowrap ${lastActiveProject.theme.buttonTextClass}`}
            >
              <span>Resume {lastActiveProject.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Desktop-First Hub Canvas */}
      <main className="flex-1 px-6 py-8 lg:py-10 max-w-[1440px] w-full mx-auto flex flex-col justify-between gap-10">
        {/* Section 1: 5 Isolated Studio Projects */}
        <section aria-label="Daftar Proyek Studio" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <p className="text-xs font-mono tracking-wider text-zinc-400">
                Multi-Project Production Hub
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 text-balance">
                Select Studio Identity &amp; Production Workspace
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Lima proyek produksi musik AI terisolasi penuh dengan preset genre, identitas vokal, pustaka instrumen, riwayat track, Production QC, dan arsip master tersendiri.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-zinc-400 whitespace-nowrap">
              <span>5 Studio Profiles</span>
              <span aria-hidden="true">·</span>
              <span>Isolated State</span>
            </div>
          </div>

          {/* 5 Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
            {PROJECT_LIST.map((project) => {
              const ws = workspaces[project.id];
              const trackCount = ws?.tracks.length ?? 0;
              const masterCount = ws?.tracks.filter((t) => t.archivedMaster).length ?? 0;
              const imgBroken = brokenImages[project.id];

              return (
                <article
                  key={project.id}
                  onClick={() => onEnterProject(project.id, 'create')}
                  style={
                    {
                      backgroundColor: project.theme.panelTintHex,
                      '--card-glow': project.theme.glowShadowStyle,
                    } as React.CSSProperties
                  }
                  className="group relative rounded-lg border border-white/[0.09] hover:border-white/[0.24] transition-all duration-200 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--card-glow)]"
                >
                  {/* Top Identity Accent Stripe */}
                  <div
                    className="h-1 w-full shrink-0"
                    style={{
                      background: `linear-gradient(90deg, ${project.theme.accentHex}, ${project.theme.secondaryHex})`,
                    }}
                  />

                  {/* Cover Artwork + Scrim + Identity Title */}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden shrink-0 bg-[#08080A]"
                    style={{ backgroundImage: project.theme.motifCss }}
                  >
                    {!imgBroken ? (
                      <img
                        src={project.coverImage}
                        alt={`${project.name} — ${project.genre}`}
                        referrerPolicy="no-referrer"
                        onError={() => markBroken(project.id)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
                        style={{ backgroundImage: project.theme.motifCss }}
                      >
                        <Layers
                          className="w-7 h-7"
                          style={{ color: project.theme.accentHex }}
                        />
                        <span className="text-xs font-mono text-zinc-300">
                          {project.name}
                        </span>
                      </div>
                    )}

                    {/* Measured Contrast Scrim */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${project.theme.panelTintHex} 4%, rgba(8,8,10,0.48) 52%, rgba(8,8,10,0.12) 100%)`,
                      }}
                    />

                    {/* Motif Overlay Glow */}
                    <div
                      className="absolute inset-0 opacity-60 pointer-events-none"
                      style={{ backgroundImage: project.theme.motifCss }}
                    />

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-mono text-zinc-300/90">
                          {project.theme.signatureLabel}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-50">
                          {project.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2">
                      <div
                        className="text-xs font-semibold tracking-wide"
                        style={{
                          color:
                            project.id === 'noczx'
                              ? '#F87171'
                              : project.id === 'ezyvx'
                                ? '#38BDF8'
                                : project.id === 'vdnyx'
                                  ? '#2DD4BF'
                                  : project.id === 'echonav'
                                    ? '#FBBF24'
                                    : '#F87171',
                        }}
                      >
                        {project.genre}
                      </div>
                      <p className="text-xs text-zinc-300/85 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-zinc-400">
                        <span>{trackCount} tracks</span>
                        <span aria-hidden="true">·</span>
                        <span>{masterCount} masters</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.defaultBpm} BPM</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterProject(project.id, 'create');
                        }}
                        style={{
                          background: `linear-gradient(90deg, ${project.theme.accentHex}, ${project.theme.secondaryHex})`,
                        }}
                        className={`w-full py-2.5 px-4 rounded-md text-xs font-bold tracking-wide hover:brightness-110 transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap ${
                          project.id === 'echonav' ? 'text-zinc-950' : 'text-white'
                        }`}
                      >
                        <span>Enter Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 2: Dedicated & Separate Global Tools Area */}
        <section
          aria-label="Global Tools Workstation"
          className="pt-6 border-t border-white/[0.08] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold tracking-wide text-zinc-100">
                Global Tools
              </h2>
              <p className="text-xs text-zinc-400">
                Utilitas workstation lintas proyek untuk generasi AI, Audio Studio, Production QC, konfigurasi Engine, dan Activity Log.
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Active target: {lastActiveProject.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => onEnterProject(lastActiveProjectId, 'create')}
              className="p-3.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.08] hover:border-white/[0.18] text-left transition-colors flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <Sparkles className="w-4 h-4 text-red-400 shrink-0" />
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">
                  AI Music Generator
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Komposer Gemini, YuE2 Max bf16 &amp; GGUF Draft
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onEnterProject(lastActiveProjectId, 'audio')}
              className="p-3.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.08] hover:border-white/[0.18] text-left transition-colors flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <Headphones className="w-4 h-4 text-cyan-400 shrink-0" />
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">
                  Audio Studio
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Pemutar waveform interaktif &amp; mixer 4-stem UVR5
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onEnterProject(lastActiveProjectId, 'qc')}
              className="p-3.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.08] hover:border-white/[0.18] text-left transition-colors flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">
                  Production QC
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Cek peak dBFS, loudness LUFS &amp; Final Master
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenEngineModal}
              className="p-3.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.08] hover:border-white/[0.18] text-left transition-colors flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                {anyEngineConnected ? (
                  <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Cpu className="w-4 h-4 text-zinc-300 shrink-0" />
                )}
                <span className="text-[10px] font-mono text-zinc-400">
                  {anyEngineConnected ? 'Connected' : 'Standby'}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">
                  Engine Management
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  URL Colab YuE2 Max &amp; UVR5 GTX 1060 lokal
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenActivityModal}
              className="p-3.5 rounded-lg bg-[#111115] hover:bg-[#17171D] border border-white/[0.08] hover:border-white/[0.18] text-left transition-colors flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                  {activityCount} logs
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">
                  Activity
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Riwayat proses AI, UVR5, QC &amp; koneksi engine
                </div>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
