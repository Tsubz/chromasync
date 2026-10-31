import { TuningFrequency } from '../audio/SynthChord';

export interface DeepLink {
  atmosphereId?: string;
  patternId?: string;
  tuning?: TuningFrequency;
}

// Short names used in links from the science pages and shared URLs
const PATTERN_ALIASES: Record<string, string> = {
  sigh: 'sigh_huberman',
  coherence: 'coherence_55',
  box: 'box_4444',
  relax478: 'relax_478',
  '478': 'relax_478',
  unwind: 'sleep_426',
  sleep: 'sleep_426',
  free: 'free_flow'
};

/** Reads `?atm=ocean&pattern=box&tuning=432` style parameters. Unknown values are ignored. */
export function parseDeepLink(search: string, patternIds: string[], atmosphereIds: string[]): DeepLink {
  const params = new URLSearchParams(search);
  const link: DeepLink = {};

  const atm = params.get('atm')?.toLowerCase();
  if (atm && atmosphereIds.includes(atm)) link.atmosphereId = atm;

  const pattern = params.get('pattern')?.toLowerCase();
  const patternId = pattern ? (PATTERN_ALIASES[pattern] ?? pattern) : undefined;
  if (patternId && patternIds.includes(patternId)) link.patternId = patternId;

  const tuning = Number(params.get('tuning'));
  if (tuning === 432 || tuning === 440 || tuning === 528) link.tuning = tuning;

  return link;
}
