import { tDynamic } from '../i18n';

export type BreathPhaseType = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

export interface BreathPhase {
  type: BreathPhaseType;
  duration: number; // in seconds
  label: string;
  subtext: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  scientificSource: string;
  recommendedAtmosphereId: string;
  phases: BreathPhase[];
}

interface PatternDefinition {
  id: string;
  scientificSource: string;
  recommendedAtmosphereId: string;
  phases: { type: BreathPhaseType; duration: number }[];
}

// Display texts live in src/i18n under `pattern.<id>.*` and are resolved on read,
// so they always follow the active locale.
function definePattern(def: PatternDefinition): BreathingPattern {
  const text = (field: string) => tDynamic(`pattern.${def.id}.${field}`);
  return {
    id: def.id,
    scientificSource: def.scientificSource,
    recommendedAtmosphereId: def.recommendedAtmosphereId,
    get name() { return text('name'); },
    get shortName() { return text('shortName'); },
    get tagline() { return text('tagline'); },
    get description() { return text('description'); },
    phases: def.phases.map((phase, i) => ({
      ...phase,
      get label() { return text(`phase${i}.label`); },
      get subtext() { return text(`phase${i}.subtext`); }
    }))
  };
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  definePattern({
    id: 'sigh_huberman',
    scientificSource: 'Balban et al., Cell Reports Medicine 2023 (cyclic sighing, randomized trial)',
    recommendedAtmosphereId: 'astral',
    phases: [
      { type: 'inhale', duration: 3.0 },
      // Second nasal "top-up" is an inhale, not a hold
      { type: 'inhale', duration: 1.2 },
      { type: 'exhale', duration: 6.0 }
    ]
  }),
  definePattern({
    id: 'coherence_55',
    scientificSource: 'Lehrer & Gevirtz, Front. Psychol. 2014 · Lehrer et al., Appl. Psychophysiol. Biofeedback 2020 (meta-analysis)',
    recommendedAtmosphereId: 'aurora',
    phases: [
      { type: 'inhale', duration: 5.5 },
      { type: 'exhale', duration: 5.5 }
    ]
  }),
  definePattern({
    id: 'box_4444',
    scientificSource: 'Balban et al., Cell Reports Medicine 2023 (box breathing arm)',
    recommendedAtmosphereId: 'ocean',
    phases: [
      { type: 'inhale', duration: 4 },
      { type: 'hold_in', duration: 4 },
      { type: 'exhale', duration: 4 },
      { type: 'hold_out', duration: 4 }
    ]
  }),
  definePattern({
    id: 'relax_478',
    scientificSource: 'Popularized by Dr. Andrew Weil · small trial: Vierra et al., Physiol. Rep. 2022',
    recommendedAtmosphereId: 'hearth',
    phases: [
      { type: 'inhale', duration: 4 },
      { type: 'hold_in', duration: 7 },
      { type: 'exhale', duration: 8 }
    ]
  }),
  definePattern({
    id: 'sleep_426',
    scientificSource: 'Respiratory vagal stimulation model (Gerritsen & Band, Front. Hum. Neurosci. 2018)',
    recommendedAtmosphereId: 'rain',
    phases: [
      { type: 'inhale', duration: 4 },
      { type: 'hold_in', duration: 2 },
      { type: 'exhale', duration: 6 }
    ]
  }),
  definePattern({
    id: 'free_flow',
    scientificSource: 'Interoception (Critchley & Harrison, Neuron 2013)',
    recommendedAtmosphereId: 'aurora',
    phases: [
      { type: 'inhale', duration: 4.5 },
      { type: 'exhale', duration: 5.5 }
    ]
  })
];
