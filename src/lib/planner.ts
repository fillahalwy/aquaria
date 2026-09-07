export interface TankDimensions {
  length: number; // in cm
  width: number;  // in cm
  height: number; // in cm
}

export interface TankPreset {
  id: string;
  name: string;
  subtitle: string;
  dimensions: TankDimensions;
  category: "nano" | "standard" | "large";
}

export interface PlannerInputs {
  dimensions: TankDimensions;
  substrateDepth: number; // in cm (default: 4)
  hasCo2: boolean;        // high-tech vs low-tech
  aquascapeStyle: string; // e.g. "nature", "iwagumi", "dutch", "lowtech"
}

export interface PlannerResults {
  // Volume
  grossVolumeLiters: number;
  grossVolumeGallons: number;
  netVolumeLiters: number;
  netVolumeGallons: number;
  
  // Substrate
  substrateVolumeLiters: number;
  substrateBags9L: number;
  substrateBags3L: number;
  
  // Lighting
  lumensPerLiter: number;
  targetLumens: number;
  estimatedWatts: number;
  lightingClassification: "Low" | "Medium" | "High";
  
  // Filtration
  recommendedFlowMinLpH: number;
  recommendedFlowMaxLpH: number;
  
  // Bioload
  maxSchoolingFish: number;
  maxDwarfShrimp: number;
}

export const TANK_PRESETS: TankPreset[] = [
  {
    id: "mini-s",
    name: "ADA Mini S",
    subtitle: "30 × 18 × 24 cm",
    dimensions: { length: 30, width: 18, height: 24 },
    category: "nano",
  },
  {
    id: "nano-cube-30",
    name: "Nano Cube 30",
    subtitle: "30 × 30 × 30 cm",
    dimensions: { length: 30, width: 30, height: 30 },
    category: "nano",
  },
  {
    id: "ada-45p",
    name: "ADA 45P",
    subtitle: "45 × 27 × 30 cm",
    dimensions: { length: 45, width: 27, height: 30 },
    category: "nano",
  },
  {
    id: "ada-60p",
    name: "ADA 60P",
    subtitle: "60 × 30 × 36 cm",
    dimensions: { length: 60, width: 30, height: 36 },
    category: "standard",
  },
  {
    id: "ada-90p",
    name: "ADA 90P",
    subtitle: "90 × 45 × 45 cm",
    dimensions: { length: 90, width: 45, height: 45 },
    category: "standard",
  },
  {
    id: "ada-120p",
    name: "ADA 120P",
    subtitle: "120 × 50 × 50 cm",
    dimensions: { length: 120, width: 50, height: 50 },
    category: "large",
  },
];

export const AQUASCAPE_STYLES = [
  {
    id: "nature",
    name: "Nature Aquarium",
    description: "Inspired by natural wild landscapes with driftwood and moss.",
  },
  {
    id: "iwagumi",
    name: "Iwagumi Style",
    description: "Zen stone architecture with carpeting plants like Monte Carlo.",
  },
  {
    id: "dutch",
    name: "Dutch Planted",
    description: "Dense terrace garden with colorful contrasting stem plants.",
  },
  {
    id: "jungle",
    name: "Jungle / Biotope",
    description: "Lush, wild growth mimicking natural rivers with minimal trimming.",
  },
];

const LITERS_TO_GALLONS = 0.264172;

export function calculatePlannerResults(inputs: PlannerInputs): PlannerResults {
  const { dimensions, substrateDepth, hasCo2 } = inputs;
  const length = Math.max(1, dimensions.length);
  const width = Math.max(1, dimensions.width);
  const height = Math.max(1, dimensions.height);
  const depth = Math.max(0.5, substrateDepth);

  // 1. Gross Volume
  const grossVolumeLiters = Number(((length * width * height) / 1000).toFixed(1));
  const grossVolumeGallons = Number((grossVolumeLiters * LITERS_TO_GALLONS).toFixed(1));

  // 2. Net Volume (assuming 15% reduction for hardscape and substrate displacement)
  const netVolumeLiters = Number((grossVolumeLiters * 0.85).toFixed(1));
  const netVolumeGallons = Number((netVolumeLiters * LITERS_TO_GALLONS).toFixed(1));

  // 3. Substrate Volume
  const substrateVolumeLiters = Number(((length * width * depth) / 1000).toFixed(1));
  const substrateBags9L = Math.ceil(substrateVolumeLiters / 9);
  const substrateBags3L = Math.ceil(substrateVolumeLiters / 3);

  // 4. Lighting Requirement
  // Low-Tech: 25 Lumens/L, High-Tech (CO2): 45 Lumens/L
  const lumensPerLiter = hasCo2 ? 45 : 25;
  const targetLumens = Math.round(netVolumeLiters * lumensPerLiter);
  // Average LED efficiency: 90 Lumens/Watt
  const estimatedWatts = Math.round(targetLumens / 90);
  const lightingClassification: "Low" | "Medium" | "High" = hasCo2
    ? "High"
    : grossVolumeLiters > 100
    ? "Medium"
    : "Low";

  // 5. Filtration Turnover (5x to 10x gross volume per hour)
  const recommendedFlowMinLpH = Math.round(grossVolumeLiters * 5);
  const recommendedFlowMaxLpH = Math.round(grossVolumeLiters * 10);

  // 6. Bioload Safety Capacity
  // ~2 Liters of net water per small schooling fish (e.g. Cardinal Tetra)
  const maxSchoolingFish = Math.max(1, Math.floor(netVolumeLiters / 2));
  // ~1.5 dwarf shrimp per net liter
  const maxDwarfShrimp = Math.max(2, Math.floor(netVolumeLiters * 1.5));

  return {
    grossVolumeLiters,
    grossVolumeGallons,
    netVolumeLiters,
    netVolumeGallons,
    substrateVolumeLiters,
    substrateBags9L,
    substrateBags3L,
    lumensPerLiter,
    targetLumens,
    estimatedWatts,
    lightingClassification,
    recommendedFlowMinLpH,
    recommendedFlowMaxLpH,
    maxSchoolingFish,
    maxDwarfShrimp,
  };
}
