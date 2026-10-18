import { createScriptedConnection } from './scripted';

export { createScriptedConnection } from './scripted';
export { LINK_STEPS, LinkError, isAbort } from './types';
export type { Connection, LinkProgress, LinkStep } from './types';

/** The connection the app uses unless <App connection={...} /> is given another. */
export const scriptedConnection = createScriptedConnection();
