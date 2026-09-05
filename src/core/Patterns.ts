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

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'sigh_huberman',
    name: 'Soupir Physiologique',
    shortName: 'Soupir 2+1',
    tagline: 'Chute immédiate du stress',
    description: 'Double inspiration nasale pour déplisser les alvéoles pulmonaires, suivie d\'une longue expiration buccale apaisante.',
    scientificSource: 'Stanford Medicine / Cell Reports Medicine (Balban, Huberman, Spiegel, 2023)',
    recommendedAtmosphereId: 'astral',
    phases: [
      { type: 'inhale', duration: 3.0, label: 'Inspiration (Nez)', subtext: 'Première inspiration profonde par le nez' },
      { type: 'hold_in', duration: 1.2, label: 'Complément (Nez)', subtext: 'Seconde micro-inspiration d\'appoint' },
      { type: 'exhale', duration: 6.0, label: 'Expiration (Bouche)', subtext: 'Long et doux soupir par la bouche' }
    ]
  },
  {
    id: 'coherence_55',
    name: 'Cohérence Cardiaque (5.5s)',
    shortName: '5.5s Cohérence',
    tagline: 'Résonance baroréflexe & VFC',
    description: 'Fréquence de résonance à 0.10 Hz synchronisant la variabilité de la fréquence cardiaque et la pression artérielle.',
    scientificSource: 'Cardiopulmonary Resonance / Front. Public Health (Lehrer et al., 2020)',
    recommendedAtmosphereId: 'aurora',
    phases: [
      { type: 'inhale', duration: 5.5, label: 'Inhale (Nose)', subtext: 'Inspiration fluide et continue par le nez' },
      { type: 'exhale', duration: 5.5, label: 'Exhale (Nose)', subtext: 'Expiration douce et continue par le nez' }
    ]
  },
  {
    id: 'box_4444',
    name: 'Box (4-4-4-4)',
    shortName: 'Box 4s',
    tagline: 'Clarté tactique & centrage',
    description: 'Respiration carrée à ratios égaux pour stabiliser le cortex préfrontal sans provoquer d\'hyperventilation.',
    scientificSource: 'Autonomic Homeostasis & Tactical Equanimity (Grossman et al., 2004)',
    recommendedAtmosphereId: 'ocean',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhale (Nose)', subtext: 'Inspiration profonde et maîtrisée par le nez' },
      { type: 'hold_in', duration: 4, label: 'Hold', subtext: 'Maintien poumons pleins, gorge détendue' },
      { type: 'exhale', duration: 4, label: 'Exhale (Nose/Mouth)', subtext: 'Expiration lente et mesurée' },
      { type: 'hold_out', duration: 4, label: 'Rest', subtext: 'Pause paisible poumons vides' }
    ]
  },
  {
    id: 'relax_478',
    name: '4-7-8 Relax',
    shortName: '4-7-8 Relax',
    tagline: 'Apaisement parasympathique profond',
    description: 'Inspiration nasale, rétention prolongée vasodilatatrice et expiration buccale activant le nerf vague.',
    scientificSource: 'Integrative Vagal Stimulation (Dr. Andrew Weil, 2010)',
    recommendedAtmosphereId: 'hearth',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhale (Nose)', subtext: 'Inspiration silencieuse par le nez' },
      { type: 'hold_in', duration: 7, label: 'Hold', subtext: 'Rétention calme, esprit posé' },
      { type: 'exhale', duration: 8, label: 'Exhale (Mouth)', subtext: 'Long souffle libérateur par la bouche' }
    ]
  },
  {
    id: 'sleep_426',
    name: 'Deep Unwind (4-2-6)',
    shortName: '4-2-6 Unwind',
    tagline: 'Transition vers le sommeil',
    description: 'Expiration allongée favorisant la libération d\'acétylcholine pour ralentir le rythme cardiaque avant la nuit.',
    scientificSource: 'Parasympathetic Sleep Induction (Gerritsen & Band, 2018)',
    recommendedAtmosphereId: 'rain',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhale (Nose)', subtext: 'Inspiration lente et rassurante par le nez' },
      { type: 'hold_in', duration: 2, label: 'Hold', subtext: 'Courte pause sans tension' },
      { type: 'exhale', duration: 6, label: 'Exhale (Mouth)', subtext: 'Longue expiration fondante par la bouche' }
    ]
  },
  {
    id: 'free_flow',
    name: 'Souffle Libre',
    shortName: '✋ Libre',
    tagline: 'Guidage tactile intuitif',
    description: 'Aucun tempo imposé. Maintenez le doigt posé pour inspirer à votre gré, relâchez pour expirer. Habitez le silence de vos apnées sans contrainte.',
    scientificSource: 'Interoceptive Autonomic Self-Regulation & Tactile Biofeedback (Critchley et al., 2013)',
    recommendedAtmosphereId: 'aurora',
    phases: [
      { type: 'inhale', duration: 4.5, label: 'Inspiration Libre', subtext: 'Maintenez le doigt posé pour déployer le souffle' },
      { type: 'exhale', duration: 5.5, label: 'Expiration Libre', subtext: 'Relâchez pour laisser l\'air s\'échapper' }
    ]
  }
];
