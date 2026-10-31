import { TuningFrequency } from '../audio/SynthChord';
import { tDynamic } from '../i18n';

export interface RGBColor {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
}

export type AtmosphereId = 'aurora' | 'ocean' | 'rain' | 'hearth' | 'astral';

export interface Atmosphere {
  id: AtmosphereId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  scientificSource: string;
  icon: string;
  shaderMode: number; // 0: Aurora, 1: Ocean, 2: Rain, 3: Hearth, 4: Astral
  swatchGradient: string;
  bgBase: RGBColor;
  inhaleGlow: RGBColor;
  holdLuster: RGBColor;
  exhaleCool: RGBColor;
  accent: RGBColor;
  // Scientific Auto-Harmonization parameters
  recommendedTuning: TuningFrequency;
  recommendedBinauralBeat: number; // in Hz (e.g. 5.5 = Theta, 10.0 = Alpha)
  binauralLabel: string;
  recommendedPatternId: string;
  scientificTarget: string;
}

type AtmosphereText = 'name' | 'shortName' | 'tagline' | 'description' | 'binauralLabel' | 'scientificTarget';

// Display texts live in src/i18n under `atm.<id>.*` and are resolved on read.
function defineAtmosphere(def: Omit<Atmosphere, AtmosphereText>): Atmosphere {
  const text = (field: string) => tDynamic(`atm.${def.id}.${field}`);
  return {
    ...def,
    get name() { return text('name'); },
    get shortName() { return text('shortName'); },
    get tagline() { return text('tagline'); },
    get description() { return text('description'); },
    get binauralLabel() { return text('beat'); },
    get scientificTarget() { return text('target'); }
  };
}

export const ATMOSPHERES: Atmosphere[] = [
  defineAtmosphere({
    id: 'aurora',
    scientificSource: 'Fractal Fluency (Taylor et al., NASA/Univ. of Oregon) & 432Hz Trial (Calamassi, 2019)',
    icon: '🌌',
    shaderMode: 0,
    swatchGradient: 'linear-gradient(135deg, #ff9a8b 0%, #ff6a88 50%, #ff99ac 100%)',
    bgBase: { r: 0.07, g: 0.04, b: 0.09 },
    inhaleGlow: { r: 1.0, g: 0.62, b: 0.45 },
    holdLuster: { r: 1.0, g: 0.88, b: 0.65 },
    exhaleCool: { r: 0.45, g: 0.25, b: 0.58 },
    accent: { r: 0.98, g: 0.42, b: 0.52 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 5.5,
    recommendedPatternId: 'coherence_55'
  }),
  defineAtmosphere({
    id: 'ocean',
    scientificSource: 'Biophilic Water Auditory Recovery (Buxton et al., PNAS 2021) & 528Hz Endocrine Trial (Akimoto, 2018)',
    icon: '🌊',
    shaderMode: 1,
    swatchGradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    bgBase: { r: 0.02, g: 0.05, b: 0.12 },
    inhaleGlow: { r: 0.12, g: 0.85, b: 0.95 },
    holdLuster: { r: 0.58, g: 0.96, b: 1.0 },
    exhaleCool: { r: 0.06, g: 0.16, b: 0.45 },
    accent: { r: 0.32, g: 0.42, b: 0.92 },
    recommendedTuning: 528,
    recommendedBinauralBeat: 10.0,
    recommendedPatternId: 'box_4444'
  }),
  defineAtmosphere({
    id: 'rain',
    icon: '🌧️',
    shaderMode: 2,
    swatchGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    scientificSource: 'Attention Restoration Theory (Kaplan) & Acoustic Noise Spectrum (Zhou et al., 2012)',
    bgBase: { r: 0.03, g: 0.07, b: 0.06 },
    inhaleGlow: { r: 0.42, g: 0.90, b: 0.65 },
    holdLuster: { r: 0.86, g: 0.98, b: 0.72 },
    exhaleCool: { r: 0.10, g: 0.32, b: 0.26 },
    accent: { r: 0.22, g: 0.72, b: 0.65 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 5.5,
    recommendedPatternId: 'sleep_426'
  }),
  defineAtmosphere({
    id: 'hearth',
    scientificSource: 'Circadian Photobiology (Lockley et al.) & Parasympathetic Vagus Release (Weil, 2010)',
    icon: '🕯️',
    shaderMode: 3,
    swatchGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    bgBase: { r: 0.09, g: 0.05, b: 0.03 },
    inhaleGlow: { r: 0.98, g: 0.72, b: 0.25 },
    holdLuster: { r: 1.0, g: 0.90, b: 0.62 },
    exhaleCool: { r: 0.58, g: 0.28, b: 0.18 },
    accent: { r: 0.92, g: 0.48, b: 0.22 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 4.0,
    recommendedPatternId: 'relax_478'
  }),
  defineAtmosphere({
    id: 'astral',
    scientificSource: 'High-Q Resonance & Neuroaesthetics of Spatial Curvature (Bar & Neta, 2006)',
    icon: '✨',
    shaderMode: 4,
    swatchGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    bgBase: { r: 0.05, g: 0.04, b: 0.10 },
    inhaleGlow: { r: 0.82, g: 0.62, b: 0.96 },
    holdLuster: { r: 0.96, g: 0.85, b: 1.0 },
    exhaleCool: { r: 0.30, g: 0.22, b: 0.52 },
    accent: { r: 0.62, g: 0.75, b: 0.96 },
    recommendedTuning: 528,
    recommendedBinauralBeat: 5.5,
    recommendedPatternId: 'sigh_huberman'
  })
];
