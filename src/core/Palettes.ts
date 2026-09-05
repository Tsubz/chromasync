export interface RGBColor {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
}

export interface ColorPalette {
  id: string;
  name: string;
  swatchGradient: string;
  // Colors mapped to breath stages
  bgBase: RGBColor;
  inhaleGlow: RGBColor;
  holdLuster: RGBColor;
  exhaleCool: RGBColor;
  accent: RGBColor;
}

export const PALETTES: ColorPalette[] = [
  {
    id: 'dawn',
    name: 'Dawn Aura',
    swatchGradient: 'linear-gradient(135deg, #ff9a8b 0%, #ff6a88 50%, #ff99ac 100%)',
    bgBase: { r: 0.08, g: 0.05, b: 0.09 },
    inhaleGlow: { r: 1.0, g: 0.62, b: 0.45 },   // warm peach apricot
    holdLuster: { r: 1.0, g: 0.85, b: 0.65 },   // luminous golden sun
    exhaleCool: { r: 0.48, g: 0.28, b: 0.58 },   // soft twilight mauve
    accent: { r: 0.98, g: 0.42, b: 0.52 }       // rose coral
  },
  {
    id: 'midnight',
    name: 'Midnight Tide',
    swatchGradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    bgBase: { r: 0.03, g: 0.06, b: 0.12 },
    inhaleGlow: { r: 0.15, g: 0.85, b: 0.95 },  // bioluminescent cyan
    holdLuster: { r: 0.55, g: 0.95, b: 1.0 },   // bright crystalline water
    exhaleCool: { r: 0.08, g: 0.18, b: 0.48 },  // deep oceanic navy
    accent: { r: 0.35, g: 0.45, b: 0.95 }       // royal sapphire
  },
  {
    id: 'forest',
    name: 'Forest Mist',
    swatchGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    bgBase: { r: 0.04, g: 0.08, b: 0.06 },
    inhaleGlow: { r: 0.45, g: 0.92, b: 0.65 },  // fresh emerald glow
    holdLuster: { r: 0.88, g: 0.98, b: 0.72 },  // pale canopy sunlight
    exhaleCool: { r: 0.12, g: 0.35, b: 0.28 },  // deep moss pine
    accent: { r: 0.25, g: 0.75, b: 0.68 }       // mint sage
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    swatchGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    bgBase: { r: 0.1, g: 0.06, b: 0.04 },
    inhaleGlow: { r: 0.98, g: 0.75, b: 0.28 },  // amber gold
    holdLuster: { r: 1.0, g: 0.92, b: 0.65 },   // brilliant incandescent
    exhaleCool: { r: 0.62, g: 0.32, b: 0.22 },  // burnt terracotta
    accent: { r: 0.95, g: 0.52, b: 0.25 }       // warm saffron
  },
  {
    id: 'ethereal',
    name: 'Ethereal Prism',
    swatchGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    bgBase: { r: 0.06, g: 0.05, b: 0.11 },
    inhaleGlow: { r: 0.85, g: 0.65, b: 0.98 },  // iridescent violet
    holdLuster: { r: 0.98, g: 0.88, b: 1.0 },   // diamond prism
    exhaleCool: { r: 0.32, g: 0.25, b: 0.55 },  // astral indigo
    accent: { r: 0.65, g: 0.78, b: 0.98 }       // periwinkle celestial
  }
];
