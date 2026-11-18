import type {
  ProjectId,
  ProjectProfile,
  ProjectWorkspaceState,
  SongTrack,
} from '../types/studio';

export const PROJECT_PROFILES: Record<ProjectId, ProjectProfile> = {
  bushido: {
    id: 'bushido',
    name: 'BUSHIDO',
    genre: 'Neo Ethnic Hybrid Metal',
    description: 'Japanese and Balinese ethnic fusion with modern heavy music.',
    coverImage: '/src/assets/images/cover_neo_ethnic_1795017667933.jpg',
    theme: {
      accentHex: '#DC2626',
      secondaryHex: '#8B5CF6',
      panelTintHex: '#130B0F',
      surfaceTint: 'rgba(220, 38, 38, 0.11)',
      motifCss:
        'radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.22), transparent 55%), radial-gradient(circle at 15% 85%, rgba(220, 38, 38, 0.18), transparent 55%)',
      borderAccentClass: 'border-red-500/60',
      textAccentClass: 'text-red-400',
      badgeBgClass: 'bg-red-600/20 text-red-300 border-red-500/35',
      buttonBgClass: 'bg-red-600 hover:bg-red-500 text-white',
      buttonTextClass: 'text-white',
      glowShadowStyle: '0 8px 30px rgba(220, 38, 38, 0.22)',
      createGradientClass: 'from-orange-500 via-red-600 to-violet-600',
      signatureLabel: 'Crimson · Violet Hybrid',
    },
    defaultQualityMode: 'bf16-cloud',
    defaultBpm: 138,
    defaultKey: 'Dm',
    vocalIdentity: 'Fierce Hybrid Metal Growl & Melodic Tenor',
    vocalOptions: [
      'Fierce Hybrid Metal Growl & Melodic Tenor',
      'Dramatic Japanese Visual Kei Vocal',
      'Choral War Chant & High Clean Vocal',
    ],
    instrumentLibrary: [
      '7-String Downtuned Electric Guitar',
      'Balinese Bronze Gangsa & Bonang',
      'Japanese Taiko War Drums',
      'Shamisen Tremolo Lead',
      'Sub-Bass Drop Synth',
    ],
    loraModels: [
      'None (Base YuE2 Max)',
      'Bushido-Gamelan-Metal-v2.safetensors',
      'Taiko-WarDrum-Drive.safetensors',
      'NuMetal-DropC-Riff.safetensors',
    ],
    genrePresets: [
      {
        label: 'Neo Ethnic Hybrid Metal',
        prompt:
          'Neo Ethnic Hybrid Metal, downtuned 7-string guitars, traditional bronze percussion, cinematic synth sub, aggressive & melodic vocals',
        bpm: 138,
        key: 'Dm',
      },
      {
        label: 'Javanese & Balinese Gamelan Metal',
        prompt:
          'Javanese & Balinese Gamelan Metal, interlocking metallic bonang and gangsa, double-kick metal drums, heavy distorted bass, fierce vocal',
        bpm: 132,
        key: 'Em',
      },
      {
        label: 'Japanese Alt-Rock & Taiko',
        prompt:
          'Japanese Alt-Rock & Taiko, thunderous taiko war drums, sharp overdriven guitar riffs, soaring J-rock chorus, shamisen accents',
        bpm: 146,
        key: 'Am',
      },
      {
        label: 'Modern Nu Metal',
        prompt:
          'Modern Nu Metal, syncopated drop-tuned groove riffs, dark atmospheric DJ synth textures, punchy snare, intense rhythmic vocal',
        bpm: 118,
        key: 'Fm',
      },
    ],
    stylePromptLibrary: [
      'Neo Ethnic Hybrid Metal, downtuned 7-string guitars, Balinese bronze gamelan, cinematic sub, aggressive vocal',
      'Javanese Gamelan Metal, interlocking bonang & kenong, double-kick blast drums, dark orchestral choir',
      'Japanese Alt-Rock & Taiko, massive war drums, sharp overdrive riffs, dramatic shamisen solo',
    ],
    starterTitle: 'Ksatria Bayangan',
    starterAbcScore: 'X:1\nM:4/4\nK:Dm\nD2 F2 A2 d2 | c2 A2 G2 E2 |',
    starterLyrics: `[Verse 1]
Pedang beradu di bawah langit merah saga
Gema gamelan dan taiko membakar jiwa
Langkah ksatria takkan gentar oleh badai
Di tengah bayangan kita bangkit kembali

[Chorus]
Kobarkan api di dalam dada
Distorsi dan perunggu berpadu jadi satu suara
Ini jalan kehormatan tanpa batas waktu
Menembus sunyi dengan nyanyian perang baru

[Verse 2]
Senar bergetar memecah keheningan malam
Ritme berdentum menggetarkan dasar bumi

[Bridge]
Hening sejenak sebelum dentuman terakhir
Semua kekuatan menyatu di ujung takdir

[Outro]
Gema perunggu memudar di ufuk fajar
Jejak ksatria abadi takkan pernah pudar`,
  },

  ezyvx: {
    id: 'ezyvx',
    name: 'EZYVX',
    genre: 'Breakbeat',
    description: 'Electronic breakbeat music and energetic dance grooves.',
    coverImage: '/src/assets/images/project_ezyvx_1795019246101.jpg',
    theme: {
      accentHex: '#2563EB',
      secondaryHex: '#06B6D4',
      panelTintHex: '#091019',
      surfaceTint: 'rgba(37, 99, 235, 0.12)',
      motifCss:
        'radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.24), transparent 55%), linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, transparent 60%)',
      borderAccentClass: 'border-cyan-500/60',
      textAccentClass: 'text-cyan-400',
      badgeBgClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
      buttonBgClass: 'bg-blue-600 hover:bg-blue-500 text-white',
      buttonTextClass: 'text-white',
      glowShadowStyle: '0 8px 30px rgba(6, 182, 212, 0.22)',
      createGradientClass: 'from-blue-600 via-cyan-500 to-sky-500',
      signatureLabel: 'Electric Blue · Cyan',
    },
    defaultQualityMode: 'bf16-cloud',
    defaultBpm: 134,
    defaultKey: 'Fm',
    vocalIdentity: 'Chopped Electro Vocal Hooks & Vocoder',
    vocalOptions: [
      'Chopped Electro Vocal Hooks & Vocoder',
      'Energetic Dance MC Hyped Vocal',
      'Clean Synth-Pop Female Lead',
    ],
    instrumentLibrary: [
      'Sliced Amen & Funk Breakbeat Drums',
      'Reese & Acid 303 Bassline',
      'Modular Arpeggio Plucks',
      'Wide Supersaw Rave Stabs',
      'Glitch FX Risers',
    ],
    loraModels: [
      'None (Base YuE2 Max)',
      'EZYVX-NuSkool-Breaks-v3.safetensors',
      'Acid-303-Breakbeat.safetensors',
      'Future-Jungle-Chop.safetensors',
    ],
    genrePresets: [
      {
        label: 'UK Nu-Skool Breakbeat',
        prompt:
          'High energy UK Nu-Skool Breakbeat, punchy syncopated break drums, rolling Reese bass, electric blue synth stabs, chopped vocal hooks',
        bpm: 134,
        key: 'Fm',
      },
      {
        label: 'Funky Acid Breaks',
        prompt:
          'Electronic Acid Breakbeat, squelchy TB-303 bassline, crisp snare breaks, bright modular arpeggios, festival club energy',
        bpm: 130,
        key: 'Am',
      },
      {
        label: 'Cyber Jungle Groove',
        prompt:
          'Futuristic Cyber Jungle Breakbeat, fast chopped drum loops, deep sub bass weight, shimmering cyan pads, vocoder phrases',
        bpm: 152,
        key: 'Cm',
      },
      {
        label: 'Big Beat Electro',
        prompt:
          'Big Beat Electro Breakbeat, heavy distorted drum breaks, driving synth bass, energetic dance groove, arena riser drops',
        bpm: 126,
        key: 'Em',
      },
    ],
    stylePromptLibrary: [
      'UK Nu-Skool Breakbeat, punchy syncopated drum breaks, sub Reese bass, glowing cyan synth stabs',
      'Futuristic Electronic Breakbeat, modular arpeggios, chopped vocal hooks, club-ready low end',
      'Acid Breaks 132 BPM, TB-303 filter sweeps, crisp vinyl breakbeats, energetic dance groove',
    ],
    starterTitle: 'Neon Pulse Velocity',
    starterAbcScore: 'X:1\nM:4/4\nK:Fm\nF2 c2 _A2 G2 | F2 _E2 C2 F2 |',
    starterLyrics: `[Verse 1]
Lampu strobo menembus lantai dansa malam ini
Sinyal biru berdenyut mengikuti detak nadi
Frekuensi naik memicu adrenalin di ruang hampa
Setiap ketukan patah membawa kita melayang bersama

[Chorus]
Bergerak cepat ikuti irama breakbeat
Listrik menyala di setiap sudut sirkuit
Jangan berhenti sampai pagi menjemput kita
Gelombang cyan menggema di seluruh kota

[Bridge]
Putar filter perlahan lalu lepaskan semua energi
Sub bass menggetarkan dinding hingga batas tertinggi

[Outro]
Sinyal memudar di balik cahaya biru elektrik
Irama ini terus berputar tanpa titik`,
  },

  noczx: {
    id: 'noczx',
    name: 'NOCZX',
    genre: 'Nu Metal / Rap Metal',
    description: 'Aggressive modern nu metal, rap-driven vocals and industrial textures.',
    coverImage: '/src/assets/images/cover_nu_metal_1795017671881.jpg',
    theme: {
      accentHex: '#B91C1C',
      secondaryHex: '#94A3B8',
      panelTintHex: '#120D0E',
      surfaceTint: 'rgba(185, 28, 28, 0.13)',
      motifCss:
        'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(185, 28, 28, 0.24), transparent 60%)',
      borderAccentClass: 'border-red-600/60',
      textAccentClass: 'text-red-400',
      badgeBgClass: 'bg-red-700/25 text-red-200 border-red-600/40',
      buttonBgClass: 'bg-red-700 hover:bg-red-600 text-white',
      buttonTextClass: 'text-white',
      glowShadowStyle: '0 8px 30px rgba(185, 28, 28, 0.26)',
      createGradientClass: 'from-red-700 via-red-600 to-slate-600',
      signatureLabel: 'Blood Red · Gunmetal',
    },
    defaultQualityMode: 'bf16-cloud',
    defaultBpm: 116,
    defaultKey: 'Cm',
    vocalIdentity: 'Aggressive Rap-Metal Cadence & Raw Scream',
    vocalOptions: [
      'Aggressive Rap-Metal Cadence & Raw Scream',
      'Fast Staccato Hip-Hop Metal Flow',
      'Industrial Distorted Shout & Anthemic Hook',
    ],
    instrumentLibrary: [
      'Drop-A Baritone 7-String Guitar',
      'Industrial Turntable Scratches & Glitch',
      'Heavy Compressed Acoustic Snare',
      'Distorted Growl Bass',
      'Metallic Clank Percussion',
    ],
    loraModels: [
      'None (Base YuE2 Max)',
      'NOCZX-DropA-Industrial-v1.safetensors',
      'RapMetal-Turntable-Grit.safetensors',
      'Raw-NuMetal-90s-Tone.safetensors',
    ],
    genrePresets: [
      {
        label: 'Modern Nu Metal Groove',
        prompt:
          'Aggressive Modern Nu Metal, bounce drop-A guitar riffs, punchy dry snare, industrial glitch FX, intense rap-driven vocals and scream chorus',
        bpm: 116,
        key: 'Cm',
      },
      {
        label: 'Rap Metal Crossover',
        prompt:
          'Heavy Rap Metal Crossover, fast rhythmic hip-hop vocal verses, booming 808 sub fused with distorted bass, crunchy guitar power chords',
        bpm: 104,
        key: 'Dm',
      },
      {
        label: 'Industrial Aggro Metal',
        prompt:
          'Industrial Nu Metal, cold metallic percussion, harsh sawtooth synth textures, drop-tuned chugging riffs, raw distorted vocals',
        bpm: 124,
        key: 'Em',
      },
      {
        label: 'Raw Underground Bounce',
        prompt:
          '90s Raw Nu Metal revival, scratch DJ accents, gritty bass slap, explosive dynamic breakdown, aggressive shouted hook',
        bpm: 110,
        key: 'Fm',
      },
    ],
    stylePromptLibrary: [
      'Modern Nu Metal, drop-A syncopated riffs, industrial turntable textures, aggressive rap vocals',
      'Rap Metal Crossover, tight rhythmic flow, heavy compressed drums, raw distorted chorus',
      'Industrial Metal Groove, gunmetal cold synth drones, metallic hits, ferocious shout',
    ],
    starterTitle: 'Besi & Amarah',
    starterAbcScore: 'X:1\nM:4/4\nK:Cm\nC2 C2 _E2 C2 | _G2 F2 _E2 C2 |',
    starterLyrics: `[Verse 1]
Jangan coba ukur batas sabar di ruangan sempit ini
Mesin berputar keras menghancurkan semua ilusi
Kata demi kata meluncur tajam seperti peluru baja
Tidak ada tempat bersembunyi dari kenyataan yang ada

[Chorus]
Hancurkan tembok beton dengan suara penuh amarah
Ritme berat menghantam dada tanpa kenal menyerah
Besi beradu percikan api di tengah gelap kota
Ini suara perlawanan yang takkan bisa dipadamkan paksa

[Verse 2]
Distorsi menggeram rendah di bawah ketukan drum keras
Setiap napas terpacu cepat hingga batas terlepas

[Outro]
Gema industrial meredam pelan di balik asap abu
Satu dentuman terakhir menutup semua ragu`,
  },

  echonav: {
    id: 'echonav',
    name: 'ECHONAV',
    genre: 'Acoustic & Cover',
    description: 'Acoustic music, reinterpretations and cover productions.',
    coverImage: '/src/assets/images/project_echonav_1795019248844.jpg',
    theme: {
      accentHex: '#D97706',
      secondaryHex: '#F5EFE6',
      panelTintHex: '#14100B',
      surfaceTint: 'rgba(217, 119, 6, 0.12)',
      motifCss:
        'radial-gradient(circle at 85% 20%, rgba(245, 239, 230, 0.14), transparent 50%), radial-gradient(circle at 18% 82%, rgba(217, 119, 6, 0.22), transparent 58%)',
      borderAccentClass: 'border-amber-500/60',
      textAccentClass: 'text-amber-400',
      badgeBgClass: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
      buttonBgClass: 'bg-amber-500 hover:bg-amber-400 text-zinc-950',
      buttonTextClass: 'text-zinc-950',
      glowShadowStyle: '0 8px 30px rgba(217, 119, 6, 0.22)',
      createGradientClass: 'from-amber-600 via-amber-500 to-yellow-600',
      signatureLabel: 'Warm Amber · Ivory',
    },
    defaultQualityMode: 'bf16-cloud',
    defaultBpm: 92,
    defaultKey: 'G',
    vocalIdentity: 'Warm Intimate Close-Mic Acoustic Vocal',
    vocalOptions: [
      'Warm Intimate Close-Mic Acoustic Vocal',
      'Soft Indie Folk Duet Harmony',
      'Soulful Unplugged Ballad Voice',
    ],
    instrumentLibrary: [
      'Steel-String Acoustic Guitar',
      'Nylon Classical Fingerpicking',
      'Warm Upright Felt Piano',
      'Brushed Cajon & Shaker',
      'Acoustic Upright Bass',
    ],
    loraModels: [
      'None (Base YuE2 Max)',
      'ECHONAV-Acoustic-Room-v2.safetensors',
      'Unplugged-Warm-Guitar.safetensors',
      'FeltPiano-Intimate-Cover.safetensors',
    ],
    genrePresets: [
      {
        label: 'Acoustic Fingerpicking',
        prompt:
          'Intimate Acoustic Fingerpicking, warm steel-string guitar, subtle room reverb, soft upright bass, expressive close-mic vocal',
        bpm: 92,
        key: 'G',
      },
      {
        label: 'Unplugged Piano Cover',
        prompt:
          'Stripped Unplugged Cover production, warm felt piano chords, gentle cello swell, organic emotional vocal performance',
        bpm: 80,
        key: 'C',
      },
      {
        label: 'Indie Folk Reinterpretation',
        prompt:
          'Organic Indie Folk Acoustic, brushed snare & cajon, layered acoustic strumming, warm vocal harmonies, timeless campfire mood',
        bpm: 104,
        key: 'D',
      },
      {
        label: 'Late Night Coffeehouse',
        prompt:
          'Warm Coffeehouse Acoustic Jazz-Folk, nylon string guitar, soft brush percussion, intimate breathing vocal phrasing',
        bpm: 86,
        key: 'Am',
      },
    ],
    stylePromptLibrary: [
      'Intimate Acoustic Guitar Cover, warm tungsten studio room tone, natural vocal harmonies, brushed cajon',
      'Organic Unplugged Felt Piano & Acoustic Strings, minimal arrangement, emotional storytelling vocal',
      'Indie Folk Reinterpretation, nylon fingerstyle guitar, upright acoustic bass, warm airy mix',
    ],
    starterTitle: 'Senja di Beranda Kayu',
    starterAbcScore: 'X:1\nM:4/4\nK:G\nG2 B2 d2 B2 | c2 A2 F2 D2 |',
    starterLyrics: `[Verse 1]
Secangkir kopi hangat menemani hujan sore ini
Petikan senar kayu mengalun pelan di sudut sunyi
Semua kenangan lama hadir kembali tanpa permisi
Dalam nada sederhana yang pernah kita nyanyikan lagi

[Chorus]
Biarkan suara gitar ini bercerita pelan
Tentang rindu yang tetap tinggal meski waktu berjalan
Tak perlu gemuruh besar untuk menyentuh perasaan
Cukup satu melodi jujur di dalam keheningan

[Bridge]
Saat senja meredup di balik jendela kaca
Nada akustik ini menjaga hangatnya cerita

[Outro]
Satu petikan terakhir memudar di udara
Meninggalkan damai di ruang yang bersahaja`,
  },

  vdnyx: {
    id: 'vdnyx',
    name: 'VDNYX',
    genre: 'Pop Jawa / Lagu Tema Jawa',
    description: 'Modern Javanese pop, romantic storytelling and emotional melodies.',
    coverImage: '/src/assets/images/project_vdnyx_1795019247262.jpg',
    theme: {
      accentHex: '#0D9488',
      secondaryHex: '#EAB308',
      panelTintHex: '#0A1212',
      surfaceTint: 'rgba(13, 148, 136, 0.12)',
      motifCss:
        'radial-gradient(circle at 82% 18%, rgba(234, 179, 8, 0.18), transparent 52%), radial-gradient(circle at 18% 82%, rgba(13, 148, 136, 0.22), transparent 58%)',
      borderAccentClass: 'border-teal-500/60',
      textAccentClass: 'text-teal-400',
      badgeBgClass: 'bg-teal-500/15 text-teal-200 border-teal-500/35',
      buttonBgClass: 'bg-teal-600 hover:bg-teal-500 text-white',
      buttonTextClass: 'text-white',
      glowShadowStyle: '0 8px 30px rgba(13, 148, 136, 0.22)',
      createGradientClass: 'from-teal-700 via-teal-600 to-amber-600',
      signatureLabel: 'Deep Teal · Warm Gold',
    },
    defaultQualityMode: 'bf16-cloud',
    defaultBpm: 88,
    defaultKey: 'F',
    vocalIdentity: 'Romantic Javanese Pop Melodic Vocal',
    vocalOptions: [
      'Romantic Javanese Pop Melodic Vocal',
      'Warm Emotional Javanese Ballad Singer',
      'Modern Campursari Duet Vocal',
    ],
    instrumentLibrary: [
      'Warm Grand Piano & Strings',
      'Clean Pop Electric Guitar Arpeggio',
      'Modern Kendang & Ketipung Groove',
      'Suling Bambu Atmospheric Accent',
      'Deep Warm Pop Bass',
    ],
    loraModels: [
      'None (Base YuE2 Max)',
      'VDNYX-PopJawa-Romantis-v2.safetensors',
      'Javanese-Ballad-Strings.safetensors',
      'Modern-Campursari-Groove.safetensors',
    ],
    genrePresets: [
      {
        label: 'Pop Jawa Modern Romantis',
        prompt:
          'Modern Javanese Pop ballad, lush grand piano, warm string swells, clean guitar arpeggios, emotional romantic Javanese vocal',
        bpm: 88,
        key: 'F',
      },
      {
        label: 'Lagu Tema Jawa Atmosferik',
        prompt:
          'Atmospheric Javanese Theme Song, cinematic piano, delicate suling bambu accents, deep teal ambient pads, heartfelt storytelling vocal',
        bpm: 78,
        key: 'Dm',
      },
      {
        label: 'Pop Jawa Akustik Kendang',
        prompt:
          'Modern Pop Jawa with subtle kendang groove, acoustic strumming, warm fretless bass, sweet melancholic Javanese chorus',
        bpm: 98,
        key: 'C',
      },
      {
        label: 'Campursari Pop Elegan',
        prompt:
          'Elegant Modern Campursari Pop, muted brass & saron pentatonic touches, steady romantic pop drums, rich expressive vocal',
        bpm: 94,
        key: 'G',
      },
    ],
    stylePromptLibrary: [
      'Modern Javanese Pop, warm grand piano, clean guitar fills, subtle kendang groove, emotional vocal',
      'Atmospheric Lagu Tema Jawa, cinematic strings, pentatonic Javanese melody, romantic dusk mood',
      'Pop Jawa Ballad, heartfelt storytelling, soft suling accent, modern studio mix',
    ],
    starterTitle: 'Lintang ing Wengi',
    starterAbcScore: 'X:1\nM:4/4\nK:F\nF2 A2 c2 A2 | G2 F2 D2 C2 |',
    starterLyrics: `[Verse 1]
Angin wengi teka nggawa crita lawas
Rembulan padhang nyinari dalan sing sepi
Jenengmu isih tansah keukir ing ati
Sanajan jarak misahake langkah iki

[Chorus]
Nanging lintang ing wengi dadi saksi
Tresna iki ora bakal luntur kegawa wektu
Sak adoh-adohe lakumu ing njaba kana
Atiku tetep nunggu bali kanthi setya

[Verse 2]
Swara piano alon ngancani rasa kangen
Pangarep-arep iki tak jaga tekan esuk

[Bridge]
Muga angin nyampekake salam paling tulus
Kanggo sliramu sing tansah tak sebut ing donga

[Outro]
Ing wengi sing tentrem lan ayem iki
Tembang tresna bakal terus ngiringi`,
  },
};

export const PROJECT_LIST: ProjectProfile[] = [
  PROJECT_PROFILES.bushido,
  PROJECT_PROFILES.ezyvx,
  PROJECT_PROFILES.noczx,
  PROJECT_PROFILES.echonav,
  PROJECT_PROFILES.vdnyx,
];

export function createInitialWorkspaceState(profile: ProjectProfile): ProjectWorkspaceState {
  const starterTrack: SongTrack = {
    id: `${profile.id}-track-01`,
    projectId: profile.id,
    title: profile.starterTitle,
    style: profile.genrePresets[0]?.prompt ?? profile.description,
    lyrics: profile.starterLyrics,
    qualityMode: profile.defaultQualityMode,
    bpm: profile.defaultBpm,
    musicalKey: profile.defaultKey,
    durationSec: Number((((60 / profile.defaultBpm) * 4 * 8)).toFixed(2)),
    createdAt: new Date().toISOString(),
    stemsSplit: false,
    seed: profile.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0) * 137, 10000),
    instrumentalOnly: false,
    abcScore: profile.starterAbcScore,
    loraModel: profile.loraModels[1] ?? profile.loraModels[0],
    loraStrength: 0.75,
    coverImage: profile.coverImage,
    archivedMaster: true,
    vocalIdentity: profile.vocalIdentity,
  };

  return {
    composer: {
      tabMode: 'studio',
      title: profile.starterTitle,
      stylePrompt: profile.genrePresets[0]?.prompt ?? profile.description,
      themeHint: '',
      lyrics: profile.starterLyrics,
      bpm: profile.defaultBpm,
      musicalKey: profile.defaultKey,
      qualityMode: profile.defaultQualityMode,
      instrumentalOnly: false,
      abcScore: profile.starterAbcScore,
      loraModel: profile.loraModels[1] ?? profile.loraModels[0],
      loraStrength: 0.75,
      vocalIdentity: profile.vocalIdentity,
      coverSourceTrackId: starterTrack.id,
    },
    tracks: [starterTrack],
    activeTrackId: starterTrack.id,
    generationHistory: [],
    qcHistory: [
      {
        id: `qc-init-${profile.id}`,
        trackId: starterTrack.id,
        trackTitle: starterTrack.title,
        checkedAt: 'Baseline',
        peakDb: '-1.4 dBFS',
        lufsEstimate: '-11.2 LUFS',
        clippingFree: true,
        stemsReady: false,
        status: 'passed',
        notes: `Baseline master profile verified for ${profile.name} (${profile.genre}).`,
      },
    ],
  };
}

export function createAllInitialWorkspaces(): Record<ProjectId, ProjectWorkspaceState> {
  return {
    bushido: createInitialWorkspaceState(PROJECT_PROFILES.bushido),
    ezyvx: createInitialWorkspaceState(PROJECT_PROFILES.ezyvx),
    noczx: createInitialWorkspaceState(PROJECT_PROFILES.noczx),
    echonav: createInitialWorkspaceState(PROJECT_PROFILES.echonav),
    vdnyx: createInitialWorkspaceState(PROJECT_PROFILES.vdnyx),
  };
}
