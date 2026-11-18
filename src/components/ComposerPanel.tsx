import React, { useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Cloud,
  Eraser,
  HardDrive,
  Loader2,
  Music4,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type {
  ComposerTabMode,
  ProjectProfile,
  QualityMode,
  SongTrack,
} from '../types/studio';

interface ComposerPanelProps {
  project: ProjectProfile;
  tabMode: ComposerTabMode;
  title: string;
  stylePrompt: string;
  themeHint: string;
  lyrics: string;
  bpm: number;
  musicalKey: string;
  qualityMode: QualityMode;
  instrumentalOnly: boolean;
  abcScore: string;
  loraModel: string;
  loraStrength: number;
  vocalIdentity: string;
  tracks: SongTrack[];
  coverSourceTrackId: string;
  isComposingAI: boolean;
  isGeneratingSong: boolean;
  aiError: string | null;
  engineReadyLabel: string;
  onChangeTabMode: (mode: ComposerTabMode) => void;
  onChangeTitle: (v: string) => void;
  onChangeStyle: (v: string) => void;
  onChangeThemeHint: (v: string) => void;
  onChangeLyrics: (v: string) => void;
  onChangeBpm: (v: number) => void;
  onChangeKey: (v: string) => void;
  onChangeQualityMode: (mode: QualityMode) => void;
  onChangeInstrumentalOnly: (val: boolean) => void;
  onChangeAbcScore: (val: string) => void;
  onChangeLoraModel: (val: string) => void;
  onChangeLoraStrength: (val: number) => void;
  onChangeVocalIdentity: (val: string) => void;
  onSelectCoverSource: (trackId: string) => void;
  onComposeWithAI: (mode: 'full' | 'style-only') => void;
  onCreateSong: () => void;
}

const LYRIC_TAGS = ['[Verse]', '[Chorus]', '[Bridge]', '[Outro]'];
const KEY_OPTIONS = ['Am', 'C', 'Cm', 'D', 'Dm', 'Em', 'F', 'Fm', 'G'];

export const ComposerPanel: React.FC<ComposerPanelProps> = ({
  project,
  tabMode,
  title,
  stylePrompt,
  themeHint,
  lyrics,
  bpm,
  musicalKey,
  qualityMode,
  instrumentalOnly,
  abcScore,
  loraModel,
  loraStrength,
  vocalIdentity,
  tracks,
  coverSourceTrackId,
  isComposingAI,
  isGeneratingSong,
  aiError,
  engineReadyLabel,
  onChangeTabMode,
  onChangeTitle,
  onChangeStyle,
  onChangeThemeHint,
  onChangeLyrics,
  onChangeBpm,
  onChangeKey,
  onChangeQualityMode,
  onChangeInstrumentalOnly,
  onChangeAbcScore,
  onChangeLoraModel,
  onChangeLoraStrength,
  onChangeVocalIdentity,
  onSelectCoverSource,
  onComposeWithAI,
  onCreateSong,
}) => {
  const [openSections, setOpenSections] = useState<{
    style: boolean;
    lyrics: boolean;
    scoreLora: boolean;
    quality: boolean;
  }>({
    style: true,
    lyrics: true,
    scoreLora: false,
    quality: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const insertTag = (tag: string) => {
    const prefix =
      lyrics.trim().length > 0 && !lyrics.endsWith('\n')
        ? '\n\n'
        : lyrics.length > 0
          ? '\n'
          : '';
    onChangeLyrics(`${lyrics}${prefix}${tag}\n`);
  };

  return (
    <section
      aria-label="Panel Komposer Create Music"
      className="w-full xl:w-[400px] 2xl:w-[430px] shrink-0 bg-[#111115] border-b xl:border-b-0 xl:border-r border-white/[0.07] flex flex-col xl:h-full xl:overflow-hidden"
    >
      {/* Header + Engine Ready Indicator + Mode Tabs */}
      <div
        className="px-4 pt-3.5 pb-3 border-b border-white/[0.07] space-y-3 shrink-0"
        style={{
          background: `linear-gradient(180deg, ${project.theme.panelTintHex}, #111115)`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base font-bold tracking-tight text-zinc-50 whitespace-nowrap">
              Create music
            </h2>
            <span
              className="text-[11px] font-mono truncate"
              style={{ color: project.theme.accentHex }}
            >
              · {project.name}
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-400 whitespace-nowrap shrink-0">
            {engineReadyLabel}
          </span>
        </div>

        {/* Mode Tabs: Studio, Cover, Simple */}
        <div
          className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#08080A] border border-white/[0.07]"
          role="tablist"
          aria-label="Mode Komposer"
        >
          {(['studio', 'cover', 'simple'] as ComposerTabMode[]).map((mode) => {
            const active = tabMode === mode;
            const label = mode === 'studio' ? 'Studio' : mode === 'cover' ? 'Cover' : 'Simple';
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeTabMode(mode)}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1D1D24] text-zinc-50 border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Accordion Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {aiError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-2.5 rounded-lg bg-red-600/10 border border-red-500/35 text-xs text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Cover Tab Reference Selector */}
        {tabMode === 'cover' && (
          <div className="p-3 rounded-lg bg-[#0B0B0E] border border-white/[0.1] space-y-2">
            <label htmlFor="cover-source" className="block text-[11px] font-semibold text-zinc-300">
              Trek Referensi untuk Cover ({project.name})
            </label>
            <select
              id="cover-source"
              value={coverSourceTrackId}
              onChange={(e) => onSelectCoverSource(e.target.value)}
              className="w-full px-2.5 py-2 rounded-md bg-[#111115] border border-white/[0.1] text-xs text-zinc-100 focus:outline-none focus:border-white/30"
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.bpm} BPM · {t.musicalKey})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Simple Mode Streamlined Prompt */}
        {tabMode === 'simple' && (
          <div className="p-3.5 rounded-lg bg-[#0B0B0E] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-200">
                Deskripsi Ide Lagu Cepat
              </span>
              <button
                type="button"
                onClick={() => onComposeWithAI('full')}
                disabled={isComposingAI}
                style={{ backgroundColor: project.theme.accentHex }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white text-[11px] font-semibold hover:brightness-110 transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {isComposingAI ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                <span>AI Bantu Buat Lirik &amp; Style</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={themeHint}
              onChange={(e) => onChangeThemeHint(e.target.value)}
              placeholder={`Ceritakan suasana lagu ${project.genre} yang diinginkan...`}
              className="w-full px-3 py-2 rounded-md bg-[#111115] border border-white/[0.09] text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>
        )}

        {/* 1. STYLE ACCORDION (Project Isolated Presets) */}
        <div className="rounded-lg bg-[#0B0B0E] border border-white/[0.08] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('style')}
            aria-expanded={openSections.style}
            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {openSections.style ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
              <span className="text-xs font-bold tracking-wider text-zinc-200">STYLE</span>
            </div>
            {!openSections.style && (
              <span className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                {stylePrompt || 'Belum diisi'}
              </span>
            )}
          </button>

          {openSections.style && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-white/[0.05]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400">
                  Preset {project.name} · Genre &amp; Instrumen
                </span>
                <button
                  type="button"
                  onClick={() => onComposeWithAI('style-only')}
                  disabled={isComposingAI}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] font-semibold text-zinc-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isComposingAI ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" style={{ color: project.theme.accentHex }} />
                  )}
                  <span>AI Generate Style</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={stylePrompt}
                onChange={(e) => onChangeStyle(e.target.value)}
                aria-label="Prompt Style atau Genre Musik"
                placeholder="Deskripsikan genre, instrumen, karakter vokal, dan produksi..."
                className="w-full px-3 py-2 rounded-md bg-[#111115] border border-white/[0.09] text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
              />

              <div className="flex flex-wrap gap-1.5">
                {project.genrePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      onChangeStyle(preset.prompt);
                      onChangeBpm(preset.bpm);
                      onChangeKey(preset.key);
                    }}
                    className="px-2 py-1 rounded bg-[#15151B] hover:bg-white/[0.09] border border-white/[0.08] text-[11px] font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. LYRICS ACCORDION */}
        {tabMode !== 'simple' && (
          <div className="rounded-lg bg-[#0B0B0E] border border-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('lyrics')}
              aria-expanded={openSections.lyrics}
              className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {openSections.lyrics ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span className="text-xs font-bold tracking-wider text-zinc-200">LYRICS</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-zinc-500">
                {instrumentalOnly
                  ? 'Instrumental'
                  : `${lyrics.trim() ? lyrics.trim().split('\n').length : 0} baris`}
              </span>
            </button>

            {openSections.lyrics && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-white/[0.05]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onComposeWithAI('full')}
                    disabled={isComposingAI || instrumentalOnly}
                    style={{
                      borderColor: `${project.theme.accentHex}66`,
                      backgroundColor: project.theme.surfaceTint,
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold text-zinc-100 hover:brightness-110 transition-all disabled:opacity-45 whitespace-nowrap"
                  >
                    {isComposingAI ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" style={{ color: project.theme.accentHex }} />
                    )}
                    <span>AI Bantu Buat Lirik &amp; Style</span>
                  </button>

                  {lyrics && !instrumentalOnly && (
                    <button
                      type="button"
                      onClick={() => onChangeLyrics('')}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <Eraser className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {!instrumentalOnly && (
                  <input
                    type="text"
                    value={themeHint}
                    onChange={(e) => onChangeThemeHint(e.target.value)}
                    placeholder={`Tema lagu ${project.name} untuk Gemini (opsional)...`}
                    aria-label="Tema lagu opsional"
                    className="w-full px-2.5 py-1.5 rounded-md bg-[#111115] border border-white/[0.08] text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                )}

                <div className="flex flex-wrap gap-1">
                  {LYRIC_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      disabled={instrumentalOnly}
                      onClick={() => insertTag(tag)}
                      className="px-2 py-0.5 rounded bg-[#15151B] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] font-mono text-zinc-300 transition-colors disabled:opacity-40"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={6}
                  value={lyrics}
                  disabled={instrumentalOnly}
                  onChange={(e) => onChangeLyrics(e.target.value)}
                  aria-label="Editor Lirik"
                  placeholder={'[Verse]\nTulis bait...\n\n[Chorus]\nTulis reff...'}
                  className="w-full px-3 py-2 rounded-md bg-[#111115] border border-white/[0.09] text-xs font-mono leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-y disabled:opacity-40"
                />
              </div>
            )}
          </div>
        )}

        {/* 3. SCORE (ABC) & LORA ACCORDION (Project Isolated LoRAs) */}
        {tabMode === 'studio' && (
          <div className="rounded-lg bg-[#0B0B0E] border border-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('scoreLora')}
              aria-expanded={openSections.scoreLora}
              className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {openSections.scoreLora ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span className="text-xs font-bold tracking-wider text-zinc-200">
                  SCORE (ABC) &amp; LORA
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Opsional</span>
            </button>

            {openSections.scoreLora && (
              <div className="px-3.5 pb-3.5 pt-2 space-y-3 border-t border-white/[0.05]">
                <div>
                  <label htmlFor="abc-score" className="block text-[11px] text-zinc-400 mb-1">
                    Notasi ABC (Motif Melodi / Riff)
                  </label>
                  <textarea
                    id="abc-score"
                    rows={3}
                    value={abcScore}
                    onChange={(e) => onChangeAbcScore(e.target.value)}
                    placeholder={'X:1\nM:4/4\nK:Dm\nD2 F2 A2 d2 | c2 A2 G2 E2 |'}
                    className="w-full px-2.5 py-2 rounded-md bg-[#111115] border border-white/[0.09] text-[11px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <label htmlFor="lora-select" className="text-zinc-400">
                      LoRA Adapter ({project.name})
                    </label>
                    <span className="font-mono tabular-nums text-zinc-300">
                      Weight {loraStrength.toFixed(2)}
                    </span>
                  </div>
                  <select
                    id="lora-select"
                    value={loraModel}
                    onChange={(e) => onChangeLoraModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[#111115] border border-white/[0.09] text-xs font-mono text-zinc-200 focus:outline-none focus:border-white/30"
                  >
                    {project.loraModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={loraStrength}
                    onChange={(e) => onChangeLoraStrength(Number(e.target.value))}
                    aria-label="LoRA Strength"
                    className="daw-slider w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. QUALITY & ADVANCED ACCORDION */}
        <div className="rounded-lg bg-[#0B0B0E] border border-white/[0.08] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('quality')}
            aria-expanded={openSections.quality}
            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {openSections.quality ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
              <span className="text-xs font-bold tracking-wider text-zinc-200">
                QUALITY &amp; ADVANCED
              </span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-zinc-500">
              {bpm} BPM · {musicalKey}
            </span>
          </button>

          {openSections.quality && (
            <div className="px-3.5 pb-3.5 pt-2 space-y-3 border-t border-white/[0.05]">
              {/* Quality Radios */}
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mode Kualitas">
                <button
                  type="button"
                  role="radio"
                  aria-checked={qualityMode === 'bf16-cloud'}
                  onClick={() => onChangeQualityMode('bf16-cloud')}
                  style={
                    qualityMode === 'bf16-cloud'
                      ? {
                          borderColor: `${project.theme.accentHex}99`,
                          backgroundColor: project.theme.surfaceTint,
                        }
                      : undefined
                  }
                  className={`p-2.5 rounded-md border text-left transition-colors ${
                    qualityMode === 'bf16-cloud'
                      ? 'text-zinc-100'
                      : 'bg-[#111115] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Cloud
                      className="w-3.5 h-3.5 shrink-0"
                      style={{
                        color:
                          qualityMode === 'bf16-cloud' ? project.theme.accentHex : undefined,
                      }}
                    />
                    <span className="truncate">Max Quality bf16 - Cloud</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={qualityMode === 'gguf-local'}
                  onClick={() => onChangeQualityMode('gguf-local')}
                  style={
                    qualityMode === 'gguf-local'
                      ? {
                          borderColor: `${project.theme.secondaryHex}99`,
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        }
                      : undefined
                  }
                  className={`p-2.5 rounded-md border text-left transition-colors ${
                    qualityMode === 'gguf-local'
                      ? 'text-zinc-100'
                      : 'bg-[#111115] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <HardDrive
                      className="w-3.5 h-3.5 shrink-0"
                      style={{
                        color:
                          qualityMode === 'gguf-local' ? project.theme.secondaryHex : undefined,
                      }}
                    />
                    <span className="truncate">Draft GGUF - Local</span>
                  </div>
                </button>
              </div>

              {/* Vocal Identity Selector (Isolated per project) */}
              <div>
                <label htmlFor="vocal-identity" className="block text-[11px] text-zinc-400 mb-1">
                  Vocal Identity ({project.name})
                </label>
                <select
                  id="vocal-identity"
                  value={vocalIdentity}
                  onChange={(e) => onChangeVocalIdentity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#111115] border border-white/[0.09] text-xs text-zinc-100 focus:outline-none focus:border-white/30"
                >
                  {project.vocalOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title + BPM + Key */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <label htmlFor="adv-title" className="block text-[11px] text-zinc-400 mb-1">
                    Judul Lagu
                  </label>
                  <input
                    id="adv-title"
                    type="text"
                    value={title}
                    onChange={(e) => onChangeTitle(e.target.value)}
                    placeholder={project.starterTitle}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[#111115] border border-white/[0.09] text-xs text-zinc-100 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="col-span-3">
                  <label htmlFor="adv-bpm" className="block text-[11px] text-zinc-400 mb-1">
                    BPM
                  </label>
                  <input
                    id="adv-bpm"
                    type="number"
                    min={65}
                    max={165}
                    value={bpm}
                    onChange={(e) =>
                      onChangeBpm(Math.min(165, Math.max(65, Number(e.target.value) || 120)))
                    }
                    className="w-full px-2 py-1.5 rounded-md bg-[#111115] border border-white/[0.09] text-xs font-mono tabular-nums text-zinc-100 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="col-span-3">
                  <label htmlFor="adv-key" className="block text-[11px] text-zinc-400 mb-1">
                    Key
                  </label>
                  <select
                    id="adv-key"
                    value={musicalKey}
                    onChange={(e) => onChangeKey(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-[#111115] border border-white/[0.09] text-xs font-mono text-zinc-100 focus:outline-none focus:border-white/30"
                  >
                    {KEY_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Footer: Instrumental Checkbox + Capsule Gradient Create Button */}
      <div className="p-4 border-t border-white/[0.07] bg-[#0E0E12] space-y-3 shrink-0">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={instrumentalOnly}
            onChange={(e) => onChangeInstrumentalOnly(e.target.checked)}
            style={{ accentColor: project.theme.accentHex }}
            className="w-4 h-4 rounded border-white/20 bg-[#08080A] cursor-pointer"
          />
          <span className="text-xs font-medium text-zinc-300">Instrumental only</span>
        </label>

        <button
          type="button"
          onClick={onCreateSong}
          disabled={isGeneratingSong}
          style={{
            background: `linear-gradient(90deg, ${project.theme.accentHex}, ${project.theme.secondaryHex})`,
          }}
          className={`w-full h-11 rounded-full hover:brightness-110 active:scale-[0.99] text-sm font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
            project.id === 'echonav' ? 'text-zinc-950' : 'text-white'
          }`}
        >
          {isGeneratingSong ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendering...</span>
            </>
          ) : (
            <>
              <Music4 className="w-4 h-4" />
              <span>Create</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
