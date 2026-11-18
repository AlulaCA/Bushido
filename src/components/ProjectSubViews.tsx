import React, { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Download,
  FileText,
  Guitar,
  Loader2,
  Mic2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type {
  ProjectProfile,
  ProjectWorkspaceState,
  QCRecord,
  QualityMode,
  RenderedTrackAudio,
  SongTrack,
} from '../types/studio';
import { formatTimecode } from './WaveformPlayer';

/* ============================================================================
 * 1. PROJECT LIBRARY VIEW
 * ============================================================================ */
interface ProjectLibraryViewProps {
  project: ProjectProfile;
  workspace: ProjectWorkspaceState;
  activeTrackId: string | null;
  onSelectAndPlay: (trackId: string) => void;
  onToggleArchiveMaster: (trackId: string) => void;
  onDownloadMasterWav: (trackId: string) => void;
  onApplyStylePrompt: (prompt: string) => void;
  onOpenCreate: () => void;
}

export const ProjectLibraryView: React.FC<ProjectLibraryViewProps> = ({
  project,
  workspace,
  activeTrackId,
  onSelectAndPlay,
  onToggleArchiveMaster,
  onDownloadMasterWav,
  onApplyStylePrompt,
  onOpenCreate,
}) => {
  const archivedTracks = workspace.tracks.filter((t) => t.archivedMaster);

  const ctaTextClass = project.id === 'echonav' ? 'text-zinc-950' : 'text-white';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#08080A] space-y-6">
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/[0.08] p-5"
        style={{
          backgroundColor: project.theme.panelTintHex,
          backgroundImage: project.theme.motifCss,
        }}
      >
        <div>
          <div className="text-[11px] font-mono text-zinc-400">
            {project.genre} · {project.theme.signatureLabel}
          </div>
          <h2 className="text-lg font-bold text-zinc-50 mt-0.5">
            {project.name} · Project Library &amp; Assets
          </h2>
          <p className="text-xs text-zinc-300/85 mt-0.5">
            Tracklist terisolasi, pustaka prompt gaya, identitas vokal, instrumen, dan arsip master akhir.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          style={{ backgroundColor: project.theme.accentHex }}
          className={`px-4 py-2 rounded-md text-xs font-bold hover:brightness-110 transition-all inline-flex items-center gap-1.5 whitespace-nowrap ${ctaTextClass}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Buat Lagu Baru</span>
        </button>
      </div>

      {/* Top Grid: Vocal Identity + Instrument Library + Style Prompt Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#111115] border border-white/[0.08] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Mic2 className="w-4 h-4" style={{ color: project.theme.accentHex }} />
            <span>Vocal Identity</span>
          </div>
          <div className="text-sm font-medium text-zinc-100">
            {workspace.composer.vocalIdentity}
          </div>
          <div className="space-y-1 pt-1">
            {project.vocalOptions.map((opt) => (
              <div key={opt} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="text-zinc-600">·</span>
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111115] border border-white/[0.08] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Guitar className="w-4 h-4" style={{ color: project.theme.accentHex }} />
            <span>Instrument Library ({project.name})</span>
          </div>
          <ul className="space-y-1.5">
            {project.instrumentLibrary.map((inst) => (
              <li key={inst} className="text-xs text-zinc-300 flex items-center gap-2">
                <span className="text-zinc-500 font-mono" aria-hidden="true">
                  —
                </span>
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-[#111115] border border-white/[0.08] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <FileText className="w-4 h-4" style={{ color: project.theme.accentHex }} />
            <span>Style Prompt Library</span>
          </div>
          <div className="space-y-2">
            {project.stylePromptLibrary.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onApplyStylePrompt(prompt)}
                className="w-full text-left p-2 rounded bg-[#08080A] hover:bg-white/[0.05] border border-white/[0.07] text-[11px] text-zinc-300 leading-snug transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Final Master Archive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Final Master Archive</h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-zinc-400">
            {archivedTracks.length} masters
          </span>
        </div>

        <div className="rounded-lg bg-[#111115] border border-white/[0.08] divide-y divide-white/[0.06]">
          {archivedTracks.length === 0 ? (
            <div className="p-5 text-xs text-zinc-500">
              Belum ada lagu yang diarsipkan ke Final Master Archive pada proyek {project.name}.
            </div>
          ) : (
            archivedTracks.map((track) => (
              <div
                key={track.id}
                className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-100 truncate">
                    {track.title}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    {track.style} · <span className="font-mono">{track.bpm} BPM</span> ·{' '}
                    {track.musicalKey}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono tabular-nums text-zinc-400">
                    {formatTimecode(track.durationSec)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectAndPlay(track.id)}
                    className="px-3 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-zinc-100 inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Putar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownloadMasterWav(track.id)}
                    className="px-3 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-zinc-100 inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>WAV</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Complete Project Tracklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">
            Tracklist &amp; Generation History ({project.name})
          </h3>
          <span className="text-xs font-mono tabular-nums text-zinc-400">
            {workspace.tracks.length} tracks
          </span>
        </div>

        <div className="rounded-lg bg-[#111115] border border-white/[0.08] divide-y divide-white/[0.06]">
          {workspace.tracks.map((track) => (
            <div
              key={track.id}
              className={`px-4 py-3 flex items-center justify-between gap-4 ${
                activeTrackId === track.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-100 truncate">{track.title}</div>
                <div className="text-xs text-zinc-500 truncate">
                  {track.qualityMode === 'bf16-cloud' ? 'Max Quality bf16 - Cloud' : 'Draft GGUF - Local'} ·{' '}
                  {track.bpm} BPM · {track.musicalKey} · {track.stemsSplit ? '4 Stems' : 'Master'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleArchiveMaster(track.id)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                    track.archivedMaster
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                      : 'border-white/[0.1] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {track.archivedMaster ? 'Archived' : 'Archive Master'}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAndPlay(track.id)}
                  className="px-3 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-100"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. LYRICS & COMPOSITION VIEW
 * ============================================================================ */
interface LyricsCompositionViewProps {
  project: ProjectProfile;
  workspace: ProjectWorkspaceState;
  isComposingAI: boolean;
  onChangeTitle: (v: string) => void;
  onChangeLyrics: (v: string) => void;
  onChangeStyle: (v: string) => void;
  onChangeAbcScore: (v: string) => void;
  onComposeWithAI: () => void;
  onGoToCreate: () => void;
}

export const LyricsCompositionView: React.FC<LyricsCompositionViewProps> = ({
  project,
  workspace,
  isComposingAI,
  onChangeTitle,
  onChangeLyrics,
  onChangeStyle,
  onChangeAbcScore,
  onComposeWithAI,
  onGoToCreate,
}) => {
  const ctaTextClass = project.id === 'echonav' ? 'text-zinc-950' : 'text-white';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#08080A] space-y-5">
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/[0.08] p-5"
        style={{
          backgroundColor: project.theme.panelTintHex,
          backgroundImage: project.theme.motifCss,
        }}
      >
        <div>
          <div className="text-[11px] font-mono text-zinc-400">
            {project.genre} · {project.theme.signatureLabel}
          </div>
          <h2 className="text-lg font-bold text-zinc-50 mt-0.5">
            {project.name} · Composition &amp; Lyrics Studio
          </h2>
          <p className="text-xs text-zinc-300/85 mt-0.5">
            Susun lirik berstruktur [Verse], [Chorus], [Bridge], [Outro] dan notasi ABC khusus karakter {project.genre}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onComposeWithAI}
            disabled={isComposingAI}
            style={{ backgroundColor: project.theme.accentHex }}
            className={`px-4 py-2 rounded-md text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap ${ctaTextClass}`}
          >
            {isComposingAI ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>AI Bantu Buat Lirik &amp; Style</span>
          </button>

          <button
            type="button"
            onClick={onGoToCreate}
            className="px-4 py-2 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-zinc-100 transition-colors whitespace-nowrap"
          >
            Buka Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-3">
          <div>
            <label htmlFor="lyrics-view-title" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Judul Komposisi
            </label>
            <input
              id="lyrics-view-title"
              type="text"
              value={workspace.composer.title}
              onChange={(e) => onChangeTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-md bg-[#111115] border border-white/[0.09] text-sm text-zinc-100 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label htmlFor="lyrics-view-editor" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Lirik Terstruktur
            </label>
            <textarea
              id="lyrics-view-editor"
              rows={16}
              value={workspace.composer.lyrics}
              onChange={(e) => onChangeLyrics(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#111115] border border-white/[0.09] text-sm font-mono leading-relaxed text-zinc-100 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-lg bg-[#111115] border border-white/[0.08] space-y-2.5">
            <label htmlFor="lyrics-view-style" className="block text-xs font-semibold text-zinc-200">
              Active Style Prompt
            </label>
            <textarea
              id="lyrics-view-style"
              rows={3}
              value={workspace.composer.stylePrompt}
              onChange={(e) => onChangeStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#08080A] border border-white/[0.08] text-xs text-zinc-200 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="p-4 rounded-lg bg-[#111115] border border-white/[0.08] space-y-2.5">
            <label htmlFor="lyrics-view-abc" className="block text-xs font-semibold text-zinc-200">
              ABC Score Notation
            </label>
            <textarea
              id="lyrics-view-abc"
              rows={5}
              value={workspace.composer.abcScore}
              onChange={(e) => onChangeAbcScore(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#08080A] border border-white/[0.08] text-xs font-mono text-zinc-200 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="p-4 rounded-lg bg-[#111115] border border-white/[0.08] space-y-2">
            <div className="text-xs font-semibold text-zinc-200">
              Style Prompt Library ({project.name})
            </div>
            {project.stylePromptLibrary.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeStyle(prompt)}
                className="w-full text-left p-2.5 rounded bg-[#08080A] hover:bg-white/[0.05] border border-white/[0.07] text-[11px] text-zinc-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. PRODUCTION QC VIEW
 * ============================================================================ */
interface ProductionQCViewProps {
  project: ProjectProfile;
  tracks: SongTrack[];
  qcHistory: QCRecord[];
  audioCache: Record<string, RenderedTrackAudio>;
  onRunQC: (track: SongTrack) => void;
  onToggleArchiveMaster: (trackId: string) => void;
}

export const ProductionQCView: React.FC<ProductionQCViewProps> = ({
  project,
  tracks,
  qcHistory,
  audioCache,
  onRunQC,
  onToggleArchiveMaster,
}) => {
  const ctaTextClass = project.id === 'echonav' ? 'text-zinc-950' : 'text-white';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#08080A] space-y-6">
      <div
        className="rounded-lg border border-white/[0.08] p-5"
        style={{
          backgroundColor: project.theme.panelTintHex,
          backgroundImage: project.theme.motifCss,
        }}
      >
        <div className="text-[11px] font-mono text-zinc-400">
          {project.genre} · {project.theme.signatureLabel}
        </div>
        <h2 className="text-lg font-bold text-zinc-50 mt-0.5">
          {project.name} · Production QC &amp; Master Verification
        </h2>
        <p className="text-xs text-zinc-300/85 mt-0.5">
          Verifikasi headroom puncak (dBFS), estimasi loudness (LUFS), kesiapan 4-stem UVR5, dan arsip master proyek.
        </p>
      </div>

      {/* Tracks awaiting or ready for QC */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Daftar Trek Proyek
        </h3>
        <div className="rounded-lg bg-[#111115] border border-white/[0.08] divide-y divide-white/[0.06]">
          {tracks.map((track) => {
            const hasAudio = Boolean(audioCache[track.id]);
            return (
              <div
                key={track.id}
                className="px-4 py-3 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-100">{track.title}</div>
                  <div className="text-xs text-zinc-400">
                    {track.qualityMode === 'bf16-cloud' ? 'bf16 Cloud' : 'GGUF Local'} ·{' '}
                    <span className="font-mono">{track.bpm} BPM</span> ·{' '}
                    {track.stemsSplit ? 'UVR5 4 Stems Ready' : 'Master Only'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleArchiveMaster(track.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      track.archivedMaster
                        ? 'bg-amber-500/15 border-amber-500/45 text-amber-300'
                        : 'bg-[#08080A] border-white/[0.1] text-zinc-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    {track.archivedMaster ? 'Archived Master' : 'Promote to Master'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onRunQC(track)}
                    style={{ backgroundColor: project.theme.accentHex }}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5 whitespace-nowrap ${ctaTextClass}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{hasAudio ? 'Run Audio QC' : 'Render & Run QC'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QC History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            QC History ({project.name})
          </h3>
          <span className="text-xs font-mono tabular-nums text-zinc-500">
            {qcHistory.length} checks
          </span>
        </div>

        <div className="rounded-lg bg-[#111115] border border-white/[0.08] divide-y divide-white/[0.06]">
          {qcHistory.map((qc) => (
            <div key={qc.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-zinc-100">{qc.trackTitle}</span>
                  <span className="text-xs font-mono text-emerald-400">
                    {qc.status === 'passed' ? 'PASSED' : 'REVIEW'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{qc.notes}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-zinc-300 shrink-0">
                <span>Peak: {qc.peakDb}</span>
                <span>Loudness: {qc.lufsEstimate}</span>
                <span className="text-zinc-500">{qc.checkedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. PROJECT SETTINGS VIEW
 * ============================================================================ */
interface ProjectSettingsViewProps {
  project: ProjectProfile;
  workspace: ProjectWorkspaceState;
  onUpdateComposerSettings: (patch: {
    qualityMode?: QualityMode;
    bpm?: number;
    musicalKey?: string;
    vocalIdentity?: string;
    loraModel?: string;
  }) => void;
  onResetProject: () => void;
}

export const ProjectSettingsView: React.FC<ProjectSettingsViewProps> = ({
  project,
  workspace,
  onUpdateComposerSettings,
  onResetProject,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#08080A] space-y-6">
      <div
        className="rounded-lg border border-white/[0.08] p-5 flex items-center justify-between gap-4"
        style={{
          backgroundColor: project.theme.panelTintHex,
          backgroundImage: project.theme.motifCss,
        }}
      >
        <div>
          <div className="text-[11px] font-mono text-zinc-400">
            {project.genre} · {project.theme.signatureLabel}
          </div>
          <h2 className="text-lg font-bold text-zinc-50 mt-0.5">
            {project.name} · Project Settings
          </h2>
          <p className="text-xs text-zinc-300/85 mt-0.5">
            Pengaturan profil terisolasi untuk {project.name} ({project.genre}). Tidak memengaruhi proyek lain.
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-5">
        <div className="p-5 rounded-lg bg-[#111115] border border-white/[0.08] space-y-4">
          <div>
            <label htmlFor="proj-vocal" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Default Vocal Identity
            </label>
            <select
              id="proj-vocal"
              value={workspace.composer.vocalIdentity}
              onChange={(e) => onUpdateComposerSettings({ vocalIdentity: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-[#08080A] border border-white/[0.1] text-sm text-zinc-100"
            >
              {project.vocalOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proj-lora" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Default LoRA Adapter
            </label>
            <select
              id="proj-lora"
              value={workspace.composer.loraModel}
              onChange={(e) => onUpdateComposerSettings({ loraModel: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-[#08080A] border border-white/[0.1] text-sm font-mono text-zinc-100"
            >
              {project.loraModels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-bpm" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Default BPM
              </label>
              <input
                id="proj-bpm"
                type="number"
                min={65}
                max={165}
                value={workspace.composer.bpm}
                onChange={(e) =>
                  onUpdateComposerSettings({
                    bpm: Math.min(165, Math.max(65, Number(e.target.value) || 120)),
                  })
                }
                className="w-full px-3 py-2 rounded-md bg-[#08080A] border border-white/[0.1] text-sm font-mono tabular-nums text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="proj-quality" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Default Quality Mode
              </label>
              <select
                id="proj-quality"
                value={workspace.composer.qualityMode}
                onChange={(e) =>
                  onUpdateComposerSettings({ qualityMode: e.target.value as QualityMode })
                }
                className="w-full px-3 py-2 rounded-md bg-[#08080A] border border-white/[0.1] text-sm text-zinc-100"
              >
                <option value="bf16-cloud">Max Quality bf16 - Cloud</option>
                <option value="gguf-local">Draft GGUF - Local</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-[#111115] border border-red-500/25 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-100">
              Reset Workspace {project.name}
            </div>
            <p className="text-xs text-zinc-400">
              Kembalikan preset, tracklist, dan riwayat QC proyek {project.name} ke kondisi awal.
            </p>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-md bg-white/[0.06] text-xs text-zinc-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProject();
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
              >
                Konfirmasi Reset
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2 rounded-md bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-xs font-semibold text-red-300 inline-flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Proyek</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
