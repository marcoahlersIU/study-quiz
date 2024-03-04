import path from 'path';
import { readJsonFile, writeJsonFile } from './utils/json.js';

function runManifestUpdate() {
  const { version } = readJsonFile(path.join('.', 'schema.manifest.json'));

  const migrationManifest = {
    version,
    migratedAt: Date.now(),
  };
  writeJsonFile(path.join('.', 'migration.manifest.json'), migrationManifest, () => {
    console.log('Updated migration.manifest.json');
  });
}

runManifestUpdate();
