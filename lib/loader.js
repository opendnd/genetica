const fs = require('fs');
const NodeZip = require('node-zip');

const loader = (filepath) => {
  const ext = filepath.substr(filepath.length - 4);

  // validate the file
  if (!fs.existsSync(filepath)) throw new Error('File not found!');

  // validate the extension
  if (ext !== '.dna') throw new Error('File not correct extension!');

  const zip = new NodeZip(fs.readFileSync(filepath), { base64: false, checkCRC32: true });

  // check for valid file
  if (Object.keys(zip.files).indexOf('DNA.json') < 0) throw new Error('File corrupt!');

  // if it's valid let's continue
  return JSON.parse(zip.files['DNA.json']._data);
};

module.exports = loader;
