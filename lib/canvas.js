/**
 * JAT Canvas Pages — Backward compatibility re-exports from lib/bases.js.
 *
 * The canvas and bases data models have been unified into a single `bases`
 * table in data.db. All canvas CRUD and serialization functions are now
 * in lib/bases.js. This file re-exports them for existing import paths.
 */

import basesModule from './bases.js';

export const {
  listCanvasPages,
  getCanvasPage,
  createCanvasPage,
  updateCanvasPage,
  deleteCanvasPage,
  listCanvasBasePages,
  serializeCanvasToMarkdown,
} = basesModule;

export default {
  listCanvasPages,
  getCanvasPage,
  createCanvasPage,
  updateCanvasPage,
  deleteCanvasPage,
  listCanvasBasePages,
  serializeCanvasToMarkdown,
};
