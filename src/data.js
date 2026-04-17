/**
 * TerraLens — Environmental Data
 * Real environmental data sourced from public datasets
 * (World Bank, NASA, NOAA, IUCN, Global Forest Watch)
 */

// Regional environmental hotspots with real data
export const hotspots = [
  {
    id: 'amazon',
    name: 'Amazon Rainforest',
    lat: -3.4653,
    lng: -62.2159,
    flag: '🇧🇷',
    category: 'deforestation',
    severity: 'high',
    data: {
      co2: { value: 2.1, unit: 'Gt CO₂/yr', label: 'Carbon Release' },
      forestLoss: { value: 1.02, unit: 'M ha/yr', label: 'Forest Loss' },
      biodiversity: { value: 427, unit: 'species', label: 'Threatened Species' },
      temperature: { value: 1.2, unit: '°C', label: 'Temp Anomaly' }
    },
    description: 'Home to 10% of all species on Earth. Experiencing accelerated deforestation threatening vast carbon stores.'
  },
  {
    id: 'arctic',
    name: 'Arctic Region',
    lat: 75.0,
    lng: 0.0,
    flag: '🧊',
    category: 'emissions',
    severity: 'high',
    data: {
      co2: { value: 0, unit: '', label: '' },
      iceExtent: { value: -13.1, unit: '%/decade', label: 'Sea Ice Loss' },
      temperature: { value: 3.8, unit: '°C', label: 'Temp Anomaly' },
      seaLevel: { value: 3.6, unit: 'mm/yr', label: 'Sea Level Rise' }
    },
    description: 'Warming 4x faster than the global average. Sea ice extent has declined dramatically since satellite records began.'
  },
  {
    id: 'great-barrier',
    name: 'Great Barrier Reef',
    lat: -18.2871,
    lng: 147.6992,
    flag: '🇦🇺',
    category: 'ocean',
    severity: 'high',
    data: {
      coralBleaching: { value: 62, unit: '% affected', label: 'Coral Bleaching' },
      oceanTemp: { value: 1.1, unit: '°C', label: 'Ocean Warming' },
      biodiversity: { value: 1500, unit: 'species', label: 'Fish Species' },
      acidification: { value: 8.07, unit: 'pH', label: 'Ocean Acidity' }
    },
    description: 'World\'s largest coral reef system. Mass bleaching events are becoming more frequent due to ocean warming.'
  },
  {
    id: 'congo',
    name: 'Congo Basin',
    lat: -0.7893,
    lng: 21.9617,
    flag: '🇨🇩',
    category: 'deforestation',
    severity: 'high',
    data: {
      co2: { value: 1.5, unit: 'Gt CO₂', label: 'Carbon Stored' },
      forestLoss: { value: 0.64, unit: 'M ha/yr', label: 'Forest Loss' },
      biodiversity: { value: 280, unit: 'species', label: 'Threatened Species' },
      temperature: { value: 1.0, unit: '°C', label: 'Temp Anomaly' }
    },
    description: 'Second-largest tropical forest. A critical carbon sink now under increasing pressure from deforestation.'
  },
  {
    id: 'india',
    name: 'India — South Asia',
    lat: 20.5937,
    lng: 78.9629,
    flag: '🇮🇳',
    category: 'emissions',
    severity: 'high',
    data: {
      co2: { value: 2.88, unit: 'Gt CO₂/yr', label: 'CO₂ Emissions' },
      airQuality: { value: 96.6, unit: 'µg/m³ PM2.5', label: 'Air Pollution' },
      renewables: { value: 42, unit: '% share', label: 'Renewable Capacity' },
      temperature: { value: 0.7, unit: '°C', label: 'Temp Anomaly' }
    },
    description: 'World\'s 3rd largest emitter but also a leader in solar expansion. Faces severe air pollution challenges.'
  },
  {
    id: 'sahel',
    name: 'Sahel Region',
    lat: 14.4974,
    lng: 2.6274,
    flag: '🏜️',
    category: 'biodiversity',
    severity: 'high',
    data: {
      desertification: { value: 12, unit: 'M ha/yr', label: 'Land Degradation' },
      temperature: { value: 1.5, unit: '°C', label: 'Temp Anomaly' },
      waterStress: { value: 'Extreme', unit: '', label: 'Water Stress' },
      foodInsecurity: { value: 33, unit: 'M people', label: 'Food Insecure' }
    },
    description: 'One of the most climate-vulnerable regions. Desertification and drought threaten millions of lives.'
  },
  {
    id: 'southeast-asia',
    name: 'Southeast Asia',
    lat: 2.5,
    lng: 112.0,
    flag: '🇮🇩',
    category: 'deforestation',
    severity: 'high',
    data: {
      forestLoss: { value: 0.82, unit: 'M ha/yr', label: 'Forest Loss' },
      palmOil: { value: 17, unit: 'M ha', label: 'Palm Oil Plantations' },
      biodiversity: { value: 584, unit: 'species', label: 'Threatened Species' },
      peatFires: { value: 1.8, unit: 'Gt CO₂', label: 'Peat Fire Emissions' }
    },
    description: 'Rapid deforestation driven by palm oil expansion. Peatland fires release massive greenhouse gases.'
  },
  {
    id: 'china',
    name: 'China — East Asia',
    lat: 35.8617,
    lng: 104.1954,
    flag: '🇨🇳',
    category: 'emissions',
    severity: 'high',
    data: {
      co2: { value: 11.47, unit: 'Gt CO₂/yr', label: 'CO₂ Emissions' },
      renewables: { value: 52, unit: '% of new capacity', label: 'Renewable Growth' },
      airQuality: { value: 42.1, unit: 'µg/m³ PM2.5', label: 'Air Pollution' },
      solarCapacity: { value: 609, unit: 'GW', label: 'Solar Capacity' }
    },
    description: 'World\'s largest emitter AND largest renewable energy investor. A complex climate story.'
  },
  {
    id: 'pacific-islands',
    name: 'Pacific Islands',
    lat: -8.0,
    lng: 170.0,
    flag: '🏝️',
    category: 'ocean',
    severity: 'high',
    data: {
      seaLevel: { value: 4.8, unit: 'mm/yr', label: 'Sea Level Rise' },
      coralBleaching: { value: 50, unit: '% affected', label: 'Coral Bleaching' },
      atRisk: { value: 3.5, unit: 'M people', label: 'Population at Risk' },
      temperature: { value: 1.2, unit: '°C', label: 'Ocean Warming' }
    },
    description: 'Frontline of climate change. Rising seas threaten the existence of entire island nations.'
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    lat: -82.8628,
    lng: 0.0,
    flag: '🏔️',
    category: 'ocean',
    severity: 'high',
    data: {
      iceLoss: { value: 150, unit: 'Gt/yr', label: 'Ice Sheet Loss' },
      temperature: { value: 2.5, unit: '°C', label: 'Temp Anomaly' },
      seaLevel: { value: 0.55, unit: 'mm/yr', label: 'Sea Level Contribution' },
      ozone: { value: 23.4, unit: 'M km²', label: 'Ozone Hole Area' }
    },
    description: 'Contains 70% of Earth\'s freshwater in ice. Accelerating ice loss threatens global sea levels.'
  },
  {
    id: 'usa',
    name: 'United States',
    lat: 37.0902,
    lng: -95.7129,
    flag: '🇺🇸',
    category: 'emissions',
    severity: 'medium',
    data: {
      co2: { value: 5.01, unit: 'Gt CO₂/yr', label: 'CO₂ Emissions' },
      renewables: { value: 24, unit: '%', label: 'Renewable Share' },
      wildfires: { value: 7.1, unit: 'M acres/yr', label: 'Wildfire Area' },
      temperature: { value: 1.3, unit: '°C', label: 'Temp Anomaly' }
    },
    description: '2nd largest historical emitter. Experiencing more frequent extreme weather events and wildfires.'
  },
  {
    id: 'europe',
    name: 'Europe',
    lat: 50.1109,
    lng: 10.1508,
    flag: '🇪🇺',
    category: 'emissions',
    severity: 'medium',
    data: {
      co2: { value: 3.3, unit: 'Gt CO₂/yr', label: 'CO₂ Emissions' },
      renewables: { value: 38, unit: '%', label: 'Renewable Share' },
      heatWaves: { value: '+3.5', unit: '°C above avg', label: 'Heat Extremes' },
      greenDeal: { value: 55, unit: '% reduction target', label: '2030 Climate Target' }
    },
    description: 'Leading in climate policy with the EU Green Deal. But extreme heat events are becoming more deadly.'
  },
  {
    id: 'madagascar',
    name: 'Madagascar',
    lat: -18.7669,
    lng: 46.8691,
    flag: '🇲🇬',
    category: 'biodiversity',
    severity: 'high',
    data: {
      endemic: { value: 90, unit: '% endemic', label: 'Unique Species' },
      forestLoss: { value: 0.44, unit: 'M ha since 2001', label: 'Forest Lost' },
      threatened: { value: 614, unit: 'species', label: 'Threatened Species' },
      temperature: { value: 1.0, unit: '°C', label: 'Temp Anomaly' }
    },
    description: '90% of wildlife found nowhere else on Earth. Rapid deforestation threatens this biodiversity hotspot.'
  },
  {
    id: 'middle-east',
    name: 'Middle East',
    lat: 29.3117,
    lng: 47.4818,
    flag: '🏜️',
    category: 'emissions',
    severity: 'medium',
    data: {
      co2PerCapita: { value: 23.1, unit: 't CO₂/person', label: 'Per Capita Emissions' },
      temperature: { value: 1.5, unit: '°C', label: 'Temp Anomaly' },
      waterStress: { value: 'Critical', unit: '', label: 'Water Stress' },
      solarPotential: { value: 2400, unit: 'kWh/m²/yr', label: 'Solar Potential' }
    },
    description: 'Among the highest per-capita emitters globally. Extreme heat and water scarcity are existential threats.'
  }
];

// Layer color configurations
export const layerColors = {
  emissions: {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
    ring: 'rgba(239, 68, 68, 0.3)',
    glow: 'rgba(239, 68, 68, 0.6)'
  },
  deforestation: {
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    ring: 'rgba(34, 197, 94, 0.3)',
    glow: 'rgba(34, 197, 94, 0.6)'
  },
  ocean: {
    high: '#06b6d4',
    medium: '#3b82f6',
    low: '#22d3ee',
    ring: 'rgba(6, 182, 212, 0.3)',
    glow: 'rgba(6, 182, 212, 0.6)'
  },
  biodiversity: {
    high: '#a855f7',
    medium: '#d946ef',
    low: '#f0abfc',
    ring: 'rgba(168, 85, 247, 0.3)',
    glow: 'rgba(168, 85, 247, 0.6)'
  }
};

// Global environmental stats for the dashboard
export const globalStats = {
  co2: { value: 423.5, unit: 'ppm', label: 'CO₂ Concentration', trend: '↑ +2.4/yr', trendType: 'up' },
  temperature: { value: 1.45, unit: '°C', label: 'Temperature Anomaly', trend: '↑ +0.18/decade', trendType: 'up' },
  forestLoss: { value: 4.7, unit: 'M ha/yr', label: 'Forest Loss', trend: '↓ -10% vs 2020', trendType: 'down' },
  species: { value: 44088, unit: 'species', label: 'Threatened Species', trend: '↑ +1,200/yr', trendType: 'up' }
};

// Connection arcs — showing flows between regions (emissions, deforestation trade, etc.)
export const connectionArcs = [
  { startLat: 35.86, startLng: 104.19, endLat: 37.09, endLng: -95.71, color: 'rgba(239, 68, 68, 0.3)', label: 'Trade emissions' },
  { startLat: 2.5, startLng: 112.0, endLat: 50.11, endLng: 10.15, color: 'rgba(249, 115, 22, 0.3)', label: 'Palm oil trade' },
  { startLat: -3.46, startLng: -62.21, endLat: 50.11, endLng: 10.15, color: 'rgba(34, 197, 94, 0.3)', label: 'Deforestation-linked goods' },
  { startLat: 20.59, startLng: 78.96, endLat: 29.31, endLng: 47.48, color: 'rgba(245, 158, 11, 0.3)', label: 'Energy trade' },
];
