const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const wizardSeed = require(path.join(libDir, 'wizard-seed'));

// program basics
program
  .option('-o, --output <dir>', 'output directory')
  .parse(process.argv);

wizardSeed(program.output);
