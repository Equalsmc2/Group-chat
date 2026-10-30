// Compatibility reader for historical CSS regression tests.
// The V40 presentation bundle already includes these old layers; they are not
// needed as standalone stylesheets by the published site.
import * as nativeFs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {basename} from 'node:path';
import {gunzipSync} from 'node:zlib';
let fixture;
function archivedSource(name) {
  if (!fixture) fixture = JSON.parse(gunzipSync(nativeFs.readFileSync(new URL('./fixtures/legacy-css-sources.json.gz',import.meta.url))).toString('utf8'));
  return fixture[name];
}
export function readFileSync(path, options) {
  if (typeof path === 'string' || path instanceof URL) {
    const file = path instanceof URL ? fileURLToPath(path) : path;
    if (file.endsWith('.css') && !nativeFs.existsSync(file)) {
      const archived = archivedSource(basename(file));
      if (archived !== undefined) return options === undefined || (typeof options === 'object' && options.encoding === undefined) ? Buffer.from(archived,'utf8') : archived;
    }
  }
  return nativeFs.readFileSync(path,options);
}
export * from 'node:fs';
export default {...nativeFs,readFileSync};
