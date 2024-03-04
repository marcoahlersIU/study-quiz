import { exec } from 'child_process';
import path from 'path';
import { readJsonFile, writeJsonFile } from './utils/json.js';

function runManifestChecks() {
  const { version: currentSchemaVersion } = readJsonFile(path.join('.', 'schema.manifest.json'));
  const migrationManifest = readJsonFile(path.join('.', 'migration.manifest.json'));
  if (!migrationManifest || currentSchemaVersion > migrationManifest.version) {
    console.log('Newer schema version found. Running migrations...');
    exec('npm run migrate', (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
      } else {
        console.log(stdout);
        const json = {
          version: currentSchemaVersion,
          migratedAt: Date.now(),
        };
        writeJsonFile(path.join('.', 'migration.manifest.json'), json, () => {
          console.log('Updated migration.manifest.json');
        });
      }
    });
  } else {
    console.log('Nothing to migrate. Current schema version is used.');
  }
}

runManifestChecks();
