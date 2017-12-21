const NodeZip = require('node-zip');
const fs = require('fs');

const saver = (filepath, genes) => {
  const zip = new NodeZip();
  zip.file('genes.json', JSON.stringify(genes));

  // write the file
  const data = zip.generate({ base64: false, compression: 'DEFLATE' });
  fs.writeFileSync(filepath, data, 'binary');
};

module.exports = saver;
