import path from 'path';
import { readJsonFile, writeJsonFile } from './utils/json.js';

function runManifestUpdate() {
  const { version } = readJsonFile(path.join('.', 'schema.manifest.json'));

  const nextVersion = version + 1;
  const nextCreatedAt = Date.now();
  const next = {
    version: nextVersion,
    createdAt: nextCreatedAt,
  };
  writeJsonFile(path.join('.', 'schema.manifest.json'), next, () => {
    console.log('Updated schema.manifest.json');
  });
}

runManifestUpdate();
