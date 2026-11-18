export type QualityMode = 'bf16-cloud' | 'gguf-local';

export type StemKey = 'vocals' | 'drums' | 'bass' | 'other';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export type ComposerTabMode = 'studio' | 'cover' | 'simple';

export type SidebarNavSection = 'create' | 'library' | 'engine' | 'activity';

export type ProjectId = 'bushido' | 'ezyvx' | 'noczx' | 'echonav' | 'vdnyx';

export type WorkspaceSection =
  | 'create'
  | 'library'
  | 'lyrics'
  | 'audio'
  | 'qc'
  | 'settings';

export interface ProjectTheme {
  accentHex: string;
  secondaryHex: string;
  panelTintHex: string;
  surfaceTint: string;
  motifCss: string;
  borderAccentClass: string;
  textAccentClass: string;
  badgeBgClass: string;
  buttonBgClass: string;
  buttonTextClass: string;
  glowShadowStyle: string;
  createGradientClass: string;
  signatureLabel: string;
}

export interface GenrePreset {
  label: string;
  prompt: string;
  bpm: number;
  key: string;
}

export interface ProjectProfile {
  id: ProjectId;
  name: string;
  genre: string;
  description: string;
  coverImage: string;
  theme: ProjectTheme;
  defaultQualityMode: QualityMode;
  defaultBpm: number;
  defaultKey: string;
  vocalIdentity: string;
  vocalOptions: string[];
  instrumentLibrary: string[];
  loraModels: string[];
  genrePresets: GenrePreset[];
  stylePromptLibrary: string[];
  starterLyrics: string;
  starterTitle: string;
  starterAbcScore: string;
}

export interface EngineEndpointConfig {
  url: string;
  status: ConnectionState;
  simulated: boolean;
  lastMessage: string;
}

export interface EngineSettings {
  colabCloud: EngineEndpointConfig;
  localPc: EngineEndpointConfig;
}

export interface StemChannelState {
  volume: number; // 0 to 1
  muted: boolean;
  solo: boolean;
}

export type MixerState = Record<StemKey, StemChannelState>;

export interface SongTrack {
  id: string;
  projectId: ProjectId;
  title: string;
  style: string;
  lyrics: string;
  qualityMode: QualityMode;
  bpm: number;
  musicalKey: string;
  durationSec: number;
  createdAt: string;
  stemsSplit: boolean;
  seed: number;
  instrumentalOnly?: boolean;
  abcScore?: string;
  loraModel?: string;
  loraStrength?: number;
  coverImage?: string;
  archivedMaster?: boolean;
  vocalIdentity?: string;
}

export interface QCRecord {
  id: string;
  trackId: string;
  trackTitle: string;
  checkedAt: string;
  peakDb: string;
  lufsEstimate: string;
  clippingFree: boolean;
  stemsReady: boolean;
  status: 'passed' | 'review';
  notes: string;
}

export interface ProjectWorkspaceState {
  composer: {
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
    coverSourceTrackId: string;
  };
  tracks: SongTrack[];
  activeTrackId: string | null;
  generationHistory: ActivityLogItem[];
  qcHistory: QCRecord[];
}

export interface RenderedTrackAudio {
  trackId: string;
  master: AudioBuffer;
  stems: Record<StemKey, AudioBuffer>;
  masterPeaks: number[];
  stemPeaks: Record<StemKey, number[]>;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  projectId?: ProjectId;
  title: string;
  detail: string;
  kind: 'compose' | 'generate' | 'uvr5' | 'engine' | 'qc';
}
