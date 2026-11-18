import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProjectHub } from './components/ProjectHub';
import { GlobalToolsBar } from './components/GlobalToolsBar';
import { EngineSidebar } from './components/EngineSidebar';
import { ComposerPanel } from './components/ComposerPanel';
import { StudioMixerPanel } from './components/StudioMixerPanel';
import {
  LyricsCompositionView,
  ProductionQCView,
  ProjectLibraryView,
  ProjectSettingsView,
} from './components/ProjectSubViews';
import { EngineConfigModal } from './components/EngineConfigModal';
import { ActivityModal } from './components/ActivityModal';
import { StudioAudioPlayer } from './audio/StudioAudioPlayer';
import { downloadWavFromBuffer, renderTrackStems } from './audio/synthEngine';
import {
  PROJECT_PROFILES,
  createAllInitialWorkspaces,
  createInitialWorkspaceState,
} from './data/projects';
import type {
  ActivityLogItem,
  EngineSettings,
  MixerState,
  ProjectId,
  ProjectWorkspaceState,
  QCRecord,
  RenderedTrackAudio,
  SongTrack,
  StemKey,
  WorkspaceSection,
} from './types/studio';

const STORAGE_ENGINE_KEY = 'bushido_art_engines_v3';
const STORAGE_WORKSPACES_KEY = 'bushido_art_workspaces_v3';

const DEFAULT_ENGINES: EngineSettings = {
  colabCloud: {
    url: 'https://yue2-max-colab.ngrok-free.app',
    status: 'disconnected',
    simulated: false,
    lastMessage: 'Masukkan URL Colab YuE2 Max lalu klik Cek Koneksi atau aktifkan Simulasi.',
  },
  localPc: {
    url: 'http://127.0.0.1:7865',
    status: 'disconnected',
    simulated: false,
    lastMessage: 'Masukkan URL UVR5 GTX 1060 lokal lalu klik Cek Koneksi atau aktifkan Simulasi.',
  },
};

const DEFAULT_MIXER: MixerState = {
  vocals: { volume: 0.9, muted: false, solo: false },
  drums: { volume: 0.9, muted: false, solo: false },
  bass: { volume: 0.85, muted: false, solo: false },
  other: { volume: 0.8, muted: false, solo: false },
};

function sanitizeFilename(name: string): string {
  return (name || 'track')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function pickCoverForTrack(projectId: ProjectId, style: string): string {
  if (projectId === 'bushido') {
    const s = style.toLowerCase();
    if (/gamelan|javanese|balinese|bonang|gangsa/.test(s)) {
      return '/src/assets/images/cover_gamelan_metal_1795017671881.jpg';
    }
    if (/taiko|japanese|shamisen|j-rock/.test(s)) {
      return '/src/assets/images/cover_taiko_rock_1795017670473.jpg';
    }
    if (/nu metal/.test(s)) {
      return '/src/assets/images/cover_nu_metal_1795017671881.jpg';
    }
  }
  return PROJECT_PROFILES[projectId].coverImage;
}

function computeAudioMetrics(buffer: AudioBuffer): { peakDb: string; lufsEstimate: string; clippingFree: boolean } {
  const ch0 = buffer.getChannelData(0);
  const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;
  let maxSample = 0.0001;
  let sumSq = 0;
  const step = Math.max(1, Math.floor(ch0.length / 20000));
  let count = 0;

  for (let i = 0; i < ch0.length; i += step) {
    const l = Math.abs(ch0[i]);
    const r = Math.abs(ch1[i]);
    const m = Math.max(l, r);
    if (m > maxSample) maxSample = m;
    sumSq += (ch0[i] * ch0[i] + ch1[i] * ch1[i]) * 0.5;
    count++;
  }

  const peakDbVal = 20 * Math.log10(maxSample);
  const rms = Math.sqrt(sumSq / Math.max(1, count));
  const lufsVal = 20 * Math.log10(Math.max(0.0001, rms)) - 0.691;

  return {
    peakDb: `${peakDbVal.toFixed(1)} dBFS`,
    lufsEstimate: `${lufsVal.toFixed(1)} LUFS`,
    clippingFree: maxSample < 0.99,
  };
}

export default function App() {
  // Top-level Route State: 'hub' landing page vs 'workspace'
  const [viewMode, setViewMode] = useState<'hub' | 'workspace'>('hub');
  const [activeProjectId, setActiveProjectId] = useState<ProjectId>('bushido');
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('create');

  // Global Modals & Activity
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Engine Settings State (Global)
  const [engineSettings, setEngineSettings] = useState<EngineSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ENGINE_KEY);
      if (saved) return JSON.parse(saved) as EngineSettings;
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_ENGINES;
  });

  // Isolated Project Workspaces (5 independent profiles)
  const [workspaces, setWorkspaces] = useState<Record<ProjectId, ProjectWorkspaceState>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WORKSPACES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Record<ProjectId, ProjectWorkspaceState>>;
        const defaults = createAllInitialWorkspaces();
        return {
          bushido: parsed.bushido ?? defaults.bushido,
          ezyvx: parsed.ezyvx ?? defaults.ezyvx,
          noczx: parsed.noczx ?? defaults.noczx,
          echonav: parsed.echonav ?? defaults.echonav,
          vdnyx: parsed.vdnyx ?? defaults.vdnyx,
        };
      }
    } catch {
      // Ignore parse errors
    }
    return createAllInitialWorkspaces();
  });

  // Audio Synthesis Cache & Processing States
  const [audioCache, setAudioCache] = useState<Record<string, RenderedTrackAudio>>({});
  const [isComposingAI, setIsComposingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [isSplittingStems, setIsSplittingStems] = useState(false);
  const [splitStage, setSplitStage] = useState('');

  // Transport & Mixer State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [mixerState, setMixerState] = useState<MixerState>(DEFAULT_MIXER);
  const [meters, setMeters] = useState<{ master: number } & Record<StemKey, number>>({
    master: 0,
    vocals: 0,
    drums: 0,
    bass: 0,
    other: 0,
  });

  const playerRef = useRef<StudioAudioPlayer | null>(null);

  const activeProject = PROJECT_PROFILES[activeProjectId];
  const activeWorkspace = workspaces[activeProjectId];
  const activeTrack = useMemo(
    () => activeWorkspace.tracks.find((t) => t.id === activeWorkspace.activeTrackId) ?? null,
    [activeWorkspace.tracks, activeWorkspace.activeTrackId]
  );
  const activeAudio = activeTrack ? audioCache[activeTrack.id] ?? null : null;

  const engineReadyLabel = useMemo(() => {
    if (engineSettings.colabCloud.status === 'connected') {
      return engineSettings.colabCloud.simulated ? 'Engine ready (Sim)' : 'Engine ready';
    }
    return 'Engine ready';
  }, [engineSettings.colabCloud]);

  const pushActivity = useCallback(
    (
      kind: ActivityLogItem['kind'],
      title: string,
      detail: string,
      projectId?: ProjectId
    ) => {
      const entry: ActivityLogItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: formatNowTime(),
        projectId,
        kind,
        title: projectId ? `[${PROJECT_PROFILES[projectId].name}] ${title}` : title,
        detail,
      };
      setActivityLogs((prev) => [entry, ...prev.slice(0, 39)]);
      if (projectId) {
        setWorkspaces((prev) => ({
          ...prev,
          [projectId]: {
            ...prev[projectId],
            generationHistory: [entry, ...prev[projectId].generationHistory.slice(0, 29)],
          },
        }));
      }
    },
    []
  );

  // Helper to update active project's composer fields cleanly
  const updateActiveComposer = useCallback(
    (patch: Partial<ProjectWorkspaceState['composer']>) => {
      setWorkspaces((prev) => ({
        ...prev,
        [activeProjectId]: {
          ...prev[activeProjectId],
          composer: {
            ...prev[activeProjectId].composer,
            ...patch,
          },
        },
      }));
    },
    [activeProjectId]
  );

  // Persist Engine Settings & Isolated Workspaces
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ENGINE_KEY, JSON.stringify(engineSettings));
    } catch {
      // Ignore quota errors
    }
  }, [engineSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WORKSPACES_KEY, JSON.stringify(workspaces));
    } catch {
      // Ignore quota errors
    }
  }, [workspaces]);

  // Initialize StudioAudioPlayer
  useEffect(() => {
    const player = new StudioAudioPlayer();
    player.setCallbacks(
      (sec, playing) => {
        setCurrentTime(sec);
        setIsPlaying(playing);
      },
      (lvl) => {
        setMeters(lvl);
      }
    );
    playerRef.current = player;
    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, []);

  // Ensure active track in active project has rendered Web Audio buffers
  useEffect(() => {
    if (!activeTrack) return;
    let cancelled = false;

    const ensureAudio = async () => {
      let rendered = audioCache[activeTrack.id];
      if (!rendered) {
        rendered = await renderTrackStems(activeTrack);
        if (cancelled) return;
        setAudioCache((prev) => ({ ...prev, [activeTrack.id]: rendered }));
      }
      playerRef.current?.loadTrack(rendered, activeTrack.stemsSplit, true);
    };

    void ensureAudio();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack?.id, activeProjectId]);

  useEffect(() => {
    if (!activeTrack) return;
    playerRef.current?.setStemsMode(activeTrack.stemsSplit);
  }, [activeTrack?.stemsSplit]);

  useEffect(() => {
    playerRef.current?.setMixerState(mixerState);
  }, [mixerState]);

  // Navigation Handlers
  const handleEnterProject = useCallback(
    (projectId: ProjectId, section: WorkspaceSection = 'create') => {
      if (projectId !== activeProjectId) {
        playerRef.current?.stop();
        setMixerState(DEFAULT_MIXER);
        setAiError(null);
      }
      setActiveProjectId(projectId);
      setActiveSection(section);
      setViewMode('workspace');
    },
    [activeProjectId]
  );

  const handleReturnToHub = useCallback(() => {
    playerRef.current?.stop();
    setViewMode('hub');
  }, []);

  const handleSwitchProject = useCallback(
    (projectId: ProjectId) => {
      if (projectId === activeProjectId) return;
      playerRef.current?.stop();
      setMixerState(DEFAULT_MIXER);
      setAiError(null);
      setActiveProjectId(projectId);
    },
    [activeProjectId]
  );

  // Engine Config Handlers
  const handleUpdateUrl = useCallback((target: 'colabCloud' | 'localPc', url: string) => {
    setEngineSettings((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        url,
        status:
          prev[target].simulated && prev[target].status === 'connected'
            ? 'connected'
            : 'disconnected',
      },
    }));
  }, []);

  const handlePingEngine = useCallback(
    async (target: 'colabCloud' | 'localPc') => {
      const currentUrl = engineSettings[target].url.trim();
      setEngineSettings((prev) => ({
        ...prev,
        [target]: {
          ...prev[target],
          status: 'connecting',
          simulated: false,
          lastMessage: 'Menghubungi endpoint API...',
        },
      }));

      try {
        const res = await fetch('/api/engine/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl, engine: target }),
        });
        const data = (await res.json()) as { connected: boolean; message: string };
        setEngineSettings((prev) => ({
          ...prev,
          [target]: {
            ...prev[target],
            status: data.connected ? 'connected' : 'disconnected',
            simulated: false,
            lastMessage: data.message,
          },
        }));
        pushActivity(
          'engine',
          `Cek Koneksi ${target === 'colabCloud' ? 'YuE2 Max Cloud' : 'UVR5 GTX 1060'}`,
          data.message
        );
      } catch {
        setEngineSettings((prev) => ({
          ...prev,
          [target]: {
            ...prev[target],
            status: 'disconnected',
            simulated: false,
            lastMessage: 'Gagal memeriksa koneksi endpoint.',
          },
        }));
      }
    },
    [engineSettings, pushActivity]
  );

  const handleToggleSimulation = useCallback(
    (target: 'colabCloud' | 'localPc') => {
      setEngineSettings((prev) => {
        const currentlySimConnected =
          prev[target].simulated && prev[target].status === 'connected';
        const nextStatus = currentlySimConnected ? 'disconnected' : 'connected';
        const msg = currentlySimConnected
          ? 'Mode simulasi dimatikan.'
          : target === 'colabCloud'
            ? 'Terhubung via simulasi YuE2 Max Cloud (Web Audio Synth).'
            : 'Terhubung via simulasi UVR5 GTX 1060 (4-Stem Synth).';

        pushActivity(
          'engine',
          `${target === 'colabCloud' ? 'YuE2 Max Cloud' : 'UVR5 GTX 1060'} ${
            currentlySimConnected ? 'Simulasi Dimatikan' : 'Simulasi Aktif'
          }`,
          msg
        );

        return {
          ...prev,
          [target]: {
            ...prev[target],
            status: nextStatus,
            simulated: !currentlySimConnected,
            lastMessage: msg,
          },
        };
      });
    },
    [pushActivity]
  );

  // Gemini AI Composer Handler (Respects Active Project Identity)
  const handleComposeWithAI = useCallback(
    async (mode: 'full' | 'style-only') => {
      setIsComposingAI(true);
      setAiError(null);
      const comp = activeWorkspace.composer;

      const projectStyleContext = `${activeProject.genre} (${activeProject.description}). Vocal identity: ${comp.vocalIdentity}. Current prompt: ${comp.stylePrompt}`;

      try {
        const res = await fetch('/api/gemini/compose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            styleHint: projectStyleContext,
            themeHint: comp.themeHint,
            currentLyrics: comp.lyrics,
          }),
        });
        const data = (await res.json()) as {
          title?: string;
          stylePrompt?: string;
          bpm?: number;
          musicalKey?: string;
          lyrics?: string;
          error?: string;
        };

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Gagal menyusun lirik dengan Gemini.');
        }

        const patch: Partial<ProjectWorkspaceState['composer']> = {};
        if (data.stylePrompt) patch.stylePrompt = data.stylePrompt;
        if (data.bpm) patch.bpm = data.bpm;
        if (data.musicalKey) patch.musicalKey = data.musicalKey;
        if (mode === 'full') {
          if (data.title) patch.title = data.title;
          if (data.lyrics) patch.lyrics = data.lyrics;
        }
        updateActiveComposer(patch);

        pushActivity(
          'compose',
          mode === 'style-only' ? 'Gemini Generate Style' : 'Gemini Buat Lirik & Style',
          `${data.title || comp.title} · ${data.bpm || comp.bpm} BPM (${data.musicalKey || comp.musicalKey})`,
          activeProjectId
        );
      } catch (err) {
        setAiError(
          err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi Gemini.'
        );
      } finally {
        setIsComposingAI(false);
      }
    },
    [activeWorkspace.composer, activeProject, activeProjectId, updateActiveComposer, pushActivity]
  );

  // Create / Generate Full Song inside active isolated project
  const handleCreateSong = useCallback(async () => {
    if (isGeneratingSong) return;
    playerRef.current?.stop();
    setIsGeneratingSong(true);

    const comp = activeWorkspace.composer;
    const engineLabel =
      comp.qualityMode === 'bf16-cloud' ? 'YuE2 Max bf16 - Cloud' : 'Draft GGUF - Local';

    setGenerationStage(`Inisialisasi ${engineLabel}...`);
    await new Promise((r) => setTimeout(r, 320));

    setGenerationStage(`Mensintesis ${activeProject.name} (${comp.bpm} BPM)...`);
    const bars = Math.max(8, Math.min(12, Math.round((22 * comp.bpm) / 240)));
    const exactDuration = Number(((60 / comp.bpm) * 4 * bars).toFixed(2));
    const finalStyle = comp.stylePrompt.trim() || activeProject.genre;

    const newTrack: SongTrack = {
      id: `${activeProjectId}-track-${Date.now()}`,
      projectId: activeProjectId,
      title: comp.title.trim() || `${activeProject.name} Track (${comp.bpm} BPM)`,
      style: finalStyle,
      lyrics: comp.instrumentalOnly ? '' : comp.lyrics.trim(),
      qualityMode: comp.qualityMode,
      bpm: comp.bpm,
      musicalKey: comp.musicalKey,
      durationSec: exactDuration,
      createdAt: new Date().toISOString(),
      stemsSplit: false,
      seed: Math.floor(Math.random() * 900000) + 10000,
      instrumentalOnly: comp.instrumentalOnly,
      abcScore: comp.abcScore,
      loraModel: comp.loraModel,
      loraStrength: comp.loraStrength,
      vocalIdentity: comp.vocalIdentity,
      coverImage: pickCoverForTrack(activeProjectId, finalStyle),
    };

    const rendered = await renderTrackStems(newTrack);
    setGenerationStage('Menyelesaikan master stereo 44.1 kHz...');
    await new Promise((r) => setTimeout(r, 240));

    setAudioCache((prev) => ({ ...prev, [newTrack.id]: rendered }));
    setWorkspaces((prev) => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        tracks: [newTrack, ...prev[activeProjectId].tracks],
        activeTrackId: newTrack.id,
      },
    }));
    setMixerState(DEFAULT_MIXER);
    setIsGeneratingSong(false);
    setGenerationStage('');

    pushActivity(
      'generate',
      `Generate Full Song: ${newTrack.title}`,
      `${engineLabel} · ${newTrack.bpm} BPM · ${newTrack.musicalKey}${
        comp.instrumentalOnly ? ' · Instrumental' : ''
      }`,
      activeProjectId
    );

    playerRef.current?.loadTrack(rendered, false, true);
    void playerRef.current?.play(0);
  }, [isGeneratingSong, activeWorkspace.composer, activeProject, activeProjectId, pushActivity]);

  // Split Stems (UVR5)
  const handleSplitStems = useCallback(async () => {
    if (!activeTrack || !activeAudio || isSplittingStems) return;
    if (activeTrack.stemsSplit) return;

    setIsSplittingStems(true);
    setSplitStage('Memuat UVR5 GTX 1060...');
    await new Promise((r) => setTimeout(r, 320));

    setSplitStage('Memisahkan Vocals, Drums, Bass, Other...');
    await new Promise((r) => setTimeout(r, 420));

    setWorkspaces((prev) => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        tracks: prev[activeProjectId].tracks.map((t) =>
          t.id === activeTrack.id ? { ...t, stemsSplit: true } : t
        ),
      },
    }));

    setMixerState(DEFAULT_MIXER);
    playerRef.current?.setMixerState(DEFAULT_MIXER);
    playerRef.current?.setStemsMode(true);

    pushActivity(
      'uvr5',
      `UVR5 Split Stems: ${activeTrack.title}`,
      '4 jalur stem terpisah (Vocals, Drums, Bass, Other)',
      activeProjectId
    );

    setIsSplittingStems(false);
    setSplitStage('');
  }, [activeTrack, activeAudio, isSplittingStems, activeProjectId, pushActivity]);

  // Track Selection, Prev/Next, Archive, Deletion
  const handleSelectTrack = useCallback(
    (trackId: string) => {
      if (trackId === activeWorkspace.activeTrackId) {
        if (isPlaying) {
          playerRef.current?.pause();
        } else {
          void playerRef.current?.play();
        }
        return;
      }
      playerRef.current?.stop();
      setMixerState(DEFAULT_MIXER);
      setWorkspaces((prev) => ({
        ...prev,
        [activeProjectId]: {
          ...prev[activeProjectId],
          activeTrackId: trackId,
        },
      }));
    },
    [activeWorkspace.activeTrackId, activeProjectId, isPlaying]
  );

  const handlePrevTrack = useCallback(() => {
    const list = activeWorkspace.tracks;
    if (list.length < 2 || !activeWorkspace.activeTrackId) return;
    const idx = list.findIndex((t) => t.id === activeWorkspace.activeTrackId);
    const prevIdx = (idx - 1 + list.length) % list.length;
    playerRef.current?.stop();
    setMixerState(DEFAULT_MIXER);
    setWorkspaces((prev) => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        activeTrackId: list[prevIdx].id,
      },
    }));
  }, [activeWorkspace.tracks, activeWorkspace.activeTrackId, activeProjectId]);

  const handleNextTrack = useCallback(() => {
    const list = activeWorkspace.tracks;
    if (list.length < 2 || !activeWorkspace.activeTrackId) return;
    const idx = list.findIndex((t) => t.id === activeWorkspace.activeTrackId);
    const nextIdx = (idx + 1) % list.length;
    playerRef.current?.stop();
    setMixerState(DEFAULT_MIXER);
    setWorkspaces((prev) => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        activeTrackId: list[nextIdx].id,
      },
    }));
  }, [activeWorkspace.tracks, activeWorkspace.activeTrackId, activeProjectId]);

  const handleDeleteTrack = useCallback(
    (trackId: string) => {
      setWorkspaces((prev) => {
        const ws = prev[activeProjectId];
        const nextTracks = ws.tracks.filter((t) => t.id !== trackId);
        let nextActive = ws.activeTrackId;
        if (ws.activeTrackId === trackId) {
          playerRef.current?.stop();
          nextActive = nextTracks[0]?.id ?? null;
        }
        return {
          ...prev,
          [activeProjectId]: {
            ...ws,
            tracks: nextTracks,
            activeTrackId: nextActive,
          },
        };
      });
    },
    [activeProjectId]
  );

  const handleToggleArchiveMaster = useCallback(
    (trackId: string) => {
      setWorkspaces((prev) => ({
        ...prev,
        [activeProjectId]: {
          ...prev[activeProjectId],
          tracks: prev[activeProjectId].tracks.map((t) =>
            t.id === trackId ? { ...t, archivedMaster: !t.archivedMaster } : t
          ),
        },
      }));
    },
    [activeProjectId]
  );

  const handleSelectCoverSource = useCallback(
    (trackId: string) => {
      const found = activeWorkspace.tracks.find((t) => t.id === trackId);
      if (found) {
        updateActiveComposer({
          coverSourceTrackId: trackId,
          title: `${found.title} (Cover)`,
          lyrics: found.lyrics,
          bpm: found.bpm,
          musicalKey: found.musicalKey,
        });
      } else {
        updateActiveComposer({ coverSourceTrackId: trackId });
      }
    },
    [activeWorkspace.tracks, updateActiveComposer]
  );

  // Run Production QC on a track in the active project
  const handleRunQC = useCallback(
    async (track: SongTrack) => {
      let rendered = audioCache[track.id];
      if (!rendered) {
        rendered = await renderTrackStems(track);
        setAudioCache((prev) => ({ ...prev, [track.id]: rendered }));
      }
      const metrics = computeAudioMetrics(rendered.master);
      const record: QCRecord = {
        id: `qc-${Date.now()}`,
        trackId: track.id,
        trackTitle: track.title,
        checkedAt: formatNowTime(),
        peakDb: metrics.peakDb,
        lufsEstimate: metrics.lufsEstimate,
        clippingFree: metrics.clippingFree,
        stemsReady: track.stemsSplit,
        status: metrics.clippingFree ? 'passed' : 'review',
        notes: metrics.clippingFree
          ? `Headroom aman (${metrics.peakDb}), bebas clipping. ${
              track.stemsSplit ? '4 stem UVR5 terverifikasi.' : 'Siap untuk pemisahan stem UVR5.'
            }`
          : 'Terdeteksi puncak mendekati 0 dBFS, disarankan turunkan gain master.',
      };

      setWorkspaces((prev) => ({
        ...prev,
        [activeProjectId]: {
          ...prev[activeProjectId],
          qcHistory: [record, ...prev[activeProjectId].qcHistory],
        },
      }));

      pushActivity(
        'qc',
        `Production QC: ${track.title}`,
        `Peak ${metrics.peakDb} · ${metrics.lufsEstimate}`,
        activeProjectId
      );
    },
    [audioCache, activeProjectId, pushActivity]
  );

  const handleResetActiveProject = useCallback(() => {
    playerRef.current?.stop();
    setWorkspaces((prev) => ({
      ...prev,
      [activeProjectId]: createInitialWorkspaceState(PROJECT_PROFILES[activeProjectId]),
    }));
  }, [activeProjectId]);

  // Transport & Mixer Controls
  const handleTogglePlay = useCallback(() => {
    if (!activeAudio) return;
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      void playerRef.current?.play();
    }
  }, [activeAudio, isPlaying]);

  const handleStop = useCallback(() => {
    playerRef.current?.stop();
  }, []);

  const handleSeek = useCallback((sec: number) => {
    playerRef.current?.seekTo(sec);
  }, []);

  const handleChangeMasterVolume = useCallback((vol: number) => {
    setMasterVolume(vol);
    playerRef.current?.setMasterVolume(vol);
  }, []);

  const handleChangeStemVolume = useCallback((stem: StemKey, volume: number) => {
    setMixerState((prev) => ({
      ...prev,
      [stem]: { ...prev[stem], volume },
    }));
  }, []);

  const handleToggleMute = useCallback((stem: StemKey) => {
    setMixerState((prev) => ({
      ...prev,
      [stem]: { ...prev[stem], muted: !prev[stem].muted },
    }));
  }, []);

  const handleToggleSolo = useCallback((stem: StemKey) => {
    setMixerState((prev) => ({
      ...prev,
      [stem]: { ...prev[stem], solo: !prev[stem].solo },
    }));
  }, []);

  const handleDownloadMasterWav = useCallback(
    async (explicitTrackId?: string) => {
      const targetTrack = explicitTrackId
        ? activeWorkspace.tracks.find((t) => t.id === explicitTrackId)
        : activeTrack;
      if (!targetTrack) return;

      let rendered = audioCache[targetTrack.id];
      if (!rendered) {
        rendered = await renderTrackStems(targetTrack);
        setAudioCache((prev) => ({ ...prev, [targetTrack.id]: rendered }));
      }
      downloadWavFromBuffer(rendered.master, `${sanitizeFilename(targetTrack.title)}_master.wav`);
    },
    [activeWorkspace.tracks, activeTrack, audioCache]
  );

  const handleDownloadStemWav = useCallback(
    (stem: StemKey) => {
      if (!activeTrack || !activeAudio) return;
      downloadWavFromBuffer(
        activeAudio.stems[stem],
        `${sanitizeFilename(activeTrack.title)}_${stem}.wav`
      );
    },
    [activeTrack, activeAudio]
  );

  return (
    <>
      {viewMode === 'hub' ? (
        <ProjectHub
          workspaces={workspaces}
          lastActiveProjectId={activeProjectId}
          engineSettings={engineSettings}
          activityCount={activityLogs.length}
          onEnterProject={handleEnterProject}
          onOpenEngineModal={() => setIsEngineModalOpen(true)}
          onOpenActivityModal={() => setIsActivityModalOpen(true)}
        />
      ) : (
        <div
          style={{ '--project-accent': activeProject.theme.accentHex } as React.CSSProperties}
          className="min-h-screen w-full bg-[#08080A] text-zinc-100 flex flex-col xl:h-screen xl:overflow-hidden"
        >
          {/* Persistent Top Project Navigation & Global Tools Bar */}
          <GlobalToolsBar
            activeProject={activeProject}
            activeSection={activeSection}
            engineSettings={engineSettings}
            activityCount={activityLogs.length}
            onReturnToHub={handleReturnToHub}
            onSwitchProject={handleSwitchProject}
            onSelectSection={setActiveSection}
            onOpenEngineModal={() => setIsEngineModalOpen(true)}
            onOpenActivityModal={() => setIsActivityModalOpen(true)}
          />

          {/* Main Project Workspace */}
          <div className="flex-1 min-h-0 flex flex-col xl:flex-row xl:overflow-hidden">
            {/* Column 1: Compact Left Studio Navigation & Telemetry */}
            <EngineSidebar
              activeProject={activeProject}
              activeSection={activeSection}
              settings={engineSettings}
              isProcessingAudio={isGeneratingSong}
              isSplittingStems={isSplittingStems}
              trackCount={activeWorkspace.tracks.length}
              activityCount={activityLogs.length}
              onSelectSection={setActiveSection}
              onOpenEngineModal={() => setIsEngineModalOpen(true)}
              onOpenActivityModal={() => setIsActivityModalOpen(true)}
            />

            {/* Column 2 & 3 Dynamic Workspace Content */}
            <main className="flex-1 min-w-0 flex flex-col xl:flex-row xl:overflow-hidden">
              {activeSection === 'create' && (
                <>
                  <ComposerPanel
                    project={activeProject}
                    tabMode={activeWorkspace.composer.tabMode}
                    title={activeWorkspace.composer.title}
                    stylePrompt={activeWorkspace.composer.stylePrompt}
                    themeHint={activeWorkspace.composer.themeHint}
                    lyrics={activeWorkspace.composer.lyrics}
                    bpm={activeWorkspace.composer.bpm}
                    musicalKey={activeWorkspace.composer.musicalKey}
                    qualityMode={activeWorkspace.composer.qualityMode}
                    instrumentalOnly={activeWorkspace.composer.instrumentalOnly}
                    abcScore={activeWorkspace.composer.abcScore}
                    loraModel={activeWorkspace.composer.loraModel}
                    loraStrength={activeWorkspace.composer.loraStrength}
                    vocalIdentity={activeWorkspace.composer.vocalIdentity}
                    tracks={activeWorkspace.tracks}
                    coverSourceTrackId={activeWorkspace.composer.coverSourceTrackId}
                    isComposingAI={isComposingAI}
                    isGeneratingSong={isGeneratingSong}
                    aiError={aiError}
                    engineReadyLabel={engineReadyLabel}
                    onChangeTabMode={(tabMode) => updateActiveComposer({ tabMode })}
                    onChangeTitle={(title) => updateActiveComposer({ title })}
                    onChangeStyle={(stylePrompt) => updateActiveComposer({ stylePrompt })}
                    onChangeThemeHint={(themeHint) => updateActiveComposer({ themeHint })}
                    onChangeLyrics={(lyrics) => updateActiveComposer({ lyrics })}
                    onChangeBpm={(bpm) => updateActiveComposer({ bpm })}
                    onChangeKey={(musicalKey) => updateActiveComposer({ musicalKey })}
                    onChangeQualityMode={(qualityMode) => updateActiveComposer({ qualityMode })}
                    onChangeInstrumentalOnly={(instrumentalOnly) =>
                      updateActiveComposer({ instrumentalOnly })
                    }
                    onChangeAbcScore={(abcScore) => updateActiveComposer({ abcScore })}
                    onChangeLoraModel={(loraModel) => updateActiveComposer({ loraModel })}
                    onChangeLoraStrength={(loraStrength) => updateActiveComposer({ loraStrength })}
                    onChangeVocalIdentity={(vocalIdentity) =>
                      updateActiveComposer({ vocalIdentity })
                    }
                    onSelectCoverSource={handleSelectCoverSource}
                    onComposeWithAI={handleComposeWithAI}
                    onCreateSong={handleCreateSong}
                  />

                  <StudioMixerPanel
                    project={activeProject}
                    tracks={activeWorkspace.tracks}
                    activeTrack={activeTrack}
                    activeAudio={activeAudio}
                    isGeneratingSong={isGeneratingSong}
                    generationStage={generationStage}
                    isSplittingStems={isSplittingStems}
                    splitStage={splitStage}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    masterVolume={masterVolume}
                    mixerState={mixerState}
                    meters={meters}
                    onSelectTrack={handleSelectTrack}
                    onDeleteTrack={handleDeleteTrack}
                    onToggleArchiveMaster={handleToggleArchiveMaster}
                    onPrevTrack={handlePrevTrack}
                    onNextTrack={handleNextTrack}
                    onTogglePlay={handleTogglePlay}
                    onStop={handleStop}
                    onSeek={handleSeek}
                    onChangeMasterVolume={handleChangeMasterVolume}
                    onSplitStems={handleSplitStems}
                    onChangeStemVolume={handleChangeStemVolume}
                    onToggleMute={handleToggleMute}
                    onToggleSolo={handleToggleSolo}
                    onDownloadMasterWav={() => void handleDownloadMasterWav()}
                    onDownloadStemWav={handleDownloadStemWav}
                  />
                </>
              )}

              {activeSection === 'audio' && (
                <StudioMixerPanel
                  project={activeProject}
                  tracks={activeWorkspace.tracks}
                  activeTrack={activeTrack}
                  activeAudio={activeAudio}
                  isGeneratingSong={isGeneratingSong}
                  generationStage={generationStage}
                  isSplittingStems={isSplittingStems}
                  splitStage={splitStage}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  masterVolume={masterVolume}
                  mixerState={mixerState}
                  meters={meters}
                  onSelectTrack={handleSelectTrack}
                  onDeleteTrack={handleDeleteTrack}
                  onToggleArchiveMaster={handleToggleArchiveMaster}
                  onPrevTrack={handlePrevTrack}
                  onNextTrack={handleNextTrack}
                  onTogglePlay={handleTogglePlay}
                  onStop={handleStop}
                  onSeek={handleSeek}
                  onChangeMasterVolume={handleChangeMasterVolume}
                  onSplitStems={handleSplitStems}
                  onChangeStemVolume={handleChangeStemVolume}
                  onToggleMute={handleToggleMute}
                  onToggleSolo={handleToggleSolo}
                  onDownloadMasterWav={() => void handleDownloadMasterWav()}
                  onDownloadStemWav={handleDownloadStemWav}
                />
              )}

              {activeSection === 'library' && (
                <ProjectLibraryView
                  project={activeProject}
                  workspace={activeWorkspace}
                  activeTrackId={activeWorkspace.activeTrackId}
                  onSelectAndPlay={(id) => {
                    handleSelectTrack(id);
                    setActiveSection('audio');
                  }}
                  onToggleArchiveMaster={handleToggleArchiveMaster}
                  onDownloadMasterWav={(id) => void handleDownloadMasterWav(id)}
                  onApplyStylePrompt={(prompt) => {
                    updateActiveComposer({ stylePrompt: prompt });
                    setActiveSection('create');
                  }}
                  onOpenCreate={() => setActiveSection('create')}
                />
              )}

              {activeSection === 'lyrics' && (
                <LyricsCompositionView
                  project={activeProject}
                  workspace={activeWorkspace}
                  isComposingAI={isComposingAI}
                  onChangeTitle={(title) => updateActiveComposer({ title })}
                  onChangeLyrics={(lyrics) => updateActiveComposer({ lyrics })}
                  onChangeStyle={(stylePrompt) => updateActiveComposer({ stylePrompt })}
                  onChangeAbcScore={(abcScore) => updateActiveComposer({ abcScore })}
                  onComposeWithAI={() => void handleComposeWithAI('full')}
                  onGoToCreate={() => setActiveSection('create')}
                />
              )}

              {activeSection === 'qc' && (
                <ProductionQCView
                  project={activeProject}
                  tracks={activeWorkspace.tracks}
                  qcHistory={activeWorkspace.qcHistory}
                  audioCache={audioCache}
                  onRunQC={(track) => void handleRunQC(track)}
                  onToggleArchiveMaster={handleToggleArchiveMaster}
                />
              )}

              {activeSection === 'settings' && (
                <ProjectSettingsView
                  project={activeProject}
                  workspace={activeWorkspace}
                  onUpdateComposerSettings={(patch) => updateActiveComposer(patch)}
                  onResetProject={handleResetActiveProject}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Tools Modals */}
      <EngineConfigModal
        isOpen={isEngineModalOpen}
        settings={engineSettings}
        onClose={() => setIsEngineModalOpen(false)}
        onUpdateUrl={handleUpdateUrl}
        onPingEngine={handlePingEngine}
        onToggleSimulation={handleToggleSimulation}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        logs={activityLogs}
        onClose={() => setIsActivityModalOpen(false)}
        onClear={() => setActivityLogs([])}
      />
    </>
  );
}
