// Google Maps Platform Configuration & Constants
// Adheres to Zero-Legacy Mandate and GMP Agent Skills Governance

export const GOOGLE_MAPS_API_KEY: string =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyCC1BP0F0pH6qNhcACeTysGEdSn_PWmw38';

export const GOOGLE_MAPS_MAP_ID: string = 'DEMO_MAP_ID';

export const GMP_ATTRIBUTION_IDS: string[] = ['gmp_git_agentskills_v1'];
