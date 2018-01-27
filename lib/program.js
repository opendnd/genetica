const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const pinfo = require(path.join(rootDir, 'package.json'));

// program basics
program
  .version(pinfo.version, '-v, --version')
  .description(pinfo.description)
  .command('generate', 'generate DNA', { isDefault: true })
  .alias('gen')
  .command('child', 'generate child DNA')
  .command('parents', 'generate parents DNA')
  .command('seed', 'generate a DNA seed file')
  .parse(process.argv);
