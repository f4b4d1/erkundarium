import { fileURLToPath } from 'node:url';

/** Der Inhaltsordner `content/` als absoluter Pfad mit abschließendem Trenner. */
export const INHALTSORDNER = fileURLToPath(new URL('../content/', import.meta.url));
