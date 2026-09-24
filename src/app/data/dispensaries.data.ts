// Retail partners currently carrying Lead Farmer product, grouped by region for the
// Story page's directory. Update this list as the footprint changes — no other file
// needs to change when a dispensary is added, moved, or removed.

export interface Dispensary {
  name: string;
  location: string;
  url?: string;
}

export interface DispensaryRegion {
  region: string;
  dispensaries: Dispensary[];
}

export const DISPENSARY_REGIONS: DispensaryRegion[] = [
  {
    region: 'Hudson Valley',
    dispensaries: [
      { name: 'Cannabis Realm', location: 'White Plains & Spring Valley' },
      { name: 'Treehouse Cannabis', location: 'Nyack' },
      { name: 'Valley Greens', location: 'Peekskill' }
    ]
  },
  {
    region: 'Capital Region & North Country',
    dispensaries: [
      { name: 'Windy Hill Wellness', location: 'Greenwich' },
      { name: 'The Bakery', location: 'Cohoes' },
      { name: 'Elevate ADK', location: 'Saranac Lake' }
    ]
  },
  {
    region: 'Southern Tier & Finger Lakes',
    dispensaries: [
      { name: 'Greenery Spot', location: 'Johnson City' },
      { name: 'Misfits Dispensary', location: 'Rochester' },
      { name: 'Finger Lakes Cannabis Co.', location: 'Victor' }
    ]
  },
  {
    region: 'Long Island',
    dispensaries: [
      { name: 'Happy Days', location: 'Farmingdale' }
    ]
  },
  {
    region: 'New York City',
    dispensaries: [
      { name: 'Good Daze', location: 'Little Neck, Queens' },
      { name: 'Terp Bros', location: 'Astoria, Queens' },
      { name: 'Green Apple', location: 'Greenpoint, Brooklyn' },
      { name: 'Twenty8Gramz', location: 'Brooklyn' },
      { name: 'Mighty Lucky', location: 'Lower Manhattan' },
      { name: 'Torches NYC', location: 'Midtown Manhattan' }
    ]
  }
];
