import type { EmissionFactor, Category } from '@/types'

// All 28 emission factors (IPCC 2023 / UK DEFRA)
export const EMISSION_FACTORS: Record<string, EmissionFactor> = {
  // ── TRANSPORT ───────────────────────────────────────────
  car_petrol:   { category: 'transport', subType: 'car_petrol',   label: 'Car (petrol)',         co2PerUnit: 0.21,   unit: 'km',          source: 'IPCC 2023' },
  car_diesel:   { category: 'transport', subType: 'car_diesel',   label: 'Car (diesel)',         co2PerUnit: 0.17,   unit: 'km',          source: 'IPCC 2023' },
  car_electric: { category: 'transport', subType: 'car_electric', label: 'Car (electric)',       co2PerUnit: 0.05,   unit: 'km',          source: 'IPCC 2023' },
  bus:          { category: 'transport', subType: 'bus',          label: 'Bus',                  co2PerUnit: 0.089,  unit: 'km',          source: 'IPCC 2023' },
  metro:        { category: 'transport', subType: 'metro',        label: 'Metro / subway',       co2PerUnit: 0.033,  unit: 'km',          source: 'IPCC 2023' },
  motorbike:    { category: 'transport', subType: 'motorbike',    label: 'Motorbike',            co2PerUnit: 0.113,  unit: 'km',          source: 'IPCC 2023' },
  bicycle:      { category: 'transport', subType: 'bicycle',      label: 'Bicycle',              co2PerUnit: 0.0,    unit: 'km',          source: 'IPCC 2023' },
  walk:         { category: 'transport', subType: 'walk',         label: 'Walking',              co2PerUnit: 0.0,    unit: 'km',          source: 'IPCC 2023' },
  // ── FOOD ─────────────────────────────────────────────────
  beef:         { category: 'food', subType: 'beef',         label: 'Beef meal',         co2PerUnit: 6.61,  unit: 'meal', source: 'IPCC 2023' },
  chicken:      { category: 'food', subType: 'chicken',      label: 'Chicken meal',      co2PerUnit: 1.57,  unit: 'meal', source: 'IPCC 2023' },
  fish:         { category: 'food', subType: 'fish',         label: 'Fish meal',         co2PerUnit: 1.34,  unit: 'meal', source: 'IPCC 2023' },
  pork:         { category: 'food', subType: 'pork',         label: 'Pork meal',         co2PerUnit: 2.15,  unit: 'meal', source: 'IPCC 2023' },
  vegetarian:   { category: 'food', subType: 'vegetarian',   label: 'Vegetarian meal',   co2PerUnit: 0.87,  unit: 'meal', source: 'IPCC 2023' },
  vegan:        { category: 'food', subType: 'vegan',        label: 'Vegan meal',        co2PerUnit: 0.56,  unit: 'meal', source: 'IPCC 2023' },
  // ── ENERGY ───────────────────────────────────────────────
  electricity_grid:  { category: 'energy', subType: 'electricity_grid',  label: 'Grid electricity (India)', co2PerUnit: 0.82,  unit: 'kWh',         source: 'CEA India 2023' },
  electricity_solar: { category: 'energy', subType: 'electricity_solar', label: 'Solar electricity',        co2PerUnit: 0.04,  unit: 'kWh',         source: 'IPCC 2023' },
  natural_gas:       { category: 'energy', subType: 'natural_gas',       label: 'Natural gas',              co2PerUnit: 2.04,  unit: 'cubic_meter', source: 'IPCC 2023' },
  lpg:               { category: 'energy', subType: 'lpg',               label: 'LPG cooking',              co2PerUnit: 1.51,  unit: 'kg',          source: 'IPCC 2023' },
  // ── TRAVEL ───────────────────────────────────────────────
  flight_domestic: { category: 'travel', subType: 'flight_domestic', label: 'Domestic flight',    co2PerUnit: 0.255, unit: 'km', source: 'IPCC 2023' },
  flight_short:    { category: 'travel', subType: 'flight_short',    label: 'Short-haul flight',  co2PerUnit: 0.195, unit: 'km', source: 'IPCC 2023' },
  flight_long:     { category: 'travel', subType: 'flight_long',     label: 'Long-haul flight',   co2PerUnit: 0.150, unit: 'km', source: 'IPCC 2023' },
  train:           { category: 'travel', subType: 'train',           label: 'Train travel',       co2PerUnit: 0.041, unit: 'km', source: 'IPCC 2023' },
  // ── SHOPPING ─────────────────────────────────────────────
  clothing:      { category: 'shopping', subType: 'clothing',      label: 'Clothing item',  co2PerUnit: 6.3,   unit: 'item', source: 'IPCC 2023' },
  electronics:   { category: 'shopping', subType: 'electronics',   label: 'Electronics',    co2PerUnit: 125.0, unit: 'item', source: 'IPCC 2023' },
  online_order:  { category: 'shopping', subType: 'online_order',  label: 'Online order',   co2PerUnit: 0.5,   unit: 'item', source: 'IPCC 2023' },
  // ── WASTE ────────────────────────────────────────────────
  general_waste: { category: 'waste', subType: 'general_waste', label: 'General waste (landfill)', co2PerUnit: 0.587, unit: 'kg', source: 'IPCC 2023' },
  recycled:      { category: 'waste', subType: 'recycled',      label: 'Recycled waste',           co2PerUnit: 0.021, unit: 'kg', source: 'IPCC 2023' },
  // ── HOME ─────────────────────────────────────────────────
  heating_oil:  { category: 'home', subType: 'heating_oil',  label: 'Home heating oil', co2PerUnit: 2.54,  unit: 'liter', source: 'IPCC 2023' },
  wood_burning: { category: 'home', subType: 'wood_burning', label: 'Wood burning',     co2PerUnit: 0.39,  unit: 'kg',   source: 'IPCC 2023' },
}

// Get factors by category
export function getFactorsByCategory(category: Category): EmissionFactor[] {
  return Object.values(EMISSION_FACTORS).filter(f => f.category === category)
}

// All categories in order
export const CATEGORIES: Category[] = ['transport', 'food', 'energy', 'shopping', 'waste', 'travel', 'home']
