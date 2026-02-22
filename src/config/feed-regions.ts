/**
 * Maps RSS feed sources to geographic regions and countries.
 * Used for filtering news panels by geographic location.
 */

export interface FeedRegionMapping {
  source: string;
  countryCodes?: string[];  // ISO 3166-1 alpha-2
  regions?: string[];       // Continent/region identifiers
  cities?: string[];        // City names (lowercase)
}

export const FEED_REGION_MAPPINGS: FeedRegionMapping[] = [
  // United States
  { source: 'NPR News', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'AP News', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'CNN World', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'White House', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'State Dept', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Pentagon', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'CISA', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Treasury', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'DOJ', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'DHS', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'CDC', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'FEMA', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Federal Reserve', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'SEC', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Politico', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Defense One', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Breaking Defense', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'The War Zone', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'Military Times', countryCodes: ['US'], regions: ['north-america'] },
  { source: 'USNI News', countryCodes: ['US'], regions: ['north-america'] },

  // United Kingdom
  { source: 'BBC World', countryCodes: ['GB'], regions: ['europe'] },
  { source: 'BBC Middle East', countryCodes: ['GB'], regions: ['europe', 'middle-east'] },
  { source: 'Guardian World', countryCodes: ['GB'], regions: ['europe'] },
  { source: 'Guardian ME', countryCodes: ['GB'], regions: ['europe', 'middle-east'] },
  { source: 'Financial Times', countryCodes: ['GB'], regions: ['europe'] },
  { source: 'UK MOD', countryCodes: ['GB'], regions: ['europe'] },

  // France
  { source: 'France 24', countryCodes: ['FR'], regions: ['europe'] },
  { source: 'Le Monde', countryCodes: ['FR'], regions: ['europe'] },
  { source: 'AFP', countryCodes: ['FR'], regions: ['europe'] },

  // Germany
  { source: 'DW News', countryCodes: ['DE'], regions: ['europe'] },
  { source: 'Tagesschau', countryCodes: ['DE'], regions: ['europe'] },
  { source: 'Der Spiegel', countryCodes: ['DE'], regions: ['europe'] },
  { source: 'Die Zeit', countryCodes: ['DE'], regions: ['europe'] },

  // Spain
  { source: 'El País', countryCodes: ['ES'], regions: ['europe'] },
  { source: 'El Mundo', countryCodes: ['ES'], regions: ['europe'] },
  { source: 'BBC Mundo', countryCodes: ['ES'], regions: ['europe', 'latin-america'] },

  // Italy
  { source: 'ANSA', countryCodes: ['IT'], regions: ['europe'] },
  { source: 'Corriere della Sera', countryCodes: ['IT'], regions: ['europe'] },
  { source: 'Repubblica', countryCodes: ['IT'], regions: ['europe'] },

  // Netherlands
  { source: 'NOS Nieuws', countryCodes: ['NL'], regions: ['europe'] },
  { source: 'NRC', countryCodes: ['NL'], regions: ['europe'] },
  { source: 'De Telegraaf', countryCodes: ['NL'], regions: ['europe'] },

  // Sweden
  { source: 'SVT Nyheter', countryCodes: ['SE'], regions: ['europe'] },
  { source: 'Dagens Nyheter', countryCodes: ['SE'], regions: ['europe'] },
  { source: 'Svenska Dagbladet', countryCodes: ['SE'], regions: ['europe'] },

  // Poland
  { source: 'TVN24', countryCodes: ['PL'], regions: ['europe'] },
  { source: 'Polsat News', countryCodes: ['PL'], regions: ['europe'] },
  { source: 'Rzeczpospolita', countryCodes: ['PL'], regions: ['europe'] },

  // Russia
  { source: 'BBC Russian', countryCodes: ['RU'], regions: ['europe'] },
  { source: 'Meduza', countryCodes: ['RU'], regions: ['europe'] },
  { source: 'Novaya Gazeta Europe', countryCodes: ['RU'], regions: ['europe'] },
  { source: 'TASS', countryCodes: ['RU'], regions: ['europe'] },

  // Turkey
  { source: 'BBC Turkce', countryCodes: ['TR'], regions: ['europe', 'middle-east'] },
  { source: 'DW Turkish', countryCodes: ['TR'], regions: ['europe', 'middle-east'] },
  { source: 'Hurriyet', countryCodes: ['TR'], regions: ['europe', 'middle-east'] },

  // Ukraine
  { source: 'Kyiv Independent', countryCodes: ['UA'], regions: ['europe'] },

  // Middle East
  { source: 'Al Jazeera', countryCodes: ['QA'], regions: ['middle-east'] },
  { source: 'Al Arabiya', countryCodes: ['SA'], regions: ['middle-east'] },
  { source: 'BBC Persian', countryCodes: ['IR'], regions: ['middle-east'] },
  { source: 'Iran International', countryCodes: ['IR'], regions: ['middle-east'] },
  { source: 'Fars News', countryCodes: ['IR'], regions: ['middle-east'] },
  { source: 'Haaretz', countryCodes: ['IL'], regions: ['middle-east'] },
  { source: 'Arab News', countryCodes: ['SA'], regions: ['middle-east'] },
  { source: 'L\'Orient-Le Jour', countryCodes: ['LB'], regions: ['middle-east'] },

  // Asia
  { source: 'Xinhua', countryCodes: ['CN'], regions: ['asia'] },
  { source: 'MIIT (China)', countryCodes: ['CN'], regions: ['asia'] },
  { source: 'MOFCOM (China)', countryCodes: ['CN'], regions: ['asia'] },
  { source: 'Bangkok Post', countryCodes: ['TH'], regions: ['asia'] },
  { source: 'Thai PBS', countryCodes: ['TH'], regions: ['asia'] },
  { source: 'VnExpress', countryCodes: ['VN'], regions: ['asia'] },
  { source: 'Tuoi Tre News', countryCodes: ['VN'], regions: ['asia'] },
  { source: 'ABC News Australia', countryCodes: ['AU'], regions: ['asia'] },
  { source: 'Guardian Australia', countryCodes: ['AU'], regions: ['asia'] },
  { source: 'The Diplomat', regions: ['asia'] },

  // Latin America
  { source: 'Buenos Aires Times', countryCodes: ['AR'], regions: ['latin-america'] },
  { source: 'Infobae', countryCodes: ['AR'], regions: ['latin-america'] },

  // Africa
  { source: 'AllAfrica', regions: ['africa'] },
  { source: 'Africa News', regions: ['africa'] },
  { source: 'Jeune Afrique', regions: ['africa'] },

  // International/Global (no specific region)
  { source: 'Reuters', regions: [] },
  { source: 'Reuters World', regions: [] },
  { source: 'Reuters Business', regions: [] },
  { source: 'Bloomberg', regions: [] },
  { source: 'UN News', regions: [] },
  { source: 'EuroNews', regions: [] },
  { source: 'WHO', regions: [] },
  { source: 'UNHCR', regions: [] },
  { source: 'IAEA', regions: [] },
];

/**
 * Get feeds that match a geographic region
 */
export function getFeedsForRegion(regionId: string, countryCodes?: string[]): Set<string> {
  const matchingSources = new Set<string>();

  // Global always shows all feeds
  if (regionId === 'global') {
    return matchingSources;
  }

  // Add sources that match the region or country
  FEED_REGION_MAPPINGS.forEach(mapping => {
    // Check country code match
    if (countryCodes && mapping.countryCodes) {
      const hasMatch = countryCodes.some(cc => mapping.countryCodes?.includes(cc));
      if (hasMatch) {
        matchingSources.add(mapping.source);
        return;
      }
    }

    // Check region match
    if (mapping.regions?.includes(regionId)) {
      matchingSources.add(mapping.source);
    }
  });

  // Always include global sources (those with empty regions)
  FEED_REGION_MAPPINGS.forEach(mapping => {
    if (!mapping.regions || mapping.regions.length === 0) {
      matchingSources.add(mapping.source);
    }
  });

  return matchingSources;
}
