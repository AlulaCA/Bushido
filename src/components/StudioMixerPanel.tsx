import React, { useMemo, useState } from 'react';
import {
  Archive,
  ArrowUpDown,
  Download,
  Filter,
  Loader2,
  Music,
  Pause,
  Play,
  Scissors,
  Search,
  SkipBack,
  SkipForward,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import type {
  MixerState,
  ProjectProfile,
  RenderedTrackAudio,
  SongTrack,
  StemKey,
} from '../types/studio';
import { WaveformPlayer, formatTimecode } from './WaveformPlayer';
import { VerticalFader } from './VerticalFader';

interface StudioMixerPanelProps {
  project: ProjectProfile;
  tracks: SongTrack[];
  activeTrack: SongTrack | null;
  activeAudio: RenderedTrackAudio | null;
  isGeneratingSong: boolean;
  generationStage: string;
  isSplittingStems: boolean;
  splitStage: string;
  isPlaying: boolean;
  currentTime: number;
  masterVolume: number;
  mixerState: MixerState;
  meters: { master: number } & Record<StemKey, number>;
  onSelectTrack: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onToggleArchiveMaster: (trackId: string) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (sec: number) => void;
  onChangeMasterVolume: (vol: number) => void;
  onSplitStems: () => void;
  onChangeStemVolume: (stem: StemKey, vol: number) => void;
  onToggleMute: (stem: StemKey) => void;
  onToggleSolo: (stem: StemKey) => void;
  onDownloadMasterWav: () => void;
  onDownloadStemWav: (stem: StemKey) => void;
}

type FilterOption = 'all' | 'bf16-cloud' | 'gguf-local' | 'stems' | 'archived';
type SortOption = 'newest' | 'title' | 'bpm';

const STEM_CHANNELS: Array<{
  key: StemKey;
  label: string;
  faderColor: string;
}> = [
  { key: 'vocals', label: 'Vocals', faderColor: 'bg-red-500' },
  { key: 'drums', label: 'Drums', faderColor: 'bg-violet-500' },
  { key: 'bass', label: 'Bass', faderColor: 'bg-orange-500' },
  { key: 'other', label: 'Other', faderColor: 'bg-fuchsia-500' },
];

export const StudioMixerPanel: React.FC<StudioMixerPanelProps> = ({
  project,
  tracks,
  activeTrack,
  activeAudio,
  isGeneratingSong,
  generationStage,
  isSplittingStems,
  splitStage,
  isPlaying,
  currentTime,
  masterVolume,
  mixerState,
  meters,
  onSelectTrack,
  onDeleteTrack,
  onToggleArchiveMaster,
  onPrevTrack,
  onNextTrack,
  onTogglePlay,
  onStop,
  onSeek,
  onChangeMasterVolume,
  onSplitStems,
  onChangeStemVolume,
  onToggleMute,
  onToggleSolo,
  onDownloadMasterWav,
  onDownloadStemWav,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = tracks.filter((t) => {
      if (filterBy === 'bf16-cloud' && t.qualityMode !== 'bf16-cloud') return false;
      if (filterBy === 'gguf-local' && t.qualityMode !== 'gguf-local') return false;
      if (filterBy === 'stems' && !t.stemsSplit) return false;
      if (filterBy === 'archived' && !t.archivedMaster) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.style.toLowerCase().includes(q) ||
        t.musicalKey.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'bpm') {
      return [...list].sort((a, b) => b.bpm - a.bpm);
    }
    return list;
  }, [tracks, searchQuery, filterBy, sortBy]);

  const cycleFilter = () => {
    const order: FilterOption[] = ['all', 'bf16-cloud', 'gguf-local', 'stems', 'archived'];
    const idx = order.indexOf(filterBy);
    setFilterBy(order[(idx + 1) % order.length]);
  };

  const cycleSort = () => {
    const order: SortOption[] = ['newest', 'title', 'bpm'];
    const idx = order.indexOf(sortBy);
    setSortBy(order[(idx + 1) % order.length]);
  };

  const filterLabel =
    filterBy === 'all'
      ? 'Semua'
      : filterBy === 'bf16-cloud'
        ? 'bf16 Cloud'
        : filterBy === 'gguf-local'
          ? 'GGUF Local'
          : filterBy === 'stems'
            ? '4 Stems'
            : 'Masters';

  const sortLabel =
    sortBy === 'newest' ? 'Terbaru' : sortBy === 'title' ? 'A-Z' : 'BPM';

  const anySolo = (Object.keys(mixerState) as StemKey[]).some((k) => mixerState[k].solo);

  return (
    <section
      aria-label="Library Lagu dan Docked Audio Studio"
      className="flex-1 min-w-0 bg-[#08080A] flex flex-col xl:h-full xl:overflow-hidden"
    >
      {/* TOP AREA: PROJECT LIBRARY */}
      <div className="flex-1 min-h-[260px] xl:min-h-0 flex flex-col overflow-hidden">
        <div
          className="px-5 py-3.5 border-b border-white/[0.07] space-y-3 shrink-0"
          style={{
            background: `linear-gradient(180deg, ${project.theme.panelTintHex}, #111115)`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-base font-bold text-zinc-50">
                Library{' '}
                <span className="font-mono text-xs" style={{ color: project.theme.accentHex }}>
                  · {project.name}
                </span>
              </h2>
              <span className="text-xs font-mono tabular-nums text-zinc-400">
                {tracks.length} songs
              </span>
            </div>

            {isGeneratingSong && (
              <div className="inline-flex items-center gap-2 text-xs text-zinc-200">
                <Loader2
                  className="w-3.5 h-3.5 animate-spin"
                  style={{ color: project.theme.accentHex }}
                />
                <span className="truncate max-w-[260px]">{generationStage}</span>
              </div>
            )}
          </div>

          {/* Search + Filter & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your songs..."
                aria-label="Search your songs"
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#08080A] border border-white/[0.09] text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={cycleFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#08080A] hover:bg-white/[0.06] border border-white/[0.09] text-xs text-zinc-300 transition-colors whitespace-nowrap"
            >
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span>Filter: {filterLabel}</span>
            </button>

            <button
              type="button"
              onClick={cycleSort}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#08080A] hover:bg-white/[0.06] border border-white/[0.09] text-xs text-zinc-300 transition-colors whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sort: {sortLabel}</span>
            </button>
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredTracks.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Tidak ada lagu di proyek {project.name} yang cocok dengan filter atau pencarian.
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isSelected = activeTrack?.id === track.id;
              const isTrackPlaying = isSelected && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track.id)}
                  style={
                    isSelected
                      ? {
                          borderColor: `${project.theme.accentHex}75`,
                          backgroundColor: '#16161D',
                        }
                      : undefined
                  }
                  className={`group p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? ''
                      : 'bg-[#111115] border-white/[0.06] hover:border-white/[0.14] hover:bg-[#14141A]'
                  }`}
                >
                  {/* Left: Square Cover Art + Metadata */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-[#08080A] border border-white/[0.1] shrink-0 flex items-center justify-center">
                      {track.coverImage ? (
                        <img
                          src={track.coverImage}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-zinc-500" />
                      )}
                      <div
                        className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-4 h-4 text-white fill-current" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-zinc-100 truncate">
                          {track.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shrink-0 border ${
                            track.qualityMode === 'bf16-cloud'
                              ? project.theme.badgeBgClass
                              : 'bg-violet-600/20 text-violet-300 border-violet-500/35'
                          }`}
                        >
                          {track.qualityMode === 'bf16-cloud' ? 'bf16 Cloud' : 'GGUF Local'}
                        </span>
                        {track.stemsSplit && (
                          <span className="text-[10px] font-mono text-emerald-400 whitespace-nowrap shrink-0">
                            · 4 Stems
                          </span>
                        )}
                        {track.archivedMaster && (
                          <span className="text-[10px] font-mono text-amber-400 whitespace-nowrap shrink-0">
                            · Master
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 truncate">
                        {track.style} ·{' '}
                        <span className="font-mono tabular-nums">{track.bpm} BPM</span> ·{' '}
                        <span className="font-mono">{track.musicalKey}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Action Icons + Duration */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectTrack(track.id)}
                      aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleArchiveMaster(track.id)}
                      title={track.archivedMaster ? 'Tersimpan di Final Master Archive' : 'Arsipkan ke Final Master'}
                      aria-label={`Arsipkan ${track.title}`}
                      className={`w-8 h-8 rounded-md inline-flex items-center justify-center transition-colors ${
                        track.archivedMaster
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]'
                      }`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          onSelectTrack(track.id);
                        } else {
                          onDownloadMasterWav();
                        }
                      }}
                      title="Unduh Master WAV"
                      aria-label={`Unduh Master WAV ${track.title}`}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTrack(track.id)}
                      title="Hapus lagu"
                      aria-label={`Hapus ${track.title}`}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-mono tabular-nums text-zinc-400 pl-1 w-11 text-right">
                      {formatTimecode(track.durationSec)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* BOTTOM AREA: DOCKED AUDIO STUDIO & UVR5 STEM MIXER */}
      <div className="shrink-0 bg-[#111115] border-t border-white/[0.09] p-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {/* LEFT SIDE: Interactive Waveform + Transport + Split Stems (UVR5) */}
          <div className="xl:col-span-7 flex flex-col justify-between gap-3 bg-[#0B0B0E] border border-white/[0.07] rounded-lg p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-100 truncate">
                  {activeTrack ? activeTrack.title : 'Tidak ada trek aktif'}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {activeTrack
                    ? `${activeTrack.bpm} BPM · ${activeTrack.musicalKey} · ${
                        activeTrack.stemsSplit ? 'Mode 4-Stem Aktif' : 'Master Mix'
                      }`
                    : 'Pilih lagu atau klik Create'}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onDownloadMasterWav}
                  disabled={!activeAudio}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] font-medium text-zinc-200 transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  <Download className="w-3 h-3" />
                  <span>WAV</span>
                </button>

                <button
                  type="button"
                  onClick={onSplitStems}
                  disabled={!activeAudio || isSplittingStems}
                  style={
                    activeTrack?.stemsSplit
                      ? {
                          borderColor: `${project.theme.secondaryHex}88`,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                        }
                      : {
                          backgroundColor: project.theme.secondaryHex,
                        }
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap border ${
                    activeTrack?.stemsSplit
                      ? 'text-zinc-100'
                      : project.id === 'echonav' || project.id === 'vdnyx' || project.id === 'noczx'
                        ? 'border-transparent text-zinc-950 hover:brightness-110'
                        : 'border-transparent text-white hover:brightness-110'
                  } disabled:opacity-45`}
                >
                  {isSplittingStems ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Scissors className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isSplittingStems
                      ? splitStage || 'Memisahkan...'
                      : activeTrack?.stemsSplit
                        ? 'Stems Aktif (UVR5)'
                        : 'Split Stems (UVR5)'}
                  </span>
                </button>
              </div>
            </div>

            <WaveformPlayer
              peaks={activeAudio?.masterPeaks ?? []}
              currentTime={currentTime}
              duration={activeAudio?.master.duration ?? activeTrack?.durationSec ?? 0}
              accentHex={project.theme.accentHex}
              playheadHex={project.theme.secondaryHex}
              onSeek={onSeek}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onPrevTrack}
                  disabled={tracks.length < 2}
                  aria-label="Lagu sebelumnya"
                  className="w-8 h-8 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] inline-flex items-center justify-center text-zinc-300 disabled:opacity-40 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onStop}
                  disabled={!activeAudio}
                  aria-label="Stop"
                  className="w-8 h-8 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] inline-flex items-center justify-center text-zinc-300 disabled:opacity-40 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  disabled={!activeAudio}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  style={{ backgroundColor: project.theme.accentHex }}
                  className={`px-3.5 h-8 rounded-md hover:brightness-110 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40 transition-all ${
                    project.id === 'echonav' ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={onNextTrack}
                  disabled={tracks.length < 2}
                  aria-label="Lagu berikutnya"
                  className="w-8 h-8 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] inline-flex items-center justify-center text-zinc-300 disabled:opacity-40 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={masterVolume}
                  onChange={(e) => onChangeMasterVolume(Number(e.target.value))}
                  aria-label="Master Volume"
                  className="daw-slider w-24"
                />
                <span className="text-[11px] font-mono tabular-nums text-zinc-400 w-9 text-right">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: 4 VERTICAL STEM MIXER FADERS */}
          <div className="xl:col-span-5 bg-[#0B0B0E] border border-white/[0.07] rounded-lg p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="font-semibold text-zinc-200">UVR5 4-Channel Stem Mixer</span>
              <span className="font-mono text-zinc-500">
                {activeTrack?.stemsSplit ? 'Stems Active' : 'Klik Split Stems'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 flex-1">
              {STEM_CHANNELS.map(({ key, label, faderColor }) => {
                const ch = mixerState[key];
                const stemsReady = Boolean(activeTrack?.stemsSplit && activeAudio);
                const isAudible = stemsReady && !ch.muted && (!anySolo || ch.solo);
                const meterPct = isAudible ? Math.round(meters[key] * 100) : 0;

                return (
                  <div
                    key={key}
                    className={`rounded-md bg-[#111115] border px-2 py-2 flex flex-col items-center justify-between gap-2 transition-colors ${
                      ch.solo
                        ? 'border-violet-500/65'
                        : ch.muted
                          ? 'border-red-500/45 opacity-75'
                          : 'border-white/[0.07]'
                    }`}
                  >
                    <div className="text-center w-full">
                      <div className="text-[11px] font-semibold text-zinc-100 truncate">
                        {label}
                      </div>
                      <div className="text-[10px] font-mono tabular-nums text-zinc-400">
                        {Math.round(ch.volume * 100)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!stemsReady}
                        onClick={() => onToggleMute(key)}
                        aria-pressed={ch.muted}
                        aria-label={`Mute ${label}`}
                        className={`w-6 h-6 rounded text-[10px] font-bold font-mono border transition-colors disabled:opacity-35 ${
                          ch.muted
                            ? 'bg-red-600/30 border-red-500/80 text-red-200'
                            : 'bg-[#08080A] border-white/[0.1] text-zinc-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        M
                      </button>
                      <button
                        type="button"
                        disabled={!stemsReady}
                        onClick={() => onToggleSolo(key)}
                        aria-pressed={ch.solo}
                        aria-label={`Solo ${label}`}
                        className={`w-6 h-6 rounded text-[10px] font-bold font-mono border transition-colors disabled:opacity-35 ${
                          ch.solo
                            ? 'bg-violet-600/30 border-violet-500/80 text-violet-200'
                            : 'bg-[#08080A] border-white/[0.1] text-zinc-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        S
                      </button>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        !stemsReady ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <VerticalFader
                        value={ch.volume}
                        label={label}
                        accentClass={faderColor}
                        muted={ch.muted}
                        onChange={(vol) => onChangeStemVolume(key, vol)}
                      />

                      <div
                        aria-label={`Meter sinyal ${label}`}
                        className="w-2 h-24 rounded-full bg-[#08080A] border border-white/[0.07] overflow-hidden flex flex-col justify-end"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 transition-[height] duration-75"
                          style={{ height: `${meterPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!stemsReady}
                      onClick={() => onDownloadStemWav(key)}
                      aria-label={`Download ${label} WAV`}
                      className="w-full py-1 rounded bg-white/[0.05] hover:bg-white/[0.11] border border-white/[0.08] text-[10px] font-mono text-zinc-200 inline-flex items-center justify-center gap-1 transition-colors disabled:opacity-35"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>WAV</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
