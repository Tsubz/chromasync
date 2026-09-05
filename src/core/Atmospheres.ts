import { TuningFrequency } from '../audio/SynthChord';

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

export const ATMOSPHERES: Atmosphere[] = [
  {
    id: 'aurora',
    name: 'Celestial Aurora',
    shortName: 'Aurora',
    tagline: 'Fluid watercolor bleeds & light bloom',
    description: 'Diffusion aquarelle fractale (D≈1.4) et drone en 9e majeure favorisant l\'élévation du tonus vagal et la sérotonine.',
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
    binauralLabel: 'Theta 5.5Hz',
    recommendedPatternId: 'coherence_55',
    scientificTarget: 'Autonomic balance & vagal tone'
  },
  {
    id: 'ocean',
    name: 'Oceanic Tide',
    shortName: 'Ocean',
    tagline: 'Liquid caustics & tidal surges',
    description: 'Caustiques liquides cyan (470-510nm) et houle marine modulée par le souffle, stimulant la concentration et les ondes Alpha.',
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
    binauralLabel: 'Alpha 10Hz Focus',
    recommendedPatternId: 'box_4444',
    scientificTarget: 'Cognitive focus & mental clarity'
  },
  {
    id: 'rain',
    name: 'Forest Rain',
    shortName: 'Rain',
    tagline: 'Dappled canopy & water ripples',
    icon: '🌧️',
    shaderMode: 2,
    swatchGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: 'Ondes de pluie et teintes émeraude (520-550nm) réduisant la surcharge cognitive via la restauration attentionnelle.',
    scientificSource: 'Attention Restoration Theory (Kaplan) & Acoustic Noise Spectrum (Zhou et al., 2012)',
    bgBase: { r: 0.03, g: 0.07, b: 0.06 },
    inhaleGlow: { r: 0.42, g: 0.90, b: 0.65 },
    holdLuster: { r: 0.86, g: 0.98, b: 0.72 },
    exhaleCool: { r: 0.10, g: 0.32, b: 0.26 },
    accent: { r: 0.22, g: 0.72, b: 0.65 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 5.5,
    binauralLabel: 'Theta 5.5Hz',
    recommendedPatternId: 'sleep_426',
    scientificTarget: 'Biophilic mental fatigue relief'
  },
  {
    id: 'hearth',
    name: 'Warm Hearth',
    shortName: 'Hearth',
    tagline: 'Charcoal void & dancing embers',
    description: 'Lueur ambrée chaude (620-700nm sans spectre bleu) et crépitements apaisants préservant la sécrétion naturelle de mélatonine.',
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
    binauralLabel: 'Theta 4Hz Sleep',
    recommendedPatternId: 'relax_478',
    scientificTarget: 'Pre-sleep parasympathetic calm'
  },
  {
    id: 'astral',
    name: 'Astral Void',
    shortName: 'Astral',
    tagline: 'Cosmic nebula & twinkling stardust',
    description: 'Nébuleuse stellaire et harpe de verre cristalline favorisant la méditation profonde et la conscience contemplative.',
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
    binauralLabel: 'Theta 5.5Hz',
    recommendedPatternId: 'sigh_huberman',
    scientificTarget: 'Deep meditative transcendence'
  }
];
