import fs from 'fs';

function readJsonFile(path) {
  const exists = fs.existsSync(path);
  if (exists) {
    const file = fs.readFileSync(path);
    const data = JSON.parse(file);
    return data;
  }
  return null;
}

function writeJsonFile(path, data, cb) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFile(path, json, (err) => {
    if (err) throw err;
    if (cb) cb();
  });
}
export { readJsonFile, writeJsonFile };
