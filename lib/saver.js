const NodeZip = require('node-zip');
const fs = require('fs');

const saver = (filepath, DNA) => {
  const zip = new NodeZip();
  zip.file('DNA.json', JSON.stringify(DNA));

  // write the file
  const data = zip.generate({ base64: false, compression: 'DEFLATE' });
  fs.writeFileSync(filepath, data, 'binary');
};

module.exports = saver;
