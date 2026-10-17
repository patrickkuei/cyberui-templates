import type { Settings } from './types';

// MOCK: the two switches are kept in memory so they respond when pressed, and
// that is all. No notification is scheduled, requested or shown, and there is
// no remote access. The unit is real: it changes how temperatures are shown.
export const DEFAULT_SETTINGS: Settings = {
  unit: 'C',
  alertOffline: true,
  remoteAccess: false,
};
